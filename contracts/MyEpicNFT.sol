// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// We need to import the helper functions from the contract that we copy/pasted.
import { Base64 } from "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage, Ownable{
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  address payable _reciever;
  uint256 private _maxSupply = 15;
  uint256 private royalty = 25;
  address AmiyaAddress = 0x5d1819D05B58d5967520f3d881A36f212C02915B;
  address AbbyAddress = 0xc51573625b845826Bc3f98f2191AEa6b17Cde013;
  uint256 percentage;
  uint256 amount;

  event NewEpicNFTMinted(address sender, uint256 tokenId);


  constructor() ERC721 ("Custom NFT", "NFT") payable {
    console.log("This is my NFT contract. Woah!");
    _reciever = payable(address(this));
  }

  function makeAnEpicNFT() external payable {
    uint256 newItemId = _tokenIds.current();
    console.log(_reciever, "contract address");
    console.log(balanceOf(_reciever), "contract balance");
    console.log(msg.sender, "sender address");
    console.log(balanceOf(msg.sender), "sender balance");
    console.log(msg.value, "message sender value");
    console.log(gasleft(), "gas fee");
    require(_tokenIds.current()+1 <= 420, "We're sold out, wait for the next collection!");
    require(msg.value >= 0.2 ether, "Need to send 0.2 ether or more");
    _safeMint(msg.sender, newItemId);
    _setTokenURI(newItemId, "https://jsonkeeper.com/b/TR0K");
    console.log(balanceOf(address(this)), "contract balance");
    _tokenIds.increment();
    console.log("An NFT w/ ID %s has been minted to %s", newItemId, balanceOf(msg.sender));
    sendBalanceToAddress();
    emit NewEpicNFTMinted(msg.sender, newItemId);
  }

  event Received(address, uint);
    receive() external payable {
        emit Received(msg.sender, msg.value);
        console.log( msg.sender, msg.value, _reciever.balance);
    }

  function returnTokenID() public view returns (uint256){
    return _tokenIds.current();
  }

  function setPercent(uint256 per) public{
    percentage = per;
  }
  function set  

  function sendBalanceToAddress() internal{

    require(
        amount <= address(this).balance,
        "Trying to withdraw more money than the contract has."
    );
    uint myCut = amount * percentage/100 ether;
    (bool AmiyaSuccess,) = (AmiyaAddress).call{value: myCut}("");
    require(AmiyaSuccess, "Failed to withdraw money from contract.");    
    (bool AbbySuccess,) = (AbbyAddress).call{value: amount - myCut}("");
    require(AbbySuccess, "Failed to withdraw money from contract.");
  }

/*{
    "name": "Beauty by The Sea",
    "description": "A beach with a view",
    "image": "https://i.imgur.com/VWPBjl4.jpeg"
}

https://jsonkeeper.com/b/TR0K*/


  
//https://stackoverflow.com/questions/70936795/how-to-set-msg-value-in-remix-ide
//https://forum.openzeppelin.com/t/implementation-of-sellable-nft/5517
}