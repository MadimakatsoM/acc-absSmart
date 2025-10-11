const hre = require("hardhat");


const EP_address = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"
const AF_address = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"


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
        sender = "0x" + error.data.data.slice(-40);
        console.log('You are here', sender)
    }

    await EntryPoint.depositTo(sender, {
        value: hre.ethers.parseEther("2"),
    });
    console.log("deposit was successful to", sender);
    
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});