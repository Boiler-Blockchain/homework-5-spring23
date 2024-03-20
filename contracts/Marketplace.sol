//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//Digital ownership
contract AssetFactory {
   struct DigitalAsset {
       string name;
       address owner;
   }


   DigitalAsset[] public digitalAssets;
   uint256 public assetCounter = 0;


   function mint(string memory _name) external {
       require(bytes(_name).length < 32);
       digitalAssets.push(DigitalAsset(_name, msg.sender));
       assetCounter++;
   }


   function ownerOf(uint256 _assetId) internal view returns(address) {
       require(_assetId < assetCounter);
       return digitalAssets[_assetId].owner;
   }


   function transferTo(address _to, uint256 _assetId) public {
       require(_assetId < assetCounter);
       require(msg.sender == ownerOf(_assetId));
       digitalAssets[_assetId].owner = _to;
   }


   function editName(uint256 _assetId, string memory _name) external {
       require(_assetId < assetCounter);
       require(msg.sender == ownerOf(_assetId));
       require(bytes(_name).length < 32);
       digitalAssets[_assetId].name = _name;
   }


   function assetsOf(address _owner) public view returns(uint256[] memory) {
       uint256[] memory ret = new uint256[](assetCounter);
       uint256 counter = 0;
       for (uint256 i = 0; i < assetCounter; i++) {
           if (ownerOf(i) == _owner) {
               ret[counter] = i;
               counter++;
           }
       }
       return ret;
   }
}

contract Auction {


  address payable public beneficiary;
  uint256 public minimumBid;
  address public maxBidder;
  bool public auctionEnded;




  constructor(
      uint256 _minimumBid,
      address payable _beneficiaryAddress
  ) {
      minimumBid = _minimumBid;
      beneficiary = _beneficiaryAddress;
      maxBidder = address(0);
      auctionEnded = false;
  }




  function bid() external payable {
      require(tx.origin != maxBidder);
      require(msg.value > minimumBid);
      require(auctionEnded == false);
    
      if (maxBidder != address(0)) {
          payable(maxBidder).transfer(minimumBid);
      }
      minimumBid = msg.value;
      maxBidder = tx.origin;
  }




  function settleAuction () external {
      require(tx.origin == beneficiary);
      require(auctionEnded == false);	
      //if no bid
      if (maxBidder == address(0)) {
          maxBidder = beneficiary;
      }
      else {
          payable(beneficiary).transfer(minimumBid);
      }
      auctionEnded = true; 
  }
}


// MarketPlace Contract
contract MarketPlace is AssetFactory {
    mapping ( address => uint256 ) public ownerToAuctionId ;
    mapping ( uint256 => Auction) public idToAuction ;
    mapping ( uint256 => uint256 ) public auctionToObject ;
    uint256 public auctionNumber ;

    function putForSale ( uint256 _minimumBid , uint256 assetId ) public {
        // TODO : Implement the putForSale function
    }

    function bid ( uint256 auctionId ) public payable {
        // TODO : Implement the bid function in MarketPlace
    }

    function settleAuction ( uint256 auctionId ) public {
        // TODO : Implement the settleAuction function in MarketPlace
    }
}