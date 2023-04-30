// SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IKrypto.sol";

contract KryptoKoinsToken is ERC20,Ownable{
    uint public constant tokenPrice = 0.001 ether;
    uint public constant tokensPerNft = 10 * 10**18;
    uint public maxTotalSupply = 10000 * 10**18;
    IKrypto KryptoKoinsNFT;
    mapping (uint => bool) public tokenIdsClaimed;

    constructor (address _KryptoKoinsNFT) ERC20("Krypto Koins Token","KK") {
        KryptoKoinsNFT = IKrypto(_KryptoKoinsNFT);
    }

    function mints(uint amount) public payable{
        uint requiredAmount = tokenPrice * amount;
        require(msg.value >= requiredAmount,"Ether sent is incorrect");
        uint amountWithDecimals = amount * 10**18;
        require((totalSupply() + amountWithDecimals) <= maxTotalSupply,"Exceeds the maximum total supply");
        _mint (msg.sender,amountWithDecimals);
    }

    function claim() public{
        address sender = msg.sender;
        uint balance = KryptoKoinsNFT.balanceOf(sender);
        require (balance > 0,"You don't have any Krypto Koins NFT");
        uint amount = 0;
        for (uint i = 0;i < balance;i++){
            uint tokenId = KryptoKoinsNFT.tokenOfOwnerByIndex(sender,i);
            if(!tokenIdsClaimed[tokenId]){
                amount +=1;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require (amount > 0,"You have already claimed tokens for your NFT");
        _mint(sender,amount * tokensPerNft);
    }

    function withdraw() public onlyOwner{
        uint amount = address(this).balance;
        require (amount > 0,"Nothing to withdraw,contract balance empty");
        address _owner = owner();
        (bool sent,) = _owner.call{value : amount}("");
        require (sent,"TRANSACTION FAILED");
    }

    receive() external payable{}
    fallback() external payable{}
}