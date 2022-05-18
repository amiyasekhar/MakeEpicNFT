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
  uint256 private _maxSupply = 10;
  uint256 private _currentSupply = 10;
  uint256 private _royalty = 25;
  uint256 private _saleShare;
  uint256 private _sellingPrice;
  address royaltyAddress;

  event NewEpicNFTMinted(address sender, uint256 tokenId);

  constructor() ERC721 ("Custom NFT", "NFT") payable {
    royaltyAddress = owner();
    console.log("This is my NFT contract. Woah!");
    _reciever = payable(address(this));
    setPriceAndShare();
  }

  function makeAnEpicNFT() external payable {
    require(_currentSupply > 0, "No more NFTs");
    uint256 newItemId = _tokenIds.current();
    console.log(_reciever, "contract address");
    console.log(balanceOf(_reciever), "contract balance");
    console.log(msg.sender, "sender address");
    console.log(balanceOf(msg.sender), "sender balance");
    console.log(msg.value, "message sender value");
    console.log(gasleft(), "gas fee");
    setPriceAndShare();
    require(msg.value >= _sellingPrice, "Need to send 0.12 ether or more");
    _safeMint(msg.sender, newItemId);
    console.log("minted nft", msg.sender, newItemId);
    _setTokenURI(newItemId, "https://jsonkeeper.com/b/TR0K");
    console.log(balanceOf(address(this)), "contract balance");
    _tokenIds.increment();
    _currentSupply--;
    console.log("An NFT w/ ID %s has been minted to %s", newItemId, balanceOf(msg.sender));
    sendBalanceToAddress();
    emit NewEpicNFTMinted(msg.sender, newItemId);
  }

  event Received(address, uint);
    receive() external payable {
        emit Received(msg.sender, msg.value);
        console.log( msg.sender, msg.value, _reciever.balance);
    }

  function returnTokenID() external view returns (uint256){
    return _tokenIds.current();
  }

  
  function getPrice() external view returns (uint256){
    return _sellingPrice;
  }

  function setPriceAndShare() public{
    if (_currentSupply >= 8){
      _sellingPrice = 0.12 ether;
      _saleShare = 5;
    }
    if (_currentSupply < 8 && _currentSupply >= 5){
      _sellingPrice = 0.19 ether;
      _saleShare = 7;
    }
    if (_currentSupply < 5 && _currentSupply > 0){
      _sellingPrice = 0.5 ether;
      _saleShare = 15;
    }
    console.log("set price and share", _sellingPrice, _saleShare);

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

    require(
        _sellingPrice <= address(this).balance,
        "Trying to withdraw more money than the contract has."
    );
    uint256 abbyCut = 1 - _saleShare;
    (bool successAbby,) = (recieverAbby).call{value: (_sellingPrice / 100) * abbyCut}("");
    require(successAbby, "Failed to withdraw money from contract for Abby");
    (bool successAmiya,) = (recieverAmiya).call{value: (_sellingPrice / 100) * _saleShare}("");
    require(successAmiya, "Failed to withdraw money from contract for Amiya");
  }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        virtual
        
        returns (address, uint256)
    {
        return (royaltyAddress, calculateRoyalty(_sellingPrice));
    }

    function calculateRoyalty(uint256 _salePrice) view public returns (uint256) {
        return (_salePrice / 100) * _royalty;
    }

    function supportsInterface(bytes4 interfaceId)
            public
            view
            override(ERC721)
            returns (bool)
    {
        return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
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
