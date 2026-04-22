// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

// solhint-disable use-natspec, gas-indexed-events, immutable-vars-naming, named-parameters-mapping
// solhint-disable gas-increment-by-one, gas-strict-inequalities, gas-custom-errors, max-line-length

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
        FundingProven,
        RepaymentProven,
        Defaulted,
        Cancelled,
        FundingSubmitted,
        RepaymentSubmitted
    }

    struct RequestMeta {
        address borrower;
        uint64 dueAt;
        uint64 biddingEndsAt;
        bytes32 invoiceRefHash;
        RequestStatus status;
        uint32 bidCount;
        address acceptedLender;
        bool hasAnyBid;
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
        ebool fundingSuccess;
        ebool repaymentSuccess;
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
    error BlindFactorNoBid(uint256 requestId);
    error BlindFactorUnauthorizedHandle(address caller);
    error BlindFactorInvalidDecryptionProof();

    event RequestCreated(
        uint256 indexed requestId,
        address indexed borrower,
        uint64 dueAt,
        uint64 biddingEndsAt,
        bytes32 invoiceRefHash
    );
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
        requestPrivate.fundingSuccess = FHE.asEbool(false);
        requestPrivate.repaymentSuccess = FHE.asEbool(false);

        _grantBorrowerAndContractAccess(requestPrivate.invoiceAmount, msg.sender);
        _grantBorrowerAndContractAccess(requestPrivate.minPayout, msg.sender);
        _grantBorrowerAndContractAccess(requestPrivate.winningPayout, msg.sender);
        _grantBorrowerAndContractAccess(requestPrivate.winningRepaymentAtDue, msg.sender);
        FHE.allowThis(requestPrivate.winningBidId);
        FHE.allow(requestPrivate.winningBidId, msg.sender);
        FHE.allowThis(requestPrivate.fundingSuccess);
        FHE.allow(requestPrivate.fundingSuccess, msg.sender);
        FHE.allowThis(requestPrivate.repaymentSuccess);
        FHE.allow(requestPrivate.repaymentSuccess, msg.sender);

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

        meta.hasAnyBid = true;
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

        _requestPrivates[requestId].winningBidId = FHE.makePubliclyDecryptable(
            _requestPrivates[requestId].winningBidId
        );
        FHE.allowThis(_requestPrivates[requestId].winningBidId);
        FHE.allow(_requestPrivates[requestId].winningBidId, meta.borrower);

        meta.status = RequestStatus.WinnerComputed;
        emit BiddingClosed(requestId);
    }

    function acceptWinningBid(uint256 requestId, uint32 winningBidIdClear, bytes calldata decryptionProof) external {
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
        if (!meta.hasAnyBid) {
            revert BlindFactorNoBid(requestId);
        }
        if (winningBidIdClear >= meta.bidCount || winningBidIdClear == INVALID_BID_ID) {
            revert BlindFactorInvalidBidId(winningBidIdClear);
        }

        RequestPrivate storage requestPrivate = _requestPrivates[requestId];
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(requestPrivate.winningBidId);
        FHE.checkSignatures(handles, abi.encode(uint256(winningBidIdClear)), decryptionProof);

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
        (, ebool fundingSuccess) = settlementToken.marketTransferFrom(
            msg.sender,
            meta.borrower,
            requestPrivate.winningPayout
        );
        requestPrivate.fundingSuccess = FHE.makePubliclyDecryptable(fundingSuccess);
        FHE.allowThis(requestPrivate.fundingSuccess);
        FHE.allow(requestPrivate.fundingSuccess, meta.borrower);
        FHE.allow(requestPrivate.fundingSuccess, msg.sender);

        meta.status = RequestStatus.FundingSubmitted;
        emit RequestFunded(requestId, msg.sender);
    }

    function proveFunding(uint256 requestId, bool fundingSucceeded, bytes calldata decryptionProof) external {
        RequestMeta storage meta = _requestMeta(requestId);
        if (!(msg.sender == meta.borrower || msg.sender == meta.acceptedLender)) {
            revert BlindFactorUnauthorizedHandle(msg.sender);
        }
        if (meta.status != RequestStatus.FundingSubmitted) {
            revert BlindFactorInvalidStatus(meta.status);
        }

        RequestPrivate storage requestPrivate = _requestPrivates[requestId];
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(requestPrivate.fundingSuccess);
        FHE.checkSignatures(handles, abi.encode(uint256(fundingSucceeded ? 1 : 0)), decryptionProof);
        if (!fundingSucceeded) {
            revert BlindFactorInvalidDecryptionProof();
        }

        meta.status = RequestStatus.FundingProven;
    }

    function markRepaid(uint256 requestId) external {
        RequestMeta storage meta = _requestMeta(requestId);
        if (msg.sender != meta.borrower) {
            revert BlindFactorNotBorrower(msg.sender);
        }
        if (meta.status != RequestStatus.FundingProven) {
            revert BlindFactorInvalidStatus(meta.status);
        }
        if (meta.acceptedLender == address(0)) {
            revert BlindFactorNoAcceptedLender(requestId);
        }

        RequestPrivate storage requestPrivate = _requestPrivates[requestId];
        FHE.allowTransient(requestPrivate.winningRepaymentAtDue, address(settlementToken));
        (, ebool repaymentSuccess) = settlementToken.marketTransferFrom(
            msg.sender,
            meta.acceptedLender,
            requestPrivate.winningRepaymentAtDue
        );
        requestPrivate.repaymentSuccess = FHE.makePubliclyDecryptable(repaymentSuccess);
        FHE.allowThis(requestPrivate.repaymentSuccess);
        FHE.allow(requestPrivate.repaymentSuccess, msg.sender);
        FHE.allow(requestPrivate.repaymentSuccess, meta.acceptedLender);

        meta.status = RequestStatus.RepaymentSubmitted;
        emit RequestRepaid(requestId, msg.sender);
    }

    function proveRepayment(uint256 requestId, bool repaymentSucceeded, bytes calldata decryptionProof) external {
        RequestMeta storage meta = _requestMeta(requestId);
        if (!(msg.sender == meta.borrower || msg.sender == meta.acceptedLender)) {
            revert BlindFactorUnauthorizedHandle(msg.sender);
        }
        if (meta.status != RequestStatus.RepaymentSubmitted) {
            revert BlindFactorInvalidStatus(meta.status);
        }

        RequestPrivate storage requestPrivate = _requestPrivates[requestId];
        bytes32[] memory handles = new bytes32[](1);
        handles[0] = FHE.toBytes32(requestPrivate.repaymentSuccess);
        FHE.checkSignatures(handles, abi.encode(uint256(repaymentSucceeded ? 1 : 0)), decryptionProof);
        if (!repaymentSucceeded) {
            revert BlindFactorInvalidDecryptionProof();
        }

        meta.status = RequestStatus.RepaymentProven;
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
            revert BlindFactorUnauthorizedHandle(msg.sender);
        }
        return _requestPrivates[requestId].winningRepaymentAtDue;
    }

    function getFundingSuccessHandle(uint256 requestId) external view returns (ebool) {
        RequestMeta storage meta = _requestMeta(requestId);
        if (!(msg.sender == meta.borrower || msg.sender == meta.acceptedLender)) {
            revert BlindFactorUnauthorizedHandle(msg.sender);
        }
        return _requestPrivates[requestId].fundingSuccess;
    }

    function getRepaymentSuccessHandle(uint256 requestId) external view returns (ebool) {
        RequestMeta storage meta = _requestMeta(requestId);
        if (!(msg.sender == meta.borrower || msg.sender == meta.acceptedLender)) {
            revert BlindFactorUnauthorizedHandle(msg.sender);
        }
        return _requestPrivates[requestId].repaymentSuccess;
    }

    function getRequestPrivateHandles(
        uint256 requestId
    ) external view returns (euint64 invoiceAmount, euint64 minPayout) {
        RequestMeta storage meta = _requestMeta(requestId);
        if (msg.sender != meta.borrower) {
            revert BlindFactorNotBorrower(msg.sender);
        }
        RequestPrivate storage requestPrivate = _requestPrivates[requestId];
        return (requestPrivate.invoiceAmount, requestPrivate.minPayout);
    }

    function getOwnBidHandles(
        uint256 requestId,
        uint32 bidId
    ) external view returns (euint64 payoutNow, euint64 repaymentAtDue) {
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
