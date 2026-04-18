// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {FHE, ebool, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract BlindFactorToken is ZamaEthereumConfig, Ownable2Step {
    error BlindFactorTokenUnauthorizedMarket(address caller);
    error BlindFactorTokenInvalidMarket(address market);
    error BlindFactorTokenInvalidReceiver(address receiver);

    event ConfidentialTransfer(address indexed from, address indexed to);
    event MarketSet(address indexed market);

    string public constant name = "BlindFactor USD";
    string public constant symbol = "bfUSD";
    uint8 public constant decimals = 6;

    address public market;
    string public tokenURI;

    mapping(address account => euint64) private _balances;
    euint64 private _totalSupply;

    constructor(address owner_, string memory tokenURI_) Ownable(owner_) {
        tokenURI = tokenURI_;
    }

    modifier onlyMarket() {
        if (msg.sender != market) {
            revert BlindFactorTokenUnauthorizedMarket(msg.sender);
        }
        _;
    }

    function setMarket(address market_) external onlyOwner {
        if (market_ == address(0)) {
            revert BlindFactorTokenInvalidMarket(market_);
        }
        market = market_;
        emit MarketSet(market_);
    }

    function confidentialTotalSupply() external view returns (euint64) {
        return _totalSupply;
    }

    function confidentialBalanceOf(address account) external view returns (euint64) {
        return _balances[account];
    }

    function mint(address to, uint64 amount) external onlyOwner returns (euint64 transferred) {
        euint64 encryptedAmount = FHE.asEuint64(amount);
        transferred = _mint(to, encryptedAmount);
    }

    function confidentialTransfer(
        address to,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external returns (euint64 transferred) {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        transferred = _transfer(msg.sender, to, amount);
    }

    function confidentialTransfer(address to, euint64 amount) external returns (euint64 transferred) {
        require(FHE.isAllowed(amount, msg.sender), "Unauthorized encrypted amount");
        transferred = _transfer(msg.sender, to, amount);
    }

    function marketTransferFrom(
        address from,
        address to,
        euint64 amount
    ) external onlyMarket returns (euint64 transferred, ebool success) {
        require(FHE.isAllowed(amount, msg.sender), "Unauthorized encrypted amount");
        (transferred, success) = _transferWithResult(from, to, amount);
        FHE.allowTransient(transferred, msg.sender);
        FHE.allowTransient(success, msg.sender);
    }

    function _mint(address to, euint64 amount) internal returns (euint64 transferred) {
        if (to == address(0)) {
            revert BlindFactorTokenInvalidReceiver(to);
        }

        _totalSupply = FHE.add(_totalSupply, amount);
        FHE.allowThis(_totalSupply);

        transferred = amount;
        _balances[to] = FHE.add(_balances[to], transferred);
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);
        FHE.allowThis(transferred);
        FHE.allow(transferred, to);
        emit ConfidentialTransfer(address(0), to);
    }

    function _transfer(address from, address to, euint64 amount) internal returns (euint64 transferred) {
        (transferred, ) = _transferWithResult(from, to, amount);
    }

    function _transferWithResult(
        address from,
        address to,
        euint64 amount
    ) internal returns (euint64 transferred, ebool success) {
        if (to == address(0)) {
            revert BlindFactorTokenInvalidReceiver(to);
        }

        success = FHE.le(amount, _balances[from]);
        transferred = FHE.select(success, amount, FHE.asEuint64(0));

        _balances[from] = FHE.sub(_balances[from], transferred);
        _balances[to] = FHE.add(_balances[to], transferred);

        FHE.allowThis(_balances[from]);
        FHE.allow(_balances[from], from);
        FHE.allowThis(_balances[to]);
        FHE.allow(_balances[to], to);
        FHE.allowThis(transferred);
        FHE.allow(transferred, from);
        FHE.allow(transferred, to);
        FHE.allowThis(success);

        emit ConfidentialTransfer(from, to);
    }
}
