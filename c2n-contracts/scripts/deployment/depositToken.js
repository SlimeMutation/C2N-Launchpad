const hre = require("hardhat");
const {saveContractAddress, getSavedContractAddresses} = require('../utils')
const config = require("../configs/saleConfig.json");
const yesno = require("yesno");
const {ethers, web3} = hre

async function getCurrentBlockTimestamp() {
    return (await ethers.provider.getBlock('latest')).timestamp;
}

const delay = ms => new Promise(res => setTimeout(res, ms));
const delayLength = 3000;


async function main() {

    const contracts = getSavedContractAddresses()[hre.network.name];
    const c = config[hre.network.name];
    const owner = c.saleOwner

    // MOCK Token
    /**
     * IDO Sale 使用MOCK Token作为抵押物
     */
    const token = await hre.ethers.getContractAt('C2NToken', contracts['MOCK-TOKEN']);

    const salesFactory = await hre.ethers.getContractAt('SalesFactory', contracts['SalesFactory']);

    const lastDeployedSale = await salesFactory.getLastDeployedSale();

    await token.approve(lastDeployedSale, ethers.utils.parseEther(c.totalTokens));
    console.log('Deployed Sale address is: ', lastDeployedSale);
    console.log(`token.approve(${token.address}, ${c.totalTokens});`)

    const sale = await hre.ethers.getContractAt('C2NSale', lastDeployedSale);
    console.log(`Successfully instantiated sale contract at address: ${lastDeployedSale}.`);

    await sale.depositTokens();
    console.log("ido sale deposited");
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
