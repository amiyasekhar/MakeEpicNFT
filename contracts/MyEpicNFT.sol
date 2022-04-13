// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

// We need to import the helper functions from the contract that we copy/pasted.
import { Base64 } from "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage{
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  address payable private _reciever;
  uint256 private _maxSupply = 420;


  string baseSvg = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";
  string[] firstWords = ["I", "HAVE", "AN", "AMEX", "PLATINUM", "CARD"];
  string[] secondWords = ["THAT", "NEEDS", "TO", "BE", "UPGRADED", "TO"];
  string[] thirdWords = ["A", "CENTURION", "BECAUSE", "IT", "IS", "COOL"];
  event NewEpicNFTMinted(address sender, uint256 tokenId);

  constructor() ERC721 ("SquareNFT", "SQUARE") payable {
    console.log("This is my NFT contract. Woah!");
    _reciever = payable(address(this));
  }

  function makeAnEpicNFT() public payable {
    uint256 newItemId = _tokenIds.current();
    require(newItemId < _maxSupply);
    console.log(_reciever, "owner address");
    console.log(msg.value, "message sender value");
    console.log(gasleft(), "gas fee");
    console.log((msg.sender), "sender address");
    //require(msg.value >= 0.2 ether, "Need to send 0.2 ether or more");
    string memory first = pickRandomFirstWord(newItemId);
    string memory second = pickRandomSecondWord(newItemId);
    string memory third = pickRandomThirdWord(newItemId);
    string memory combinedWord = string(abi.encodePacked(first, second, third));
    string memory finalSvg = string(abi.encodePacked(baseSvg, combinedWord, "</text></svg>"));
    // Get all the JSON metadata in place and base64 encode it.
    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "',
                    // We set the title of our NFT as the generated word.
                    combinedWord,
                    '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                    // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                    Base64.encode(bytes(finalSvg)),
                    '"}'
                )
            )
        )
    );
    // Just like before, we prepend data:application/json;base64, to our data.
    string memory finalTokenUri = string(
        abi.encodePacked("data:application/json;base64,", json)
    );

    //console.log("\n--------------------");
    //console.log(finalTokenUri);
    //console.log("--------------------\n");

    _safeMint(msg.sender, newItemId);
    
    // Update your URI!!!
    _setTokenURI(newItemId, finalTokenUri);

    //_reciever.transfer(msg.value);
    address recipient = 0xc51573625b845826Bc3f98f2191AEa6b17Cde013;
    emit Transfer(address(this), recipient, balanceOf(address(this)));


    _tokenIds.increment();
    console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender, msg.value);
    emit NewEpicNFTMinted(msg.sender, newItemId);
  }

    event Received(address, uint);
      receive() external payable {
          emit Received(msg.sender, msg.value);
          console.log( msg.sender, msg.value, _reciever.balance);
      }

  function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
    rand = rand % firstWords.length;
    return firstWords[rand];
  }

  function returnTokenID() public view returns (uint256){
    return _tokenIds.current();
  }  

  function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
    rand = rand % secondWords.length;
    return secondWords[rand];
  }

  function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
    rand = rand % thirdWords.length;
    return thirdWords[rand];
  }

  function random(string memory input) internal pure returns (uint256) {
      return uint256(keccak256(abi.encodePacked(input)));
  }




  
//https://stackoverflow.com/questions/70936795/how-to-set-msg-value-in-remix-ide
//https://forum.openzeppelin.com/t/implementation-of-sellable-nft/5517
}