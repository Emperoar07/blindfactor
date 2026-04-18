import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  owner: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

describe("BlindFactorToken", function () {
  let signers: Signers;
  let token: any;
  let tokenAddress: string;

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = {
      owner: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
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

    await token.connect(signers.owner).mint(signers.alice.address, 5_000);
    await token.connect(signers.owner).mint(signers.bob.address, 1_000);
  });

  it("mints demo liquidity to lenders and lets holders decrypt balances", async function () {
    const aliceHandle = await token.confidentialBalanceOf(signers.alice.address);
    const bobHandle = await token.confidentialBalanceOf(signers.bob.address);

    const aliceBalance = await fhevm.userDecryptEuint(FhevmType.euint64, aliceHandle, tokenAddress, signers.alice);
    const bobBalance = await fhevm.userDecryptEuint(FhevmType.euint64, bobHandle, tokenAddress, signers.bob);

    expect(aliceBalance).to.eq(5_000n);
    expect(bobBalance).to.eq(1_000n);
  });

  it("supports confidential transfer from lender to borrower and back", async function () {
    const outbound = await fhevm
      .createEncryptedInput(tokenAddress, signers.alice.address)
      .add64(400)
      .encrypt();

    await token
      .connect(signers.alice)
      ["confidentialTransfer(address,bytes32,bytes)"](signers.bob.address, outbound.handles[0], outbound.inputProof);

    const returnLeg = await fhevm
      .createEncryptedInput(tokenAddress, signers.bob.address)
      .add64(125)
      .encrypt();

    await token
      .connect(signers.bob)
      ["confidentialTransfer(address,bytes32,bytes)"](signers.alice.address, returnLeg.handles[0], returnLeg.inputProof);

    const aliceHandle = await token.confidentialBalanceOf(signers.alice.address);
    const bobHandle = await token.confidentialBalanceOf(signers.bob.address);

    const aliceBalance = await fhevm.userDecryptEuint(FhevmType.euint64, aliceHandle, tokenAddress, signers.alice);
    const bobBalance = await fhevm.userDecryptEuint(FhevmType.euint64, bobHandle, tokenAddress, signers.bob);

    expect(aliceBalance).to.eq(4_725n);
    expect(bobBalance).to.eq(1_275n);
  });
});
