const hre = require("hardhat");

const EP_address = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'/*"0x5FbDB2315678afecb367f032d93F642f64180aa3"*/
const AF_address = '0x2054441d481F748f927d59A3e28f82e04aE4a252'/*"0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"*/
// const COUNT_address = "0x959922be3caee4b8cd9a407cc3ac1c251c2007b1"
const PM_ADDRESS = '0xf718E2E350188a3B4a06A4eb03a749181a77CD3E'
const TOKEN_ADDRESS = '0x640ba6878C2B85E9038689fC1D7eC06A71ECE0d5'


AF_NONCE = 2; // think it's used to track of tx's(?)

async function main() {
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_address);
    // const COUNTER_CONTRACT = await hre.ethers.getContractAt("Counter", COUNT_address);
    const Account = await hre.ethers.getContractFactory("Account");
    const Token = await hre.ethers.getContractAt("SmartToken", TOKEN_ADDRESS);


    const [signer] = await hre.ethers.getSigners();
    const addr1 = await signer.getAddress();
    console.log(addr1) // This will be the smart wallet owner


    let initCode = AF_address + AccountFactory.interface.encodeFunctionData("createAccount", [addr1]).slice(2); // determines reusability of an address(create a new one/reuse existing)
    

    // let sender // sender needs to have a balance on the entry point to be able to execute UserOps
    // let sender = await EntryPoint.getSenderAddress(initCode);
    // console.log('Sender',sender)

    try {
        sender = await EntryPoint.getSenderAddress(initCode);
        // console.log('Sender', sender)
        // This always reverts!!! 
    } catch (error) {
        // console.log(error.data)
        sender = "0x" + error.data.slice(-40);
        console.log('sender: ', sender)
    }

    // const code = await hre.ethers.provider.getCode(sender);
    // if (code !== "0x") {
    //     initCode = "0x";
    // }

    // For calling an external contract, we first need to encode the original function call
    const mintToSmartWallet = Token.interface.encodeFunctionData("mintTo", [sender, 20]);
    // const incrementInternalCount = Account.interface.encodeFunctionData('counter')


    // To call an external function from the smart wallet, we must encode the original function call
    // inside the execute method from the smart wallet
    const mintTokenInstruction = Account.interface.encodeFunctionData("execute", [TOKEN_ADDRESS, 0, mintToSmartWallet]);


    // // the goal is to have smart account call another functions from another smart contract

    userOp = {
        sender,
        nonce: await EntryPoint.getNonce(sender, 0),
        initCode:'0x', // If the wallet has already been created, pass "0X", otherwise just use the default initCode which creates the wallet
        callData: mintTokenInstruction, // call the execute method on the Smart Wallet
        callGasLimit: 400_000,
        verificationGasLimit: 800_000,
        preVerificationGas: 100_000,
        maxFeePerGas: hre.ethers.parseUnits("30", "gwei"), //changed to parseUnits line 56 & 57
        maxPriorityFeePerGas: hre.ethers.parseUnits("30", "gwei"),
        paymasterAndData: PM_ADDRESS,
        // paymaster:PM_ADDRESS,
        signature: "0x", // This value will be updated after getting the userOpHash. Keep it like this for now
    }

    const userOpHash = await EntryPoint.getUserOpHash(userOp);

    const signature = await signer.signMessage(hre.ethers.getBytes(userOpHash));
    userOp.signature = signature;

    try {
        const txHash = await EntryPoint.handleOps([userOp], addr1); //was getting a FailedOp(0, "AA23 reverted: ECDSA: invalid signature length") so added signature line 64 & 67
    } catch (error) {
        console.log(error.data)
    }

    // Checking to see if external contract function was actually called
    const deployedAccount = await hre.ethers.getContractAt("Account", sender);
    const count = await deployedAccount.count()
    console.log(count.toString(), 'is the count')

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});