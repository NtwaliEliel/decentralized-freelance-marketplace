const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to local network...");

  // Deploy UserProfile contract
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  console.log("UserProfile deployed to:", await userProfile.getAddress());

  // Deploy JobContract
  const JobContract = await hre.ethers.getContractFactory("JobContract");
  const jobContract = await JobContract.deploy();
  await jobContract.waitForDeployment();
  console.log("JobContract deployed to:", await jobContract.getAddress());

  // Save the addresses to a file for frontend use
  const fs = require('fs');
  const addresses = {
    userProfile: await userProfile.getAddress(),
    jobContract: await jobContract.getAddress()
  };
  fs.writeFileSync('contract-addresses.json', JSON.stringify(addresses, null, 2));
  console.log("Contract addresses saved to contract-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 