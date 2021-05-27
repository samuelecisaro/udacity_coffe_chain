// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')
var DistributorRole = artifacts.require('DistributorRole')
var RetailerRole = artifacts.require('RetailerRole')
var ConsumerRole = artifacts.require('ConsumerRole')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei("2", "wei")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Harvested()
        await supplyChain.Harvested((err, res) => {
            eventEmitted = true
        });

        // Mark an item as Harvested by calling function harvestItem()
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')     
        assert.equal(eventEmitted, true, 'Invalid event emitted')        
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false
        
        // Watch the emitted event Processed()
        await supplyChain.Processed((err, res) => {
            eventEmitted = true
        });

        // Mark an item as Processed by calling function processtItem()
        await supplyChain.processItem(upc, {from: originFarmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBuffer = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBuffer[5], 1, 'Error: Wrong state, should be "Processed"');
        assert.equal(eventEmitted, true, 'Invalid event emitted');
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Processed()
        await supplyChain.Processed((err, res) => {
            eventEmitted = true
        });
        

        // Mark an item as Packed by calling function packItem()
        await supplyChain.packItem(upc, {from: originFarmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBuffer = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBuffer[5], 2, 'Error: Wrong state, should be "Packed"');
        assert.equal(eventEmitted, true, 'Invalid event emitted');
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Processed()
        await supplyChain.Processed((err, res) => {
            eventEmitted = true
        });
        
        // Mark an item as Packed by calling function packItem()
        await supplyChain.sellItem(upc, productPrice, {from: originFarmerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBuffer = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBuffer[2], productPrice, 'Error: Wrong price' + resultBuffer[2] + productPrice);
        assert.equal(resultBuffer[5], 3, 'Error: Wrong state, should be "ForSale"');
        assert.equal(eventEmitted, true, 'Invalid event emitted');
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Sold()
        await supplyChain.Sold((err, res) => {
            eventEmitted = true
        });
        
        // Mark an item as Packed by calling function buyItem()
        await supplyChain.addDistributor(distributorID);
        await supplyChain.buyItem(upc, {from: distributorID, value: productPrice});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBuffer = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBuffer[5], 4, 'Error: Wrong state, should be "Sold"');
        assert.equal(resultBuffer[6], distributorID, 'Error: Wrong address');
        assert.equal(eventEmitted, true, 'Invalid event emitted');
    })    

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Shipped()
        await supplyChain.Shipped((err, res) => {
            eventEmitted = true
        });
        
        // Mark an item as Packed by calling function shipItem()
        await supplyChain.shipItem(upc, {from: distributorID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBuffer = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBuffer[5], 5, 'Error: Wrong state, should be "Shipped"');
        assert.equal(eventEmitted, true, 'Invalid event emitted');
    })    

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()
        

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Received()
        await supplyChain.Received((err, res) => {
            eventEmitted = true
        });
        
        
        // Mark an item as Received by calling function receiveItem()
        await supplyChain.addRetailer(retailerID)
        await supplyChain.receiveItem(upc, {from: retailerID}); 

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBuffer = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBuffer[5], 6, 'Error: Wrong state, should be "Received"');
        assert.equal(resultBuffer[7], retailerID, 'Error: Wrong address');
        assert.equal(eventEmitted, true, 'Invalid event emitted');
    })    

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Declare and Initialize a variable for event
        var eventEmitted = false

        // Watch the emitted event Purchased()
        await supplyChain.Purchased((err, res) => {
            eventEmitted = true
        })
        
        
        // Mark an item as Purchased by calling function purchaseItem()
        await supplyChain.addConsumer(consumerID);
        await supplyChain.purchaseItem(upc, {from: consumerID});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBuffer = await supplyChain.fetchItemBufferTwo.call(upc);

        // Verify the result set
        assert.equal(resultBuffer[5], 7, 'Error: Wrong state, should be "Purchased"');
        assert.equal(resultBuffer[8], consumerID, 'Error: Wrong address');
        assert.equal(eventEmitted, true, 'Invalid event emitted');
    })    

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBuffer = await supplyChain.fetchItemBufferOne.call(upc);
        
        // Verify the result set:
        assert.equal(resultBuffer[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBuffer[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBuffer[2], consumerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBuffer[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBuffer[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBuffer[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBuffer[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBuffer[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBuffer = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBuffer[0], sku, 'Error')
        assert.equal(resultBuffer[1], upc, 'Error')
        assert.equal(resultBuffer[2], productID, 'Error')
        assert.equal(resultBuffer[3], productNotes, 'Error')
        assert.equal(resultBuffer[4], productPrice, 'Error')
        assert.equal(resultBuffer[5], 7, 'Error')
        assert.equal(resultBuffer[6], distributorID, 'Error')
        assert.equal(resultBuffer[7], retailerID, 'Error')
        assert.equal(resultBuffer[8], consumerID, 'Error')
        
    })

});

