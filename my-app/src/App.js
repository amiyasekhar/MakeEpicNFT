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
  const [currentAccount, setCurrentAccount] = useState("");
  const CONTRACT_ADDRESS = "0xc97B3df1b08755F83af907a550C3E21BDad74C87";
  const [supply, setSupply] = useState('');
  const [price, setPrice] = useState('');
  const [hash, setHash] = useState('');
  const [openSeaLink, setOpenSeaLink] = useState("https://opensea.io/assets");
  const [raribleLink, setRaribleLink] = useState("https://rarible.com/");
  const [etherscanLink, setEtherscanLink] = useState("https://etherscan.io/tx/")
  const [token, setToken] = useState(null);
  console.log(raribleLink);
  console.log(openSeaLink)
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
      const ethMainnet = "0x1";  //0x4 for rinkeby
      if (chainId !== ethMainnet) {
        alert("You are not connected to the Ethereum Network!");
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
  const askContractToMintNft = async () => {

  
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: 
          \nhttps://rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}
          \nhttps://opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}
          \nSee the transaction on etherscan
          \nhttps://etherscan.io/tx/${hash}
          \nThe following information will be needed to import your NFT into your wallet
          \nCONTRACT ADDRESS: ${CONTRACT_ADDRESS}, TOKEN ID: ${tokenId.toNumber()}, HASH: ${hash}`)
          setToken(tokenId)
        });
        console.log("Going to pop wallet now to pay gas...")
        let outstandingSupply = await connectedContract.getCurrentSupply();
        setSupply(outstandingSupply.toNumber() + "; ")
        console.log("This is outstanding supply", outstandingSupply.toNumber())
        let cost = await connectedContract.getPrice();
        setPrice(ethers.utils.formatEther(cost) + "ETH; ")
        console.log("This is cost", ethers.utils.formatEther(cost))
        let nftTxn = await connectedContract.makeAnEpicNFT({value: ethers.utils.parseEther(ethers.utils.formatEther(cost)), gasLimit: 10000000});
  
        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        let txnHash = nftTxn.hash
        setHash(txnHash);
        
        if (hash != ''){
          setOpenSeaLink(openSeaLink+`/${CONTRACT_ADDRESS}/${token.toNumber()}`);
          setRaribleLink(raribleLink+`token/${CONTRACT_ADDRESS}/${token.toNumber()}`);
          setEtherscanLink(etherscanLink+`${hash}`);
        }
  
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
          <p className={"sub-text"}>
            Discover The Abby Fitzpatrick Collection.
          </p>
            <p className={"sub-text"}>
              Each NFT gives you access to hangout with Abby's girl friends in the VIP section of clubs in Boston, including but not limited to The Grand, Memoire, and Mariel, for the whole month of June. 
            </p>
            <p className={"sub-text"}>
              First 100 NFTs will mint for 0.12 ETH, the next 100 will mint for 0.19 ETH. the last 200 will mint for 0.5 ETH. Click "Mint" to see the price and supply, after which you may choose to purchase an NFT.
            </p>
            <p className={"mini-text"}>
              Price before mint: {price}
              Supply before mint: {supply}
              Hash: {hash}
            </p>
            {currentAccount === "" ? (
              renderNotConnectedContainer()
            ) : (
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint
              </button>
            )}
            <p className={"bottom-text"}>
              If you are using a phone, make sure you access this website through metamask as shown <a href= "https://youtu.be/8BL7COrxJvg?t=120" target="_blank" rel="noreferrer noopener">here </a>
            </p>
            <p className={"bottom-text2"}>
              After minting your NFT, take note of the token ID, hash, and contract address, as this information will be needed to import the NFT into your wallet
            </p>
            <p className={"bottom-text2"}>
              You must import the NFT into your wallet, and show Abby the token ID and contract address in order to gain access to the experiential offerings.
            </p>
            <p className={"sub-text"}>
              See your NFT on <a href= {raribleLink} target="_blank" rel="noreferrer noopener">Rarible</a>
            </p>
            <p className={"sub-text"}>
              See your NFT on <a href= {openSeaLink} target="_blank" rel="noreferrer noopener">OpenSea</a>
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
