const { ethers } = require("hardhat");
const { utils } = require("../my-app/node_modules/ethers/lib");

const main = async () => {
  const nftContractFactory = await hre.ethers.getContractFactory('MyEpicNFT');
  const nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();
  console.log("Contract deployed to:", nftContract.address);
  let price, supply, nftTxn;
  supply = 10;

  const senderAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
  /*let supply = await nftContract.getCurrentSupply();
  let price = await nftContract.getPrice();
  console.log((supply).toNumber(), " Current Starting Supply \n");
  console.log(ethers.utils.formatEther(price), " Current Starting Price \n");
  let nftTxn = await nftContract.makeAnEpicNFT({value: ethers.utils.parseEther(ethers.utils.formatEther(price)), gasLimit: 10000000});
  console.log(nftTxn, "\n");*/

  //testing the mintability
  while (supply > 0){
    price = await nftContract.getPrice();
    console.log(ethers.utils.formatEther(price), "current price");
    supply = await nftContract.getCurrentSupply();
    console.log((supply).toNumber(), "current supply");
    nftTxn = await nftContract.makeAnEpicNFT({value: ethers.utils.parseEther(ethers.utils.formatEther(price)), gasLimit: 10000000});
  }


  // Call the function.
  /*let txn = await nftContract.makeAnEpicNFT({value: ethers.utils.parseEther("0.2")})
  // Wait for it to be mined.
  await txn.wait()*/



};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();