const hre = require("hardhat");


const EP_address = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
const AF_address = "0xb4DCfBff9235ac613Daa32ba5ee44727588Ea4ED"


async function main() {
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_address);    


    const [signer] = await hre.ethers.getSigners();
    const addr1 = await signer.getAddress();

    
    const initCode = AF_address + AccountFactory.interface.encodeFunctionData("createAccount", [addr1]).slice(2);

    let sender // was getting AA14 initCode must return sender so commented out line 13 to 15 and uncommented out  26 to 31
    try {
        await EntryPoint.getSenderAddress(initCode);
    } catch (error) {
        sender = "0x" + error.data.slice(-40);
        console.log('You are here', sender)
    }

    await EntryPoint.depositTo(sender, {
        value: hre.ethers.parseEther("0.0001"),
    });
    console.log("deposit was successful to", sender);
    
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});