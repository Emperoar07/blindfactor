import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import type { BlindFactorMarket, BlindFactorToken } from "../types";

type Signers = {
  owner: HardhatEthersSigner;
  borrower: HardhatEthersSigner;
  lenderA: HardhatEthersSigner;
  lenderB: HardhatEthersSigner;
  lenderC: HardhatEthersSigner;
};

describe("BlindFactorMarket", function () {
  let signers: Signers;
  let token: BlindFactorToken;
  let market: BlindFactorMarket;
  let tokenAddress: string;
  let marketAddress: string;

  async function createRequestInputs(user: HardhatEthersSigner, invoiceAmount: number, minPayout: number) {
    return fhevm.createEncryptedInput(marketAddress, user.address).add64(invoiceAmount).add64(minPayout).encrypt();
  }

  async function createBidInputs(user: HardhatEthersSigner, payoutNow: number, repaymentAtDue: number) {
    return fhevm.createEncryptedInput(marketAddress, user.address).add64(payoutNow).add64(repaymentAtDue).encrypt();
  }

  async function publicDecryptWinningBidId(requestId: number) {
    const winningBidIdHandle = await market.connect(signers.borrower).getWinningBidIdHandle(requestId);
    const publicDecryption = await fhevm.publicDecrypt([winningBidIdHandle]);
    const winningBidId = publicDecryption.clearValues[winningBidIdHandle];
    return {
      winningBidId: Number(winningBidId),
      decryptionProof: publicDecryption.decryptionProof,
    };
  }

  async function publicDecryptBool(handle: string) {
    const publicDecryption = await fhevm.publicDecrypt([handle]);
    return {
      value: Boolean(publicDecryption.clearValues[handle]),
      decryptionProof: publicDecryption.decryptionProof,
    };
  }

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = {
      owner: ethSigners[0],
      borrower: ethSigners[1],
      lenderA: ethSigners[2],
      lenderB: ethSigners[3],
      lenderC: ethSigners[4],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This hardhat test suite cannot run on Sepolia Testnet");
      this.skip();
    }

    token = await ethers.deployContract("BlindFactorToken", [signers.owner.address, "https://blindfactor.app/token"]);
    await token.waitForDeployment();
    tokenAddress = await token.getAddress();

    market = await ethers.deployContract("BlindFactorMarket", [tokenAddress]);
    await market.waitForDeployment();
    marketAddress = await market.getAddress();

    await token.connect(signers.owner).setMarket(marketAddress);
    await token.connect(signers.owner).mint(signers.lenderA.address, 10_000);
    await token.connect(signers.owner).mint(signers.lenderB.address, 10_000);
    await token.connect(signers.owner).mint(signers.lenderC.address, 10_000);
    await token.connect(signers.owner).mint(signers.borrower.address, 2_000);
  });

  it("borrower can create a request and decrypt request private outputs", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-001"));

    const meta = await market.getRequestMeta(0);
    expect(meta.borrower).to.eq(signers.borrower.address);
    expect(meta.bidCount).to.eq(0);
    expect(meta.status).to.eq(0);

    const [invoiceHandle, minPayoutHandle] = await market.connect(signers.borrower).getRequestPrivateHandles(0);
    const invoiceAmount = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      invoiceHandle,
      marketAddress,
      signers.borrower,
    );
    const minPayout = await fhevm.userDecryptEuint(FhevmType.euint64, minPayoutHandle, marketAddress, signers.borrower);

    expect(invoiceAmount).to.eq(10_000n);
    expect(minPayout).to.eq(7_000n);
  });

  it("tracks the best valid bid incrementally and lets each lender decrypt only their own bid", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-002"));

    const bidA = await createBidInputs(signers.lenderA, 6_500, 6_900);
    await market.connect(signers.lenderA).submitBid(0, bidA.handles[0], bidA.handles[1], bidA.inputProof);

    const bidB = await createBidInputs(signers.lenderB, 8_000, 8_800);
    await market.connect(signers.lenderB).submitBid(0, bidB.handles[0], bidB.handles[1], bidB.inputProof);

    const bidC = await createBidInputs(signers.lenderC, 7_500, 8_100);
    await market.connect(signers.lenderC).submitBid(0, bidC.handles[0], bidC.handles[1], bidC.inputProof);

    const meta = await market.getRequestMeta(0);
    expect(meta.bidCount).to.eq(3);

    const [lenderBId, lenderBExists] = await market.getLenderBidId(0, signers.lenderB.address);
    expect(lenderBExists).to.eq(true);
    const [bidPayoutHandle, bidRepaymentHandle] = await market.connect(signers.lenderB).getOwnBidHandles(0, lenderBId);

    const lenderBPayout = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      bidPayoutHandle,
      marketAddress,
      signers.lenderB,
    );
    const lenderBRepayment = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      bidRepaymentHandle,
      marketAddress,
      signers.lenderB,
    );

    expect(lenderBPayout).to.eq(8_000n);
    expect(lenderBRepayment).to.eq(8_800n);

    await expect(fhevm.userDecryptEuint(FhevmType.euint64, bidPayoutHandle, marketAddress, signers.borrower)).to.be
      .rejected;
  });

  it("lets the borrower decrypt the winner, accept it, fund the request, and repay it", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-003"));

    const bidA = await createBidInputs(signers.lenderA, 6_500, 7_100);
    await market.connect(signers.lenderA).submitBid(0, bidA.handles[0], bidA.handles[1], bidA.inputProof);

    const bidB = await createBidInputs(signers.lenderB, 8_000, 9_000);
    await market.connect(signers.lenderB).submitBid(0, bidB.handles[0], bidB.handles[1], bidB.inputProof);

    const bidC = await createBidInputs(signers.lenderC, 7_500, 8_400);
    await market.connect(signers.lenderC).submitBid(0, bidC.handles[0], bidC.handles[1], bidC.inputProof);

    await market.connect(signers.borrower).closeBidding(0);

    const winningBidIdHandle = await market.connect(signers.borrower).getWinningBidIdHandle(0);
    const winningPayoutHandle = await market.connect(signers.borrower).getWinningPayoutHandle(0);
    const winningRepaymentHandle = await market.connect(signers.borrower).getWinningRepaymentHandle(0);

    const winningBidId = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      winningBidIdHandle,
      marketAddress,
      signers.borrower,
    );
    const winningPayout = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      winningPayoutHandle,
      marketAddress,
      signers.borrower,
    );
    const winningRepayment = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      winningRepaymentHandle,
      marketAddress,
      signers.borrower,
    );

    expect(winningBidId).to.eq(1n);
    expect(winningPayout).to.eq(8_000n);
    expect(winningRepayment).to.eq(9_000n);

    const { decryptionProof } = await publicDecryptWinningBidId(0);
    await market.connect(signers.borrower).acceptWinningBid(0, Number(winningBidId), decryptionProof);

    let meta = await market.getRequestMeta(0);
    expect(meta.acceptedLender).to.eq(signers.lenderB.address);

    await market.connect(signers.lenderB).fundAcceptedRequest(0);

    meta = await market.getRequestMeta(0);
    expect(meta.status).to.eq(7);

    const fundingSuccessHandle = await market.connect(signers.borrower).getFundingSuccessHandle(0);
    const fundingProof = await publicDecryptBool(fundingSuccessHandle);
    expect(fundingProof.value).to.eq(true);
    await market.connect(signers.borrower).proveFunding(0, true, fundingProof.decryptionProof);

    meta = await market.getRequestMeta(0);
    expect(meta.status).to.eq(3);

    const borrowerBalanceHandle = await token.confidentialBalanceOf(signers.borrower.address);
    const lenderBBalanceHandle = await token.confidentialBalanceOf(signers.lenderB.address);
    const borrowerBalanceAfterFunding = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      borrowerBalanceHandle,
      tokenAddress,
      signers.borrower,
    );
    const lenderBBalanceAfterFunding = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      lenderBBalanceHandle,
      tokenAddress,
      signers.lenderB,
    );

    expect(borrowerBalanceAfterFunding).to.eq(10_000n);
    expect(lenderBBalanceAfterFunding).to.eq(2_000n);

    await market.connect(signers.borrower).markRepaid(0);

    meta = await market.getRequestMeta(0);
    expect(meta.status).to.eq(8);

    const repaymentSuccessHandle = await market.connect(signers.borrower).getRepaymentSuccessHandle(0);
    const repaymentProof = await publicDecryptBool(repaymentSuccessHandle);
    expect(repaymentProof.value).to.eq(true);
    await market.connect(signers.borrower).proveRepayment(0, true, repaymentProof.decryptionProof);

    meta = await market.getRequestMeta(0);
    expect(meta.status).to.eq(4);

    const borrowerBalanceAfterRepaymentHandle = await token.confidentialBalanceOf(signers.borrower.address);
    const lenderBBalanceAfterRepaymentHandle = await token.confidentialBalanceOf(signers.lenderB.address);
    const borrowerBalanceAfterRepayment = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      borrowerBalanceAfterRepaymentHandle,
      tokenAddress,
      signers.borrower,
    );
    const lenderBBalanceAfterRepayment = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      lenderBBalanceAfterRepaymentHandle,
      tokenAddress,
      signers.lenderB,
    );

    expect(borrowerBalanceAfterRepayment).to.eq(1_000n);
    expect(lenderBBalanceAfterRepayment).to.eq(11_000n);
  });

  it("fundAcceptedRequest stores a true fundingSuccess handle the borrower can decrypt", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-004"));

    const bidA = await createBidInputs(signers.lenderA, 8_000, 9_000);
    await market.connect(signers.lenderA).submitBid(0, bidA.handles[0], bidA.handles[1], bidA.inputProof);
    await market.connect(signers.borrower).closeBidding(0);

    const winningBidIdHandle = await market.connect(signers.borrower).getWinningBidIdHandle(0);
    const winningBidId = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      winningBidIdHandle,
      marketAddress,
      signers.borrower,
    );
    const { decryptionProof } = await publicDecryptWinningBidId(0);
    await market.connect(signers.borrower).acceptWinningBid(0, Number(winningBidId), decryptionProof);
    await market.connect(signers.lenderA).fundAcceptedRequest(0);

    const fundingSuccessHandle = await market.connect(signers.borrower).getFundingSuccessHandle(0);
    const fundingSuccess = await fhevm.userDecryptEbool(fundingSuccessHandle, marketAddress, signers.borrower);
    expect(fundingSuccess).to.eq(true);
  });

  it("hasAnyBid is false before any bid and true after a bid is submitted", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-005"));

    let meta = await market.getRequestMeta(0);
    expect(meta.hasAnyBid).to.eq(false);

    const bidA = await createBidInputs(signers.lenderA, 8_000, 9_000);
    await market.connect(signers.lenderA).submitBid(0, bidA.handles[0], bidA.handles[1], bidA.inputProof);

    meta = await market.getRequestMeta(0);
    expect(meta.hasAnyBid).to.eq(true);
  });

  it("rejects acceptWinningBid when no bids have been submitted", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-006"));
    await market.connect(signers.borrower).closeBidding(0);

    await expect(market.connect(signers.borrower).acceptWinningBid(0, 0, "0x")).to.be.revertedWithCustomError(
      market,
      "BlindFactorNoBid",
    );
  });

  it("rejects borrower bidding on their own request", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-007"));

    const bid = await createBidInputs(signers.borrower, 8_000, 9_000);
    await expect(
      market.connect(signers.borrower).submitBid(0, bid.handles[0], bid.handles[1], bid.inputProof),
    ).to.be.revertedWithCustomError(market, "BlindFactorBorrowerCannotBid");
  });

  it("rejects duplicate bids from the same lender", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-008"));

    const bid1 = await createBidInputs(signers.lenderA, 8_000, 9_000);
    await market.connect(signers.lenderA).submitBid(0, bid1.handles[0], bid1.handles[1], bid1.inputProof);

    const bid2 = await createBidInputs(signers.lenderA, 8_500, 9_500);
    await expect(
      market.connect(signers.lenderA).submitBid(0, bid2.handles[0], bid2.handles[1], bid2.inputProof),
    ).to.be.revertedWithCustomError(market, "BlindFactorDuplicateBid");
  });

  it("rejects closeBidding from a non-borrower before deadline", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-009"));

    await expect(market.connect(signers.lenderA).closeBidding(0)).to.be.revertedWithCustomError(
      market,
      "BlindFactorBiddingStillOpen",
    );
  });

  it("rejects acceptWinningBid from a non-borrower", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-010"));

    const bid = await createBidInputs(signers.lenderA, 8_000, 9_000);
    await market.connect(signers.lenderA).submitBid(0, bid.handles[0], bid.handles[1], bid.inputProof);
    await market.connect(signers.borrower).closeBidding(0);

    await expect(market.connect(signers.lenderA).acceptWinningBid(0, 0, "0x")).to.be.revertedWithCustomError(
      market,
      "BlindFactorNotBorrower",
    );
  });

  it("rejects accepting a different bid id than the verified encrypted winner", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-015"));

    const bidA = await createBidInputs(signers.lenderA, 7_500, 8_400);
    await market.connect(signers.lenderA).submitBid(0, bidA.handles[0], bidA.handles[1], bidA.inputProof);
    const bidB = await createBidInputs(signers.lenderB, 8_000, 9_000);
    await market.connect(signers.lenderB).submitBid(0, bidB.handles[0], bidB.handles[1], bidB.inputProof);
    await market.connect(signers.borrower).closeBidding(0);

    const { decryptionProof } = await publicDecryptWinningBidId(0);
    await expect(market.connect(signers.borrower).acceptWinningBid(0, 0, decryptionProof)).to.be.reverted;
  });

  it("rejects getWinningPayoutHandle from a non-borrower", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-011"));

    await expect(market.connect(signers.lenderA).getWinningPayoutHandle(0)).to.be.revertedWithCustomError(
      market,
      "BlindFactorNotBorrower",
    );
  });

  it("rejects getWinningRepaymentHandle from a non-participant", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-012"));

    await expect(market.connect(signers.lenderA).getWinningRepaymentHandle(0)).to.be.revertedWithCustomError(
      market,
      "BlindFactorUnauthorizedHandle",
    );
  });

  it("rejects fundAcceptedRequest from a non-accepted lender", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-013"));

    const bidA = await createBidInputs(signers.lenderA, 8_000, 9_000);
    await market.connect(signers.lenderA).submitBid(0, bidA.handles[0], bidA.handles[1], bidA.inputProof);
    await market.connect(signers.borrower).closeBidding(0);
    const { winningBidId, decryptionProof } = await publicDecryptWinningBidId(0);
    await market.connect(signers.borrower).acceptWinningBid(0, winningBidId, decryptionProof);

    await expect(market.connect(signers.lenderB).fundAcceptedRequest(0)).to.be.revertedWithCustomError(
      market,
      "BlindFactorNotAcceptedLender",
    );
  });

  it("does not prove funding when the accepted lender lacks enough confidential balance", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 20_000, 15_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-016"));

    const bidA = await createBidInputs(signers.lenderA, 15_000, 17_000);
    await market.connect(signers.lenderA).submitBid(0, bidA.handles[0], bidA.handles[1], bidA.inputProof);
    await market.connect(signers.borrower).closeBidding(0);

    const { winningBidId, decryptionProof } = await publicDecryptWinningBidId(0);
    await market.connect(signers.borrower).acceptWinningBid(0, winningBidId, decryptionProof);
    await market.connect(signers.lenderA).fundAcceptedRequest(0);

    let meta = await market.getRequestMeta(0);
    expect(meta.status).to.eq(7);

    const fundingSuccessHandle = await market.connect(signers.borrower).getFundingSuccessHandle(0);
    const fundingProof = await publicDecryptBool(fundingSuccessHandle);
    expect(fundingProof.value).to.eq(false);
    await expect(
      market.connect(signers.borrower).proveFunding(0, false, fundingProof.decryptionProof),
    ).to.be.revertedWithCustomError(market, "BlindFactorInvalidDecryptionProof");

    meta = await market.getRequestMeta(0);
    expect(meta.status).to.eq(7);
  });

  it("rejects getOwnBidHandles from a non-bidder", async function () {
    const dueAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const biddingEndsAt = dueAt - 24 * 60 * 60;
    const enc = await createRequestInputs(signers.borrower, 10_000, 7_000);

    await market
      .connect(signers.borrower)
      .createRequest(enc.handles[0], enc.handles[1], enc.inputProof, dueAt, biddingEndsAt, ethers.id("INV-014"));

    const bidA = await createBidInputs(signers.lenderA, 8_000, 9_000);
    await market.connect(signers.lenderA).submitBid(0, bidA.handles[0], bidA.handles[1], bidA.inputProof);

    await expect(market.connect(signers.lenderB).getOwnBidHandles(0, 0)).to.be.revertedWithCustomError(
      market,
      "BlindFactorInvalidBidId",
    );
  });
});
