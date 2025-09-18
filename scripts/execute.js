const hre = require("hardhat");

const EP_address = "0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6"
const AF_address = "0x0b306bf915c4d645ff596e518faf3f9669b97016"
const COUNT_address = "0x959922be3caee4b8cd9a407cc3ac1c251c2007b1"


AF_NONCE = 2; // think it's used to track of tx's(?)

async function main() {
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_address);
    const COUNTER_CONTRACT = await hre.ethers.getContractAt("Counter", COUNT_address);
    const Account = await hre.ethers.getContractFactory("Account");



    // const sender = await hre.ethers.getCreateAddress({
    //     from : AF_address, 
    //     nonce: AF_NONCE});
    // console.log("Sender", sender);

    const [signer] = await hre.ethers.getSigners();
    const addr1 = await signer.getAddress();


    let initCode = AF_address + AccountFactory.interface.encodeFunctionData("createAccount", [addr1]).slice(2); // determines reusability of an address(create a new one/reuse existing)
    // const initCode_ = await Account.createAccount(addr1)
    // console.log(initCode_, ' is the new init code')

    let sender // was getting AA14 initCode must return sender so commented out line 13 to 15 and uncommented out  26 to 31
    // sender needs to have a balance on the entry point to be able to execute UserOps
    // console.log("ebnfoew4")
    // const user = await EntryPoint.getSenderAddress(initCode);
    // console.log('USER:',user)

    try {
        sender = await EntryPoint.getSenderAddress(initCode);
    } catch (error) {
        sender = "0x" + error.data.data.slice(-40);
        console.log('sender: ', sender)


    }

    // const code = await hre.ethers.provider.getCode(sender);
    // if (code !== "0x") {
    //     initCode = "0x";
    // }

    // console.log(await hre.ethers.provider.getCode(sender)); // check if deployed
    // console.log("sender balance", await EntryPoint.balanceOf(sender));



    // const nonce = await EntryPoint.getNonce(sender, 0);
    const incrementFunctionOnExternalContract = COUNTER_CONTRACT.interface.encodeFunctionData("increment");

    // const inc = COUNTER_address.interface.encodeFunctionData("increment");
    const new_counter = Account.interface.encodeFunctionData("execute", [COUNT_address, 0, incrementFunctionOnExternalContract]);

    console.log("new counter", new_counter);
    // console.log("increment: ", inc);



    // // the goal is to have smart account call another functions from another smart contract

    userOp = {
        sender,
        nonce: await EntryPoint.getNonce(sender, 0),
        initCode,
        callData: new_counter,
        callGasLimit: 400_000,
        verificationGasLimit: 800_000,
        preVerificationGas: 100_000,
        maxFeePerGas: hre.ethers.parseUnits("30", "gwei"), //changed to parseUnits line 56 & 57
        maxPriorityFeePerGas: hre.ethers.parseUnits("30", "gwei"),
        paymasterAndData: "0x",
        signature: "0x", //why?
    }

    const userOpHash = await EntryPoint.getUserOpHash(userOp);

    const signature = await signer.signMessage(hre.ethers.getBytes(userOpHash));
    userOp.signature = signature;



    const txHash = await EntryPoint.handleOps([userOp], addr1); //was getting a FailedOp(0, "AA23 reverted: ECDSA: invalid signature length") so added signature line 64 & 67
    // console.log('TX HASH:', txHash)

    // const deployedAccount = await hre.ethers.getContractAt("Account", sender);
    const count = await COUNTER_CONTRACT.count()
    console.log(count.toString(), 'is the count')

    // const deployed = await hre.ethers.getContractAt("Account", sender);
    // const count = await deployed.count();
    // console.log("🔁 Updated count:", count.toString());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});