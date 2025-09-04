const hre = require("hardhat");

const EP_address = "0x9A676e781A523b5d0C0e43731313A708CB607508"
const AF_address = "0x0B306BF915C4d645ff596e518fAf3F9669b97016"
const COUNT_address = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1"



AF_NONCE = 2;

async function main() {
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_address);
    const COUNTER_address = await hre.ethers.getContractAt("Counter", COUNT_address);


    // const sender = await hre.ethers.getCreateAddress({
    //     from : AF_address, 
    //     nonce: AF_NONCE});
    // console.log("Sender", sender);

    const [signer] = await hre.ethers.getSigners();
    const addr1 = await signer.getAddress();

    const Account = await hre.ethers.getContractFactory("Account");
    // const Counter = await hre.ethers.getContractAt("Counter");
    
    let initCode = AF_address + AccountFactory.interface.encodeFunctionData("createAccount", [addr1]).slice(2); // determines reusability of an address(create a new one/reuse existing)

    let sender // was getting AA14 initCode must return sender so commented out line 13 to 15 and uncommented out  26 to 31
    // sender needs to have a balance on the entry point to be able to execute UserOps
    console.log("ebnfoew4")

    try {
        const user = await EntryPoint.getSenderAddress(initCode);
        console.log("user", user);
    } catch (error) {
        console.log(error.data);
        sender = "0x" + error.data.data.slice(-40);
    
        
    }

    const code = await hre.ethers.provider.getCode(sender);
    if (code !== "0x") {
        initCode = "0x";
    }

    // console.log(await hre.ethers.provider.getCode(sender)); // check if deployed
    // console.log("sender balance", await EntryPoint.balanceOf(sender));



    // const nonce = await EntryPoint.getNonce(sender, 0);
    // const calldata = Account.interface.encodeFunctionData("counter");

    const inc = COUNTER_address.interface.encodeFunctionData("increment");
    const new_counter = Account.interface.encodeFunctionData("execute", [COUNT_address, 0, inc]);
    console.log("new counter", new_counter);
    console.log("increment: ", inc);



    // the goal is to have smart account call another functions from another smart contract

    userOp = {
        sender,
        nonce : await EntryPoint.getNonce(sender, 0),
        initCode,
        callData: new_counter,
        callGasLimit:400_000,
        verificationGasLimit: 800_000,
        preVerificationGas: 100_000,
        maxFeePerGas: hre.ethers.parseUnits("30","gwei"), //changed to parseUnits line 56 & 57
        maxPriorityFeePerGas: hre.ethers.parseUnits("30","gwei"),
        paymasterAndData: "0x",
        signature: "0x", //why?
    }

    const userOpHash = await EntryPoint.getUserOpHash(userOp);

    const signature = await signer.signMessage(hre.ethers.getBytes(userOpHash));
    userOp.signature = signature;



    const txHash = await EntryPoint.handleOps([userOp], addr1); //was getting a FailedOp(0, "AA23 reverted: ECDSA: invalid signature length") so added signature line 64 & 67

    const deployedAccount = await hre.ethers.getContractAt("Account", sender);

    const count = await deployedAccount.count();
    console.log("Count value in Account:", count.toString());

    const newC = await COUNTER_address.count();
    console.log("new count", newC);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});