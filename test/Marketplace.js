const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const MINMUM_BID_AUCTION_EXISTS_FIXTURE = 10

describe("Marketplace", function () {

    async function deployFixture() {
        
        const [account, account2, account3] = await ethers.getSigners();
    
        const MarketplaceFactory = await ethers.getContractFactory("MarketPlace");
        let contract = await MarketplaceFactory.deploy();
    
        return { contract, account, account2, account3 };
    }

    async function auctionExistsFixture() {
        const { contract, account, account2, account3 } = await loadFixture(deployFixture)

        await contract.connect(account).mint("Test1");

        await contract.connect(account).putForSale(MINMUM_BID_AUCTION_EXISTS_FIXTURE, 0)

        return {contract, account, account2, account3};
    }

    async function auctionHasBidsFixture() {
        const { contract, account, account2, account3 } = await loadFixture(auctionExistsFixture)

        await contract.connect(account2).bid(1, {value: 11})
        await contract.connect(account3).bid(1, {value: 15})

        return {contract, account, account2, account3}
    }

    describe("putForSale - 40 points", function() {
        it("Should fail if the owner already has an auction - 5 points", async function() {
            const { contract, account, account2, account3 } = await loadFixture(auctionExistsFixture)

            await expect(contract.connect(account).putForSale(MINMUM_BID_AUCTION_EXISTS_FIXTURE, 0)).to.be.reverted
        })
        it("Should fail if the assetID is invalid - 5 points", async function() {
            const { contract, account, account2, account3 } = await loadFixture(deployFixture)

            await expect(contract.connect(account).putForSale(MINMUM_BID_AUCTION_EXISTS_FIXTURE,10)).to.be.reverted
        })
        it("Should fail if the transaction sender is not the owner of the asset - 5 points", async function() {
            const { contract, account, account2, account3 } = await loadFixture(auctionExistsFixture)

            await expect(contract.connect(account2).putForSale(MINMUM_BID_AUCTION_EXISTS_FIXTURE,0)).to.be.reverted
        })
        it("Should increase auctionNumber by 1 after successful auction - 5 points", async function() {
            const { contract, account, account2, account3 } = await loadFixture(auctionExistsFixture)

            let contractAuctionNumber = await contract.auctionNumber()
            expect(contractAuctionNumber).to.equal(1)            
        })
        it("Should set idToAuction mapping for auctionNumber - 6 points", async function() {
            const { contract, account, account2, account3 } = await loadFixture(auctionExistsFixture)

            let auctionContractAddress = await contract.idToAuction(1)
            const auctionContract = await hre.ethers.getContractAt("Auction", auctionContractAddress);
            
            let beneficiary = await auctionContract.beneficiary()
            let minimumBid = await auctionContract.minimumBid()
            
            expect(beneficiary).to.equal(account)
            expect(minimumBid).to.equal(MINMUM_BID_AUCTION_EXISTS_FIXTURE)
        })
        it("Should set ownerToAuctionId mapping for transaction sender - 7 points", async function() {
            const { contract, account, account2, account3 } = await loadFixture(auctionExistsFixture)

            let auctionNumber = await contract.ownerToAuctionId(account)
            expect(auctionNumber).to.equal(1)
        })
        it("Should set auctionToObject mapping for auctionNumber - 7 points", async function() {
            const { contract, account, account2, account3 } = await loadFixture(auctionExistsFixture)

            let assetId = await contract.auctionToObject(1)
            expect(assetId).to.equal(0)
        })
    })
    describe("bid - 30 points", function() {
        it("Should bid for the auction correlated with the assetId - 30 points", async function() {
            const { contract, account, account2, account3 } = await loadFixture(auctionExistsFixture)

            //make two bids, then check auction contract max bidder and min bid, no need to check payments?
            await contract.connect(account2).bid(1, {value: 11})
            await contract.connect(account3).bid(1, {value: 15})

            let auctionContractAddress = await contract.idToAuction(1)
            const auctionContract = await hre.ethers.getContractAt("Auction", auctionContractAddress);
            
            let maxBidder = await auctionContract.maxBidder()
            let minimumBid = await auctionContract.minimumBid()
            
            expect(maxBidder).to.equal(account3)
            expect(minimumBid).to.equal(15)
        })
    })
    describe("settleAuction - 30 points", function() {
        it("Should end the auction if called successfully - 10 points", async function() {
            const { contract, account, account2, account3 } = await loadFixture(auctionHasBidsFixture)

            await contract.connect(account).settleAuction(1)

            let auctionContractAddress = await contract.idToAuction(1)
            const auctionContract = await hre.ethers.getContractAt("Auction", auctionContractAddress);
            let ended = await auctionContract.auctionEnded();
            expect(ended).to.equal(true)
        })
        it("Should transfer the asset to the max bidder if called successfully - 10 points", async function() {
            const { contract, account, account2, account3 } = await loadFixture(auctionHasBidsFixture)

            await contract.connect(account).settleAuction(1)

            let assetId = await contract.auctionToObject(1)
            let assets = await contract.assetsOf(account3)
            expect(assets[0]).to.equal(assetId)

        })
    })
})