//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
import "./IERC721.sol";
import "./IERC721Receiver.sol";

contract ERC721 is IERC721{
    
    string _name;
    string _symbol;
    uint _totalSupply;
    address _owner;

    constructor(string memory name_, string memory symbol_, uint totalSupply_) {
        _name = name_;
        _symbol = symbol_;
        _owner = msg.sender;
        for (uint i = 0; i < totalSupply_; i++){
            _mint(i);
        }
    }
    mapping(uint => address) private _owners;

    mapping(address => uint) private _balances;

    mapping(uint => address) private _tokenApprovals;

    mapping(address => mapping(address => bool)) private _operatorApprovals;

    function name() public view returns(string memory){
        return _name;
    }

    function symbol() public view returns(string memory){
        return _symbol;
    }

    function ownerOf(uint _tokenId) public view returns (address){
        require(_owners[_tokenId] != address(0), "ERC721 not a valid NFT");
        return _owners[_tokenId];
    }

    modifier validNFT(uint _tokenId){
        require(ownerOf(_tokenId) != address(0), "ERC721 not a valid NFT");
        _;
    }

    modifier ownerOrApproved(uint tokenId){
        address owner = ownerOf(tokenId);
        require(owner == msg.sender || _operatorApprovals[owner][msg.sender] || _tokenApprovals[tokenId] == msg.sender, "ERC721: not an owner nor operator");
        _;
    }

    function totalSupply() public view returns(uint){
        return _totalSupply;
    }

    function balanceOf(address _owner) public view returns (uint){
        require(_owner != address(0), "ERC721: address zero is not a valid owner!");
        return _balances[_owner];
    }

    function _mint(uint tokenId) public{
        require(msg.sender == _owner, "ERC721 mint error, not an owner");
        require(tokenId == _totalSupply, "ERC721 cant mint this token");
        _totalSupply += 1;
        _balances[_owner] += 1;
        _owners[tokenId] = _owner;
    }

    function safeTransferFrom(address _from, address _to, uint _tokenId, bytes memory data) public payable ownerOrApproved(_tokenId){
            require(_checkOnERC721Received(_from, _to, _tokenId, data), "ERC721: transfer to non ERC721Receiver implementer");
            _transfer(_from, _to, _tokenId);
    }

    function safeTransferFrom(address _from, address _to, uint _tokenId) public payable {
        safeTransferFrom(_from, _to, _tokenId, "");
    }

    function transferFrom(address _from, address _to, uint _tokenId) external payable ownerOrApproved(_tokenId){
        _transfer(_from, _to, _tokenId);
    }

    function approve(address _approved, uint _tokenId) external payable ownerOrApproved(_tokenId) validNFT(_tokenId){
        address owner = ownerOf(_tokenId);
        require(owner != _approved, "ERC721: approval to current owner");
        _approve(owner, _approved, _tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved) external{
        require(_operator != msg.sender, "ERC721 operator and owner cant be the same address");
        require(_operator != address(0), "ERC721 operator cant be zero address");
        _operatorApprovals[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function getApproved(uint _tokenId) external view validNFT(_tokenId) returns (address){
         return _tokenApprovals[_tokenId];
    }

    function isApprovedForAll(address _owner, address _operator) external view returns (bool){
        return _operatorApprovals[_owner][_operator];
    }

    function _approve(address _owner, address _approved, uint _tokenId) internal virtual validNFT(_tokenId){
        _tokenApprovals[_tokenId] = _approved;
        emit Approval(_owner, _approved, _tokenId);
    }

    function _transfer(address _from, address _to, uint _tokenId) internal virtual validNFT(_tokenId) {
        require(_from == ownerOf(_tokenId), "ERC721 transfer from incorect owner");
        require(_to != address(0), "ERC721 transfer to zero address");
        _balances[_from] -= 1;
        _balances[_to] += 1;
        _owners[_tokenId] = _to;
        _approve(_from, address(0), _tokenId);
        emit Transfer(_from, _to, _tokenId);
    }

    function isContract(address _addr) private view returns (bool){
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }

    function _checkOnERC721Received(
        address from,
        address to,
        uint tokenId,
        bytes memory data
    ) private returns (bool) {
        if (isContract(to)) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("ERC721: transfer to non ERC721Receiver implementer");
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }


}

contract Map is ERC721{
    constructor() ERC721("MapToken", "Map", 10){}
}