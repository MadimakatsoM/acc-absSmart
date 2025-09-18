const hre = require("hardhat");


const EP_address = "0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6"
const AF_address = "0x0b306bf915c4d645ff596e518faf3f9669b97016"


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