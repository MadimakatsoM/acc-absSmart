const hre = require("hardhat");

const EP_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const AF_address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

AF_NONCE = 2;

async function main() {
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_address);

    // const sender = await hre.ethers.getCreateAddress({
    //     from : AF_address, 
    //     nonce: AF_NONCE});
    // console.log("Sender", sender);

    const [signer] = await hre.ethers.getSigners();
    const addr1 = await signer.getAddress();

    const Account = await hre.ethers.getContractFactory("Account");
    
    let initCode = AF_address + AccountFactory.interface.encodeFunctionData("createAccount", [addr1]).slice(2); // determines reusability of an address(create a new one/reuse existing)

    let sender // was getting AA14 initCode must return sender so commented out line 13 to 15 and uncommented out  26 to 31
    // sender needs to have a balance on the entry point to be able to execute UserOps
    try {
        await EntryPoint.getSenderAddress(initCode);
    } catch (error) {
        console.log(error.data);
        sender = "0x" + error.data.data.slice(-40);
    
        
    }

    const code = await hre.ethers.provider.getCode(sender);
    if (code !== "0x") {
        initCode = "0x";
    }

    console.log(await hre.ethers.provider.getCode(sender)); // check if deployed
    console.log("sender balance", await EntryPoint.balanceOf(sender));



    // const nonce = await EntryPoint.getNonce(sender, 0);
    // const calldata = Account.interface.encodeFunctionData("counter");

    userOp = {
        sender,
        nonce : await EntryPoint.getNonce(sender, 0),
        initCode,
        callData: Account.interface.encodeFunctionData("counter"),
        callGasLimit:400_000,
        verificationGasLimit: 400_000,
        preVerificationGas: 100_000,
        maxFeePerGas: hre.ethers.parseUnits("30","gwei"), //changed to parseUnits line 56 & 57
        maxPriorityFeePerGas: hre.ethers.parseUnits("30","gwei"),
        paymasterAndData: "0x",
        signature: "0x",
    }

    const userOpHash = await EntryPoint.getUserOpHash(userOp);

    const signature = await signer.signMessage(hre.ethers.getBytes(userOpHash));
    userOp.signature = signature;



    const txHash = await EntryPoint.handleOps([userOp], addr1); //was getting a FailedOp(0, "AA23 reverted: ECDSA: invalid signature length") so added signature line 64 & 67

    const deployedAccount = await hre.ethers.getContractAt("Account", sender);

    const count = await deployedAccount.count();
    console.log("Count value in Account:", count.toString());

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});