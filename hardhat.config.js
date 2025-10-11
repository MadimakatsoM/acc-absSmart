require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();



module.exports = {
  defaultNetwork: "localhost",
  networks: {
    arb: {
      url: process.env.RPC_URL, 
      accounts: [process.env.PRIVATE_KEY], 
    },
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  etherscan: {
    apiKey: {
      arb: process.env.ETHERSCAN_API_KEY
    },
    customChains: [
            {
                network: "arb",
                chainId: 421614,
                urls: {
                    apiURL: "https://api.etherscan.io/v2/api?chainid=421614",
                    browserURL: "https://sepolia.arbiscan.io/",
                },
            }
        ]
  }
   
};
