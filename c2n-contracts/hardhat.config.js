require('dotenv').config();
require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-ethers')
require("@nomiclabs/hardhat-web3")
require('@openzeppelin/hardhat-upgrades')


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    networks: {
        hardhat:{
            chainId: 31337
        },
        local: {
            url: 'http://127.0.0.1:8545',
            chainId:31337,
            accounts: [process.env.LOCAL_PRIVATE_KEY]
        },
        sepolia: {
            url: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
            accounts: [process.env.PRIVATE_KEY]
        },
        arb_sepolia:{
            url: 'https://public.stackup.sh/api/v1/node/arbitrum-sepolia',
            accounts: [process.env.PRIVATE_KEY]
        }
    },
    solidity: {
        version: "0.6.12",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
};
