//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
import "./IERC721.sol";
import "./ERC721.sol";
import "./IERC721Receiver.sol";

contract Buyer is IERC721Receiver{
    address owner;

    constructor(){
        owner = msg.sender;
    }
    
    function lanceOf(address _of) public view returns(uint){
        return IERC721(owner).balanceOf(_of);
    }

    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes memory _data) external pure returns(bytes4 value) {
            return this.onERC721Received.selector;
    }
}