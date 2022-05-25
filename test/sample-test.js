const { expect } = require("chai");
const { FunctionFragment } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("Map Token", function(){

  let token
  let addr
  let zero_address = "0x0000000000000000000000000000000000000000"

  let totalSupply = 10
  let name = "MapToken"
  let symbol = "Map"

  beforeEach(async function(){
    addr = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Map");
    token = await Token.deploy();
    await token.deployed();
  })

  it("Should be deployed", async function(){
    expect(token.address).to.be.properAddress;    
  })

  it("Getting name", async function(){
    expect(await token.name()).to.be.eq(name)
  })

  it("Getting symbol", async function(){
    expect(await token.symbol()).to.be.eq(symbol)
  })
  
  it("Get total supply", async function(){
    expect(await token.totalSupply()).to.be.eq(totalSupply)
  })

  it("Getting balance", async function(){
    expect(await token.balanceOf(addr[0].address)).to.be.eq(totalSupply)
  })

  it("Getting balance of zero address", async function(){
    expect(token.balanceOf(zero_address)).to.be.revertedWith("ERC721: address zero is not a valid owner!")
  })

  it("Getting balance from another account", async function(){
    expect(await token.connect(addr[1]).balanceOf(addr[0].address)).to.be.eq(totalSupply)
  })

  it("Get owner of NFT by indexId", async function(){
    expect(await token.ownerOf(0)).to.be.eq(addr[0].address)
  })

  it("Get owner of not valid NFT", async function(){
    expect(token.ownerOf(totalSupply + 1)).to.be.revertedWith("ERC721 not a valid NFT")
  })

  it("Mint tokens", async function(){
    let ownerBalance = await token.balanceOf(addr[0].address)
    await token._mint(totalSupply)
    totalSupply += 1
    ownerBalance = Number(ownerBalance)
    ownerBalance += 1
    expect(await token.totalSupply()).to.be.eq(totalSupply)
    expect(await token.balanceOf(addr[0].address)).to.be.eq(ownerBalance)
  })

  it("Mint tokens by not an owner", async function(){
    expect(token.connect(addr[1].address)._mint(totalSupply)).to.be.revertedWith("ERC721 mint error, not an owner")
  })

  it("Mint tokens with invailid indexId", async function(){
    expect(token._mint(totalSupply+1)).to.be.revertedWith("ERC721 cant mint this token")
  })

  it("Mint tokens with invailid indexId", async function(){
    expect(token._mint(totalSupply - 1)).to.be.revertedWith("ERC721 cant mint this token")
  })
});

describe("Approve for all function", function(){
  let token
  let addr
  let zero_address = "0x0000000000000000000000000000000000000000"

  let totalSupply = 10
  let name = "MapToken"
  let symbol = "Map"

  beforeEach(async function(){
    addr = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Map");
    token = await Token.deploy();
    await token.deployed();
  })

  it("None operators by default", async function(){
    expect(await token.isApprovedForAll(addr[0].address, addr[1].address)).to.be.eq(false)
  })

  it("Approve for all", async function(){
    await token.setApprovalForAll(addr[1].address, true)
    expect(await token.isApprovedForAll(addr[0].address, addr[1].address)).to.be.eq(true)
  })

  it("Approve for all to zero address", async function(){
    expect(token.setApprovalForAll(zero_address, true)).to.be.revertedWith("ERC721 operator cant be zero address")
  })

  it("Approve and deprove for all", async function(){
    await token.setApprovalForAll(addr[1].address, true)
    expect(await token.isApprovedForAll(addr[0].address, addr[1].address)).to.be.eq(true)
    await token.setApprovalForAll(addr[1].address, false)
    expect(await token.isApprovedForAll(addr[0].address, addr[1].address)).to.be.eq(false)
  })

  it("Approve for several operators", async function(){
    await token.setApprovalForAll(addr[1].address, true)
    expect(await token.isApprovedForAll(addr[0].address, addr[1].address)).to.be.eq(true)
    await token.setApprovalForAll(addr[2].address, true)
    expect(await token.isApprovedForAll(addr[0].address, addr[2].address)).to.be.eq(true)
  })

})

describe("Approve function", function(){
  let token
  let addr
  let zero_address = "0x0000000000000000000000000000000000000000"

  let totalSupply = 10
  let name = "MapToken"
  let symbol = "Map"

  beforeEach(async function(){
    addr = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Map");
    token = await Token.deploy();
    await token.deployed();
  })

  it("Approve by an owner", async function(){
    await token.approve(addr[1].address, 0)
    expect(await token.getApproved(0)).to.be.eq(addr[1].address)
  })

  it("Approve not valid NFT", async function(){
    expect(token.approve(addr[1].address, totalSupply + 1)).to.be.revertedWith("ERC721 not a valid NFT")
  })

  it("Approved by not an owner nor operator", async function(){
    expect(token.connect(addr[1]).approve(addr[1].address, 0)).to.be.revertedWith("ERC721: not an owner nor operator")
  })

  it("Approve by an operator to the 3rd account", async function(){
    await token.setApprovalForAll(addr[1].address, true)
    expect(await token.isApprovedForAll(addr[0].address, addr[1].address)).to.be.eq(true)
    await token.connect(addr[1]).approve(addr[2].address, 0)
    expect(await token.getApproved(0)).to.be.eq(addr[2].address)  
  })

  it("Approve by an operator to the operator account", async function(){
    await token.setApprovalForAll(addr[1].address, true)
    expect(await token.isApprovedForAll(addr[0].address, addr[1].address)).to.be.eq(true)
    await token.connect(addr[1]).approve(addr[1].address, 0)
    expect(await token.getApproved(0)).to.be.eq(addr[1].address)  
  })

})

describe("transferFrom", function(){
  let token
  let addr
  let zero_address = "0x0000000000000000000000000000000000000000"

  let totalSupply = 10
  let name = "MapToken"
  let symbol = "Map"
  

  beforeEach(async function(){
    addr = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Map");
    token = await Token.deploy();
    await token.deployed();
  })

  it("Sending from the owner by owner accaunt", async function(){
    expect(await token.ownerOf(0)).to.be.eq(addr[0].address)
    await token.connect(addr[0]).transferFrom(addr[0].address, addr[1].address, 0)
    expect(await token.ownerOf(0)).to.be.eq(addr[1].address)
    expect(await token.balanceOf(addr[0].address)).to.be.eq(totalSupply - 1)
    expect(await token.balanceOf(addr[1].address)).to.be.eq(1)
  })

  it("Sending from the owner by not an owner accaunt nor operator", async function(){
    expect(await token.ownerOf(0)).to.be.eq(addr[0].address)
    expect(token.connect(addr[1]).transferFrom(addr[0].address, addr[1].address, 0)).to.be.revertedWith("ERC721: not an owner nor operator")
  })

  it("Sending from owner by approved account", async function(){
    await token.approve(addr[1].address, 0)
    await token.connect(addr[1]).transferFrom(addr[0].address, addr[1].address, 0)
    expect(await token.ownerOf(0)).to.be.eq(addr[1].address)
    expect(await token.balanceOf(addr[0].address)).to.be.eq(totalSupply - 1)
    expect(await token.balanceOf(addr[1].address)).to.be.eq(1)
  })

  it("Sending from owner by operator", async function(){
    await token.setApprovalForAll(addr[1].address, true)
    await token.connect(addr[1]).transferFrom(addr[0].address, addr[1].address, 0)
    expect(await token.ownerOf(0)).to.be.eq(addr[1].address)
    expect(await token.balanceOf(addr[0].address)).to.be.eq(totalSupply - 1)
    expect(await token.balanceOf(addr[1].address)).to.be.eq(1)
  })

  it("Transfer not valid NFT", async function(){
    expect(token.transferFrom(addr[0].address, addr[1].address, totalSupply+1)).to.be.revertedWith("ERC721 not a valid NFT")
  })

})

describe("safeTransferFrom", function(){
  let token
  let addr
  let zero_address = "0x0000000000000000000000000000000000000000"

  let totalSupply = 10
  let name = "MapToken"
  let symbol = "Map"

  beforeEach(async function(){
    addr = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Map");
    token = await Token.deploy();
    await token.deployed();
  })

  it("Sending from the owner by owner accaunt", async function(){
    expect(await token.ownerOf(0)).to.be.eq(addr[0].address)
    await token['functions']['safeTransferFrom(address,address,uint256)'](addr[0].address, addr[1].address, 0)
    expect(await token.ownerOf(0)).to.be.eq(addr[1].address)
    expect(await token.balanceOf(addr[0].address)).to.be.eq(totalSupply - 1)
    expect(await token.balanceOf(addr[1].address)).to.be.eq(1)
  })

  it("Sending to available Smart contract", async function(){
    const Buyer = await ethers.getContractFactory("Buyer");
    buyer = await Buyer.deploy();
    await token['functions']['safeTransferFrom(address,address,uint256)'](addr[0].address, buyer.address, 0)
    expect(await token.balanceOf(buyer.address)).to.be.eq(1)
    expect(await token.ownerOf(0)).to.be.eq(buyer.address)
  })

  it("Sending to not availableSmart contract", async function(){
    const Buyer = await ethers.getContractFactory("Map");
    buyer = await Buyer.deploy();
    expect(token['functions']['safeTransferFrom(address,address,uint256)'](addr[0].address, buyer.address, 0)).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer")
  })

})