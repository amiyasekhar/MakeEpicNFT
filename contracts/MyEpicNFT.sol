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
  uint256 private _maxSupply = 420;
  uint256 private royalty = 25;
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
    require(msg.value >= 0.05 ether, "Need to send 0.05 ether or more");
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

  function sendBalanceToAddress() internal{
    address reciever = 0xc51573625b845826Bc3f98f2191AEa6b17Cde013;
    uint256 amount = 0.05 ether;
    require(
        amount <= address(this).balance,
        "Trying to withdraw more money than the contract has."
    );
    (bool success,) = (reciever).call{value: amount}("");
    require(success, "Failed to withdraw money from contract.");
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