const hre = require("hardhat");


const EP_address = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
const AF_address = "0x6B739E5ca92a1F8C40C7D6c1A32533AfE7f7eFc9"


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