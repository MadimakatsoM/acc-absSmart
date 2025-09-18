const hre = require("hardhat");

async function main() {
    // const EP = await hre.ethers.deployContract("EntryPoint"); //in charge of processing and executing the UserOps
    // await EP.waitForDeployment();
    // console.log(`EP deployed to ${EP.target}`);

    const Factory = await hre.ethers.deployContract("AccountFactory");
    await Factory.waitForDeployment();
    console.log(`Factory deployed to ${Factory.target}`);

    const Count = await hre.ethers.deployContract("Counter");
    await Count.waitForDeployment();
    console.log(`Count deployed to ${Count.target}`);


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});