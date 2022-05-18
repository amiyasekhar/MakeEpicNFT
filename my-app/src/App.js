import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';
import { ethers } from "ethers";
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
//const OPENSEA_LINK = '';
//const TOTAL_MINT_COUNT = 50;

const App = () => {
  let price;
  const [currentAccount, setCurrentAccount] = useState("");
  const CONTRACT_ADDRESS = "0xA5fff6289DeFF7474bA73ac7cB3e44DD3Ad16904";

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      console.log("Contract deployed at: ", CONTRACT_ADDRESS);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {

    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error);
    }
  }

  const setPriceAndBuy = async (connectedContract) => {
    try {
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}
          \nhttps://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}
          \nThe following information will be needed to import your NFT into your wallet
          \nCONTRACT ADDRESS: ${CONTRACT_ADDRESS}, TOKEN ID ${tokenId.toNumber()}`)
        });
      const currentSupply = await connectedContract.getCurrentSupply();
      console.log(currentSupply.toNumber(), "current supply\n")
      let nftTxn;
      console.log("Going to pop wallet now to pay gas...")
      if (currentSupply.toNumber() >= 300){
        price = "0.12";
        nftTxn = await connectedContract.makeAnEpicNFT({value: ethers.utils.parseEther("0.12"),  gasLimit: 10000000});
        console.log("Mining...please wait.")
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);


      }
      if (currentSupply.toNumber() < 300 && currentSupply.toNumber() >= 200){
        price = "0.19";
        nftTxn = await connectedContract.makeAnEpicNFT({value: ethers.utils.parseEther("0.19"), gasLimit: 10000000});
        console.log("Mining...please wait.")
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      }
      if (currentSupply.toNumber() < 200){
        price = "0.5";
        nftTxn = await connectedContract.makeAnEpicNFT({value: ethers.utils.parseEther("0.5"), gasLimit: 10000000});
        console.log("Mining...please wait.")
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      }
      console.log(price, "price \n")
    } catch (error) {
      console.log(error, " this is the error")
    }
  }
  
  const askContractToMintNft = async () => {

  
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        setPriceAndBuy(connectedContract);
        /*connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}
          \nhttps://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}
          \nThe following information will be needed to import your NFT into your wallet
          \nCONTRACT ADDRESS: ${CONTRACT_ADDRESS}, TOKEN ID ${tokenId.toNumber()}`)
        });
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = setPrice(connectedContract)[0]//await connectedContract.makeAnEpicNFT({value: ethers.utils.parseEther(price)});
        console.log("Mining...please wait.")
        //await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${setPrice(connectedContract)[1]}`);*/
  
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already connected :).
  */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover The Abby Fitzpatrick Collection.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT for {price} ETH
            </button>
          )}
          <p className="sub-text">
            Each NFT, 400 in total, entitles you to a night out with me and my beautiful
            girlfriends every month at any club in Boston up until the month of October.
          </p>
          <p className="sub-text">
            The first 100 NFTs will sell for 0.12 ETH.
          </p>
          <p className="sub-text">
            The next 100 NFTs will sell for 0.19 ETH.
          </p>
          <p className="sub-text">
            The last 200 NFTs will sell for 0.5 ETH.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
/*
Let's say you want to change your contract. You'd need to do 3 things:
We need to deploy it again.
We need to update the contract address on our frontend.
We need to update the abi file on our frontend.
https://www.youtube.com/watch?v=XLrhD6GHi0E
*/
