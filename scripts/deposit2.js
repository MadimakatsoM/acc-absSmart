const hre = require("hardhat");

const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xf718E2E350188a3B4a06A4eb03a749181a77CD3E";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  await entryPoint.depositTo(PM_ADDRESS, {
    value: hre.ethers.parseEther("0.1"),
  });

  console.log("deposit was successful!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});