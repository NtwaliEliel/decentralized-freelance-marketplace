const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy UserProfile contract
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.deployed();
  console.log("UserProfile deployed to:", userProfile.address);

  // Deploy JobContract
  const JobContract = await hre.ethers.getContractFactory("JobContract");
  const jobContract = await JobContract.deploy();
  await jobContract.deployed();
  console.log("JobContract deployed to:", jobContract.address);

  // Verify contracts on Etherscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await userProfile.deployTransaction.wait(6);
    await jobContract.deployTransaction.wait(6);

    console.log("Verifying UserProfile contract...");
    await hre.run("verify:verify", {
      address: userProfile.address,
      constructorArguments: [],
    });

    console.log("Verifying JobContract contract...");
    await hre.run("verify:verify", {
      address: jobContract.address,
      constructorArguments: [],
    });
  }

  // Save contract addresses to a file
  const fs = require("fs");
  const addresses = {
    UserProfile: userProfile.address,
    JobContract: jobContract.address,
  };

  fs.writeFileSync(
    "contract-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("Contract addresses saved to contract-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 