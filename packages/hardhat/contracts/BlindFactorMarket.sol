// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {FHE, ebool, euint32, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {BlindFactorToken} from "./BlindFactorToken.sol";

contract BlindFactorMarket is ZamaEthereumConfig {
    uint32 public constant MAX_BIDS_PER_REQUEST = 3;
    uint32 private constant INVALID_BID_ID = type(uint32).max;

    enum RequestStatus {
        Open,
        BiddingClosed,
        WinnerComputed,
        Funded,
        Repaid,
        Defaulted,
        Cancelled
    }

    struct RequestMeta {
        address borrower;
        uint64 dueAt;
        uint64 biddingEndsAt;
        bytes32 invoiceRefHash;
        RequestStatus status;
        uint32 bidCount;
        address acceptedLender;
    }

    struct BidMeta {
        address lender;
        uint32 requestId;
        bool exists;
        bool accepted;
    }

    struct RequestPrivate {
        euint64 invoiceAmount;
        euint64 minPayout;
        euint32 winningBidId;
        euint64 winningPayout;
        euint64 winningRepaymentAtDue;
    }

    struct BidPrivate {
        euint64 payoutNow;
        euint64 repaymentAtDue;
    }

    error BlindFactorInvalidRequest(uint256 requestId);
    error BlindFactorNotBorrower(address caller);
    error BlindFactorNotAcceptedLender(address caller);
    error BlindFactorInvalidStatus(RequestStatus status);
    error BlindFactorBiddingStillOpen(uint64 biddingEndsAt);
    error BlindFactorBiddingExpired(uint64 biddingEndsAt);
    error BlindFactorInvalidDeadline();
    error BlindFactorTooManyBids(uint256 requestId);
    error BlindFactorBorrowerCannotBid();
    error BlindFactorDuplicateBid(address lender);
    error BlindFactorNoAcceptedLender(uint256 requestId);
    error BlindFactorTokenUnset();
    error BlindFactorInvalidBidId(uint32 bidId);

    event RequestCreated(uint256 indexed requestId, address indexed borrower, uint64 dueAt, uint64 biddingEndsAt, bytes32 invoiceRefHash);
    event BidSubmitted(uint256 indexed requestId, uint32 indexed bidId, address indexed lender);
    event BiddingClosed(uint256 indexed requestId);
    event WinningBidAccepted(uint256 indexed requestId, uint32 indexed bidId, address indexed lender);
    event RequestFunded(uint256 indexed requestId, address indexed lender);
    event RequestRepaid(uint256 indexed requestId, address indexed borrower);

    BlindFactorToken public immutable settlementToken;
    uint256 public nextRequestId;

    mapping(uint256 requestId => RequestMeta) private _requestMetas;
    mapping(uint256 requestId => RequestPrivate) private _requestPrivates;
    mapping(uint256 requestId => mapping(uint32 bidId => BidMeta)) private _bidMetas;
    mapping(uint256 requestId => mapping(uint32 bidId => BidPrivate)) private _bidPrivates;
    mapping(uint256 requestId => mapping(address lender => uint32 bidIdPlusOne)) private _lenderBidIds;

    constructor(address settlementToken_) {
        if (settlementToken_ == address(0)) {
            revert BlindFactorTokenUnset();
        }
        settlementToken = BlindFactorToken(settlementToken_);
    }

    function createRequest(
        externalEuint64 encInvoiceAmount,
        externalEuint64 encMinPayout,
        bytes calldata inputProof,
        uint64 dueAt,
        uint64 biddingEndsAt,
        bytes32 invoiceRefHash
    ) external returns (uint256 requestId) {
        if (!(biddingEndsAt > block.timestamp && dueAt > biddingEndsAt)) {
            revert BlindFactorInvalidDeadline();
        }

        requestId = nextRequestId++;
        RequestMeta storage meta = _requestMetas[requestId];
        meta.borrower = msg.sender;
        meta.dueAt = dueAt;
        meta.biddingEndsAt = biddingEndsAt;
        meta.invoiceRefHash = invoiceRefHash;
        meta.status = RequestStatus.Open;

        RequestPrivate storage requestPrivate = _requestPrivates[requestId];
        requestPrivate.invoiceAmount = FHE.fromExternal(encInvoiceAmount, inputProof);
        requestPrivate.minPayout = FHE.fromExternal(encMinPayout, inputProof);
        requestPrivate.winningBidId = FHE.asEuint32(INVALID_BID_ID);
        requestPrivate.winningPayout = FHE.asEuint64(0);
        requestPrivate.winningRepaymentAtDue = FHE.asEuint64(0);

        _grantBorrowerAndContractAccess(requestPrivate.invoiceAmount, msg.sender);
        _grantBorrowerAndContractAccess(requestPrivate.minPayout, msg.sender);
        _grantBorrowerAndContractAccess(requestPrivate.winningPayout, msg.sender);
        _grantBorrowerAndContractAccess(requestPrivate.winningRepaymentAtDue, msg.sender);
        FHE.allowThis(requestPrivate.winningBidId);
        FHE.allow(requestPrivate.winningBidId, msg.sender);

        emit RequestCreated(requestId, msg.sender, dueAt, biddingEndsAt, invoiceRefHash);
    }

    function submitBid(
        uint256 requestId,
        externalEuint64 encPayoutNow,
        externalEuint64 encRepaymentAtDue,
        bytes calldata inputProof
    ) external {
        RequestMeta storage meta = _requestMeta(requestId);
        if (meta.status != RequestStatus.Open) {
            revert BlindFactorInvalidStatus(meta.status);
        }
        if (block.timestamp >= meta.biddingEndsAt) {
            revert BlindFactorBiddingExpired(meta.biddingEndsAt);
        }
        if (msg.sender == meta.borrower) {
            revert BlindFactorBorrowerCannotBid();
        }
        if (meta.bidCount >= MAX_BIDS_PER_REQUEST) {
            revert BlindFactorTooManyBids(requestId);
        }
        if (_lenderBidIds[requestId][msg.sender] != 0) {
            revert BlindFactorDuplicateBid(msg.sender);
        }

        uint32 bidId = meta.bidCount;
        meta.bidCount += 1;
        _lenderBidIds[requestId][msg.sender] = bidId + 1;

        BidMeta storage bidMeta = _bidMetas[requestId][bidId];
        bidMeta.lender = msg.sender;
        bidMeta.requestId = uint32(requestId);
        bidMeta.exists = true;

        BidPrivate storage bidPrivate = _bidPrivates[requestId][bidId];
        bidPrivate.payoutNow = FHE.fromExternal(encPayoutNow, inputProof);
        bidPrivate.repaymentAtDue = FHE.fromExternal(encRepaymentAtDue, inputProof);

        FHE.allowThis(bidPrivate.payoutNow);
        FHE.allow(bidPrivate.payoutNow, msg.sender);
        FHE.allowThis(bidPrivate.repaymentAtDue);
        FHE.allow(bidPrivate.repaymentAtDue, msg.sender);

        _updateWinningBid(requestId, bidId, meta.borrower, bidPrivate.payoutNow, bidPrivate.repaymentAtDue);

        emit BidSubmitted(requestId, bidId, msg.sender);
    }

    function closeBidding(uint256 requestId) external {
        RequestMeta storage meta = _requestMeta(requestId);
        if (meta.status != RequestStatus.Open) {
            revert BlindFactorInvalidStatus(meta.status);
        }
        if (!(msg.sender == meta.borrower || block.timestamp >= meta.biddingEndsAt)) {
            revert BlindFactorBiddingStillOpen(meta.biddingEndsAt);
        }

        meta.status = RequestStatus.WinnerComputed;
        emit BiddingClosed(requestId);
    }

    function acceptWinningBid(uint256 requestId, uint32 winningBidIdClear) external {
        RequestMeta storage meta = _requestMeta(requestId);
        if (msg.sender != meta.borrower) {
            revert BlindFactorNotBorrower(msg.sender);
        }
        if (meta.status != RequestStatus.WinnerComputed) {
            revert BlindFactorInvalidStatus(meta.status);
        }
        if (meta.acceptedLender != address(0)) {
            revert BlindFactorNoAcceptedLender(requestId);
        }
        if (winningBidIdClear >= meta.bidCount) {
            revert BlindFactorInvalidBidId(winningBidIdClear);
        }

        BidMeta storage bidMeta = _bidMetas[requestId][winningBidIdClear];
        if (!bidMeta.exists) {
            revert BlindFactorInvalidBidId(winningBidIdClear);
        }

        bidMeta.accepted = true;
        meta.acceptedLender = bidMeta.lender;

        emit WinningBidAccepted(requestId, winningBidIdClear, bidMeta.lender);
    }

    function fundAcceptedRequest(uint256 requestId) external {
        RequestMeta storage meta = _requestMeta(requestId);
        if (meta.status != RequestStatus.WinnerComputed) {
            revert BlindFactorInvalidStatus(meta.status);
        }
        if (meta.acceptedLender == address(0)) {
            revert BlindFactorNoAcceptedLender(requestId);
        }
        if (msg.sender != meta.acceptedLender) {
            revert BlindFactorNotAcceptedLender(msg.sender);
        }

        RequestPrivate storage requestPrivate = _requestPrivates[requestId];
        FHE.allowTransient(requestPrivate.winningPayout, address(settlementToken));
        settlementToken.marketTransferFrom(msg.sender, meta.borrower, requestPrivate.winningPayout);

        meta.status = RequestStatus.Funded;
        emit RequestFunded(requestId, msg.sender);
    }

    function markRepaid(uint256 requestId) external {
        RequestMeta storage meta = _requestMeta(requestId);
        if (msg.sender != meta.borrower) {
            revert BlindFactorNotBorrower(msg.sender);
        }
        if (meta.status != RequestStatus.Funded) {
            revert BlindFactorInvalidStatus(meta.status);
        }
        if (meta.acceptedLender == address(0)) {
            revert BlindFactorNoAcceptedLender(requestId);
        }

        RequestPrivate storage requestPrivate = _requestPrivates[requestId];
        FHE.allowTransient(requestPrivate.winningRepaymentAtDue, address(settlementToken));
        settlementToken.marketTransferFrom(msg.sender, meta.acceptedLender, requestPrivate.winningRepaymentAtDue);

        meta.status = RequestStatus.Repaid;
        emit RequestRepaid(requestId, msg.sender);
    }

    function getRequestMeta(uint256 requestId) external view returns (RequestMeta memory) {
        return _requestMeta(requestId);
    }

    function getBidMeta(uint256 requestId, uint32 bidId) external view returns (BidMeta memory) {
        _ensureRequestExists(requestId);
        return _bidMetas[requestId][bidId];
    }

    function getWinningBidIdHandle(uint256 requestId) external view returns (euint32) {
        RequestMeta storage meta = _requestMeta(requestId);
        if (msg.sender != meta.borrower) {
            revert BlindFactorNotBorrower(msg.sender);
        }
        return _requestPrivates[requestId].winningBidId;
    }

    function getWinningPayoutHandle(uint256 requestId) external view returns (euint64) {
        RequestMeta storage meta = _requestMeta(requestId);
        if (msg.sender != meta.borrower) {
            revert BlindFactorNotBorrower(msg.sender);
        }
        return _requestPrivates[requestId].winningPayout;
    }

    function getWinningRepaymentHandle(uint256 requestId) external view returns (euint64) {
        RequestMeta storage meta = _requestMeta(requestId);
        if (!(msg.sender == meta.borrower || msg.sender == meta.acceptedLender)) {
            revert BlindFactorNotBorrower(msg.sender);
        }
        return _requestPrivates[requestId].winningRepaymentAtDue;
    }

    function getRequestPrivateHandles(uint256 requestId) external view returns (euint64 invoiceAmount, euint64 minPayout) {
        RequestMeta storage meta = _requestMeta(requestId);
        if (msg.sender != meta.borrower) {
            revert BlindFactorNotBorrower(msg.sender);
        }
        RequestPrivate storage requestPrivate = _requestPrivates[requestId];
        return (requestPrivate.invoiceAmount, requestPrivate.minPayout);
    }

    function getOwnBidHandles(uint256 requestId, uint32 bidId) external view returns (euint64 payoutNow, euint64 repaymentAtDue) {
        _ensureRequestExists(requestId);
        BidMeta storage bidMeta = _bidMetas[requestId][bidId];
        if (bidMeta.lender != msg.sender) {
            revert BlindFactorInvalidBidId(bidId);
        }
        BidPrivate storage bidPrivate = _bidPrivates[requestId][bidId];
        return (bidPrivate.payoutNow, bidPrivate.repaymentAtDue);
    }

    function getLenderBidId(uint256 requestId, address lender) external view returns (uint32 bidId, bool exists) {
        _ensureRequestExists(requestId);
        uint32 bidIdPlusOne = _lenderBidIds[requestId][lender];
        if (bidIdPlusOne == 0) {
            return (0, false);
        }
        return (bidIdPlusOne - 1, true);
    }

    function _requestMeta(uint256 requestId) internal view returns (RequestMeta storage meta) {
        _ensureRequestExists(requestId);
        meta = _requestMetas[requestId];
    }

    function _ensureRequestExists(uint256 requestId) internal view {
        if (requestId >= nextRequestId) {
            revert BlindFactorInvalidRequest(requestId);
        }
    }

    function _updateWinningBid(
        uint256 requestId,
        uint32 bidId,
        address borrower,
        euint64 payoutNow,
        euint64 repaymentAtDue
    ) internal {
        RequestPrivate storage requestPrivate = _requestPrivates[requestId];

        ebool meetsMin = FHE.ge(payoutNow, requestPrivate.minPayout);
        euint64 candidatePayout = FHE.select(meetsMin, payoutNow, FHE.asEuint64(0));
        euint64 candidateRepayment = FHE.select(meetsMin, repaymentAtDue, FHE.asEuint64(0));
        ebool isBetter = FHE.gt(candidatePayout, requestPrivate.winningPayout);
        ebool shouldReplace = FHE.and(meetsMin, isBetter);

        requestPrivate.winningPayout = FHE.select(shouldReplace, candidatePayout, requestPrivate.winningPayout);
        requestPrivate.winningRepaymentAtDue = FHE.select(
            shouldReplace,
            candidateRepayment,
            requestPrivate.winningRepaymentAtDue
        );
        requestPrivate.winningBidId = FHE.select(shouldReplace, FHE.asEuint32(bidId), requestPrivate.winningBidId);

        _grantBorrowerAndContractAccess(requestPrivate.winningPayout, borrower);
        _grantBorrowerAndContractAccess(requestPrivate.winningRepaymentAtDue, borrower);
        FHE.allowThis(requestPrivate.winningBidId);
        FHE.allow(requestPrivate.winningBidId, borrower);
    }

    function _grantBorrowerAndContractAccess(euint64 value, address borrower) internal {
        FHE.allowThis(value);
        FHE.allow(value, borrower);
    }
}
