const hre = require("hardhat");

const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xe5bea676d7D3A2E4Ac1F393821244180024B892c";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  await entryPoint.depositTo(PM_ADDRESS, {
    value: hre.ethers.parseEther(".001"),
  });

  console.log("deposit was successful!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});