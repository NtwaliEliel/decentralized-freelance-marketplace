const { ethers } = require("hardhat");

async function main() {
  // Get the signers (test accounts)
  const [deployer, client, freelancer] = await ethers.getSigners();

  console.log("Local network started with the following accounts:");
  console.log("Deployer address:", deployer.address);
  console.log("Client address:", client.address);
  console.log("Freelancer address:", freelancer.address);

  // Log the balance of each account
  console.log("\nAccount balances:");
  console.log("Deployer balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");
  console.log("Client balance:", ethers.utils.formatEther(await client.getBalance()), "ETH");
  console.log("Freelancer balance:", ethers.utils.formatEther(await freelancer.getBalance()), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 