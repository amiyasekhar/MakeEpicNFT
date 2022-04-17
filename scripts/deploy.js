const { ethers } = require("hardhat");

const main = async () => {
  const nftContractFactory = await hre.ethers.getContractFactory('MyEpicNFT'); //compiles contract
  const nftContract = await nftContractFactory.deploy(); //creates local eth network
  await nftContract.deployed();
  console.log("Contract deployed to:", nftContract.address);


  // Call the function.
  let txn = await nftContract.makeAnEpicNFT({value: ethers.utils.parseEther("0.2")})
  // Wait for it to be mined.
  await txn.wait()
  console.log("Minted NFT #1")
  console.log("TokenID: ", nftContract.returnTokenID());
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