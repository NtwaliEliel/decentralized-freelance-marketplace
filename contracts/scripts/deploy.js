const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 