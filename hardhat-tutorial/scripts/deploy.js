const {ethers} = require("hardhat");
require("dotenv").config({path:".env"});
const{KRYPTO_KOINS_NFT_ADDRESS} = require("../constants/index");

async function main() {
  const krypto_koin_nft_address = KRYPTO_KOINS_NFT_ADDRESS;
  const kryptoKoinTokenContract = await ethers.getContractFactory("KryptoKoinsToken");
  const deployedKryptoKoinTokenContract = await kryptoKoinTokenContract.deploy(krypto_koin_nft_address);
  await deployedKryptoKoinTokenContract.deployed();
  console.log("KRYPTO KOIN TOKEN ADDRESS", deployedKryptoKoinTokenContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
