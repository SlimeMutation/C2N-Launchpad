const hre = require("hardhat");
const { saveContractAddress } = require('../utils')

async function main() {
    const tokenName = "C2N";
    const symbol = "C2N";
    const totalSupply = "1000000000000000000000000000";
    const decimals = 18;

    const MCK = await hre.ethers.getContractFactory("C2NToken");
    const token = await MCK.deploy(tokenName, symbol, totalSupply, decimals);
    await token.deployed();
    console.log("C2N deployed to: ", token.address);

    saveContractAddress(hre.network.name, "C2N-TOKEN", token.address);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
