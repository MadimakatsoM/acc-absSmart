const hre = require("hardhat");

const COUNT_address = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

async function main() {
    const COUNTER_CONTRACT = await hre.ethers.getContractAt("Counter", COUNT_address);

    const count = await COUNTER_CONTRACT.count()
    console.log('Count is: ', count, 'before count increment')
    await COUNTER_CONTRACT.increment()

    console.log('Updated count is: ', await COUNTER_CONTRACT.count())


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});