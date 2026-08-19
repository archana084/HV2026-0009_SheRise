import hre from "hardhat";

async function main() {
  console.log("Deploying TrustCredRegistry smart contract to the network...");

  const TrustCredRegistry = await hre.ethers.getContractFactory("TrustCredRegistry");
  const registry = await TrustCredRegistry.deploy();

  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("----------------------------------------------------");
  console.log("TrustCredRegistry successfully deployed!");
  console.log("Contract Address:", contractAddress);
  console.log("----------------------------------------------------");
  console.log("Next steps:");
  console.log("1. Copy the Contract Address above.");
  console.log("2. In TrustCred app, navigate to 'Blockchain Node & Network Settings'.");
  console.log("3. Paste the Contract Address and connect.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
