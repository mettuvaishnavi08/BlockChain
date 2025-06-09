const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // your local address
  const SimpleStorage = await hre.ethers.getContractAt("SimpleStorage", contractAddress);

  // Store a value
  const tx = await SimpleStorage.store(42);
  await tx.wait();
  console.log("Stored value 42");

  // Retrieve the value
  const value = await SimpleStorage.retrieve();
  console.log("Retrieved value:", value.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
