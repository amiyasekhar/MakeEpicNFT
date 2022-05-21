// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// We need to import the helper functions from the contract that we copy/pasted.
import { Base64 } from "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage, Ownable{
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  address payable _reciever;
  uint256 private _maxSupply = 400;
  uint256 private _currentSupply = 400;
  uint256 private _royalty = 2500; //in basis points, so 5 percent = 500
  uint256 private _saleShare; //in basis points, so 5 percent = 500
  uint256 private _sellingPrice;
  uint256 private currTokenId;
  address royaltyAddress;
//0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  event NewEpicNFTMinted(address sender, uint256 tokenId);

  constructor() ERC721 ("Custom NFT", "NFT") payable {
    royaltyAddress = owner();
    //console.log("This is my NFT contract. Woah!");
    _reciever = payable(address(this));
    setPriceAndShare();
  }

  function makeAnEpicNFT() external payable {
    require(_currentSupply > 0, "No more NFTs");
    uint256 newItemId = _tokenIds.current();
    currTokenId = newItemId;
    //console.log(msg.sender, "sender address");

    /*console.log(_reciever, "contract address");
    console.log(balanceOf(_reciever), "contract balance");
    console.log(msg.sender, "sender address");
    console.log(balanceOf(msg.sender), "sender balance");
    console.log(msg.value, "message sender value");
    console.log(gasleft(), "gas fee");*/
    setPriceAndShare();
    if (_sellingPrice == 0.12 ether){
      require(msg.value >= _sellingPrice, "Need to send 0.12 ether or more");
    }
    if (_sellingPrice == 0.19 ether){
      require(msg.value >= _sellingPrice, "Need to send 0.19 ether or more");
    }
    if (_sellingPrice == 0.5 ether){
      require(msg.value >= _sellingPrice, "Need to send 0.5 ether or more");
    }
            
    _safeMint(msg.sender, newItemId);
    //console.log("minted nft", msg.sender, newItemId);
    _setTokenURI(newItemId, "https://jsonkeeper.com/b/TR0K");
    console.log(balanceOf(address(this)), "contract balance after minting");
    _tokenIds.increment();
    _currentSupply--;
    //console.log("An NFT w/ ID %s has been minted to %s", newItemId, balanceOf(msg.sender));
    sendBalanceToAddress();
    setPriceAndShare();

    emit NewEpicNFTMinted(msg.sender, newItemId);
  }

  event Received(address, uint);
    receive() external payable {
        emit Received(msg.sender, msg.value);
        //console.log( msg.sender, msg.value, _reciever.balance);
    }

  function returnTokenID() external view returns (uint256){
    return _tokenIds.current();
  }

  function _payRoyalty(uint256 _royaltyFee) internal {
    (bool success1, ) = (_reciever).call{value: _royaltyFee}("");
    require(success1);
  }

  
  function getPrice() external view returns (uint256){
    return _sellingPrice;
  }

  function setPriceAndShare() public{
    if (_currentSupply >= 300){
      _sellingPrice = 0.12 ether;
      _saleShare = 5000;
    }
    if (_currentSupply < 300 && _currentSupply >= 200){
      _sellingPrice = 0.19 ether;
      _saleShare = 5000;
    }
    if (_currentSupply < 200 && _currentSupply >= 0){
      _sellingPrice = 0.5 ether;
      _saleShare = 5000;
    }
    //console.log("set price and share", _sellingPrice, _saleShare, "\n");

  }

  function getRoyalty() external view returns (uint256){
    return _royalty;
  }

  function getCurrentSupply() external view returns(uint256){
    return _currentSupply;
  }  

  function sendBalanceToAddress() internal{
    address recieverAbby = 0x3cB1DE1465310F5fAD3C65A58F1b174b78D15E71;
    address recieverAmiya = 0x5d1819D05B58d5967520f3d881A36f212C02915B;
    console.log(address(this).balance, " current balance before withdrawal ");
    console.log(_sellingPrice, "selling price");
    require(
        _sellingPrice <= address(this).balance,
        "Trying to withdraw more money than the contract has."
    );
    //console.log(address(this).balance, "contract balance");
    uint256 abbyPercentShare = 10000 - _saleShare;
    //console.log(abbyPercentShare, "abby's share in basis points");
    //console.log(_saleShare, "my share in basis points");
    uint256 abbyCut = (_sellingPrice * abbyPercentShare) / 10000 ; 
    uint256 amiyaCut = (_sellingPrice * _saleShare) / 10000  ;
    //console.log(abbyCut, "Abby's share");
    //console.log(amiyaCut, "My share");
    //console.log(address(this).balance > abbyCut * 1 wei);
    //console.log(address(this).balance > amiyaCut * 1 wei);

    (bool successAbby,) = (recieverAbby).call{value: abbyCut * 1 wei}("abby made money");
    require(successAbby, "Failed to withdraw money from contract for Abby");
    (bool successAmiya,) = (recieverAmiya).call{value: amiyaCut * 1 wei}("amiya made money");
    require(successAmiya, "Failed to withdraw money from contract for Amiya");
    console.log(recieverAbby.balance, "abby's balance");
    console.log(recieverAmiya.balance, "amiya's balance");

  }
  
    

/*{
    "name": "Beauty by The Sea",
    "description": "A beach with a view",
    "image": "https://i.imgur.com/VWPBjl4.jpeg",
    "seller_fee_basis_points: 5000,
    "fee_recipient": "0x57987efdC232231510DF7d1ea3f223Dd69Df3BEa"
}

https://jsonkeeper.com/b/TR0K*/


  
//https://stackoverflow.com/questions/70936795/how-to-set-msg-value-in-remix-ide
//https://forum.openzeppelin.com/t/implementation-of-sellable-nft/5517
}

