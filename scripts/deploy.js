const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Starting deployment...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", deployerBalance.toString());

  // Deploy Institution Registry
  console.log("\n1. Deploying InstitutionRegistry...");
  const InstitutionRegistryFactory = await hre.ethers.getContractFactory("InstitutionRegistry");
  const institutionRegistry = await InstitutionRegistryFactory.deploy();
  await institutionRegistry.waitForDeployment();
  const institutionRegistryAddress = await institutionRegistry.getAddress();
  console.log("✅ InstitutionRegistry deployed to:", institutionRegistryAddress);

  // Deploy Credential Registry
  console.log("\n2. Deploying CredentialRegistry...");
  const CredentialRegistryFactory = await hre.ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistryFactory.deploy(institutionRegistryAddress);
  await credentialRegistry.waitForDeployment();
  const credentialRegistryAddress = await credentialRegistry.getAddress();
  console.log("✅ CredentialRegistry deployed to:", credentialRegistryAddress);

  // Register sample institutions (optional for testnet)
  if (hre.network.name === "mumbai" || hre.network.name === "hardhat") {
    console.log("\n3. Registering sample institutions...");

    // Sample institution addresses (replace with real ones)
    const sampleInstitutions = [
      {
        address: "0x742d35Cc6634C0532925a3b8D91C75E7D8C60d50",
        name: "Harvard University",
        website: "https://harvard.edu"
      },
      {
        address: "0x8ba1f109551bD432803012645Hac136c31014511",
        name: "MIT",
        website: "https://mit.edu"
      }
    ];

    for (const institution of sampleInstitutions) {
      try {
        await institutionRegistry.registerInstitution(
          institution.address,
          institution.name,
          institution.website
        );
        console.log(`✅ Registered: ${institution.name}`);
      } catch (error) {
        console.log(`⚠️  Failed to register ${institution.name}:`, error.message);
      }
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    institutionRegistry: institutionRegistryAddress,
    credentialRegistry: credentialRegistryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("Network:", deploymentInfo.network);
  console.log("InstitutionRegistry:", deploymentInfo.institutionRegistry);
  console.log("CredentialRegistry:", deploymentInfo.credentialRegistry);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Timestamp:", deploymentInfo.timestamp);

  fs.writeFileSync(
    `./deployments-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n💾 Deployment info saved to: deployments-${hre.network.name}.json`);
  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
