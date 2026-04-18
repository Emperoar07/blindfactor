import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const DEMO_LIQUIDITY = 25_000;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, execute } = hre.deployments;
  const signers = await hre.ethers.getSigners();

  const deployedBlindFactorToken = await deploy("BlindFactorToken", {
    from: deployer,
    args: [deployer, "https://blindfactor.app/token"],
    log: true,
  });

  const deployedBlindFactorMarket = await deploy("BlindFactorMarket", {
    from: deployer,
    args: [deployedBlindFactorToken.address],
    log: true,
  });

  await execute("BlindFactorToken", { from: deployer, log: true }, "setMarket", deployedBlindFactorMarket.address);

  if (hre.network.name !== "hardhat") {
    const token = await hre.ethers.getContractAt("BlindFactorToken", deployedBlindFactorToken.address);
    const demoRecipients = signers.slice(1, Math.min(4, signers.length));
    if (demoRecipients.length === 0) {
      console.log("No additional signers available for demo liquidity minting; only deployer key configured.");
    } else {
      for (const signer of demoRecipients) {
        const mintTx = await token.connect(signers[0]).mint(signer.address, DEMO_LIQUIDITY);
        await mintTx.wait();
        console.log(`Minted ${DEMO_LIQUIDITY} bfUSD demo liquidity to ${signer.address}`);
      }
    }
  } else {
    console.log("Skipping demo liquidity mint on ephemeral hardhat network; use localhost or Sepolia deploy for funded wallets.");
  }

  console.log(`BlindFactorToken: ${deployedBlindFactorToken.address}`);
  console.log(`BlindFactorMarket: ${deployedBlindFactorMarket.address}`);
};

export default func;
func.id = "deploy_blindFactor";
func.tags = ["BlindFactor"];
