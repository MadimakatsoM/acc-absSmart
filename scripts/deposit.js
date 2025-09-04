const hre = require("hardhat");


const EP_address = "0x9A676e781A523b5d0C0e43731313A708CB607508"
const AF_address = "0x0B306BF915C4d645ff596e518fAf3F9669b97016"
const COUNTER_address = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1"


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