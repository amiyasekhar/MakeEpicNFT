import React, { useEffect, useState } from "react";
import './styles/App.css';
import myEpicNft from './utils/MyEpicNFT.json';
import { ethers } from "ethers";
//const OPENSEA_LINK = '';
//const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const CONTRACT_ADDRESS = "0xCd3194fC20ACe6D514F1596607031588171a9B5d";
  const [supply, setSupply] = useState('');
  const [price, setPrice] = useState('');
  const [hash, setHash] = useState('');
  const [openSeaLink, setOpenSeaLink] = useState("https://opensea.io/assets");
  const [raribleLink, setRaribleLink] = useState("https://rarible.com/");
  const [etherscanLink, setEtherscanLink] = useState("https://etherscan.io/tx/")
  const [token, setToken] = useState(null);
  const [displayText, setDisplayText] = useState(`Supply: ${0}, Price: ${0} ETH, Hash: `);
  let globalProvider = null;
  let globalSigner = null;
  let globalConnectedContract = null;
  console.log("default rarible link", raribleLink);
  console.log("default opensea link", openSeaLink);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      const provider = new ethers.getDefaultProvider('https://eth-rinkeby.alchemyapi.io/v2/Ky5-_i9Lkd1buVYM5zxMymn-SShw4023');
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, provider);
      globalProvider = provider;
      globalConnectedContract = connectedContract;
      console.log(globalProvider, "def provider");
      console.log(globalConnectedContract, "contract from def provider");
      console.log("Make sure you have metamask!");
      return;
    } else {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
      globalProvider = provider;
      globalSigner = signer;
      globalConnectedContract = connectedContract;
      console.log(globalProvider, "eth provider");
      console.log(globalSigner, "signer from eth provider");
      console.log(globalConnectedContract, "contract from eth provider");
      console.log("We have the ethereum object", ethereum);

    }
    let outstandingSupply = await globalConnectedContract.getCurrentSupply();
    let cost = await globalConnectedContract.getPrice();
    setPrice(cost);
    setSupply(outstandingSupply.toNumber())
    console.log(outstandingSupply.toNumber(), "This is outstanding supply");
    console.log(ethers.utils.formatEther(cost), "the price");
    setDisplayText(`Supply: ${outstandingSupply.toNumber()}, Price: ${ethers.utils.formatEther(cost)}, Hash: ${hash}`);
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
      const ethTestNetRinkeby = "0x4;"
      if (chainId !== ethMainnet || chainId !== ethTestNetRinkeby) {
        alert("You are not connected to the Ethereum Network!");
        console.log("you aren't connected to eth network");
      }
      else{
        console.log("you're connected")
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
      console.log("this is the error", error);
    }
  }
  const askContractToMintNft = async () => {

  
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        if (globalSigner == null){
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
          globalProvider = provider;
          globalSigner = signer;
          globalConnectedContract = connectedContract;
        }
        /*const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);*/
        globalConnectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
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
        let outstandingSupply = await globalConnectedContract.getCurrentSupply();
        setSupply(outstandingSupply.toNumber())
        console.log("This is outstanding supply", outstandingSupply.toNumber())
        let cost = await globalConnectedContract.getPrice();
        setPrice(cost);
        console.log("This is cost", ethers.utils.formatEther(cost));
        const artistAddresses = ["0x3cB1DE1465310F5fAD3C65A58F1b174b78D15E71", "0x57987efdC232231510DF7d1ea3f223Dd69Df3BEa"];
        let nftTxn = await globalConnectedContract.makeAnEpicNFT(artistAddresses, {value: ethers.utils.parseEther(ethers.utils.formatEther(price)), gasLimit: 10000000});
  
        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        let txnHash = nftTxn.hash
        setHash(txnHash);
        
        if (hash !==''){
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
              {displayText}
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