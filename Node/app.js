const OAuthToken = require('./ebay_oauth_token');
const http = require('http');
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const cors = require('cors');
const express = require('express');
const app = express();
const axios = require('axios');
const querystring = require('querystring');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://neha41998:salesfoce@cluster0.sy5xrr2.mongodb.net/?retryWrites=true&w=majority";

let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const APPID = 'NehaTyag-Assignme-PRD-f72726e2f-5a99afdc';
client_id = "NehaTyag-Assignme-PRD-f72726e2f-5a99afdc";
client_secret = "PRD-72726e2f7b4a-a841-43c7-8587-6394";
const searchEngineId = 'd79a6aa4c06c74cd7'
const apiKey = 'AIzaSyA9jLJwzIPs2QvSu1ljNmXFd8CzJJI47sY'

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
    let db;
  client.connect().then((client) => {
    db = client.db('Hw3'); // Replace with your database name
    console.log("Connected to MongoDB");
  }).catch(console.dir);
  
  app.post('/api/wishlist', async (req, res) => {     //add endpoint
      try {
        const product = req.body; 
        const collection = db.collection('Cluster0'); 
        const result = await collection.insertOne(product);
        console.log("Product added to wishlist:", product); 
        console.log("result",result);
        res.status(201).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    });
  
  app.get('/api/wishlist', async (req, res) => {      //retrieve all endpoint
    try {
      const collection = db.collection('Cluster0'); 
      const wishlistItems = await collection.find({}).toArray();
      res.json(wishlistItems);
      // console.log(res.json(wishlistItems));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete('/api/wishlist/:id', async (req, res) => {       //delete endpoint
      try {
        const itemId = req.params.id;
        const collection = db.collection('Cluster0'); 
      //   const { ObjectId } = require('mongodb');
        const result = await collection.deleteOne({ itemId: itemId });
      // const result = await collection.deleteOne({ _id: new ObjectId(itemId) });
        if (result.deletedCount === 1) {
          console.log(`Successfully deleted one document with id ${itemId}`);
          res.status(204).end();
        } else {
          res.status(404).json({ error: "Document not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    });
    
  }
  run().catch(console.dir);

app.get('/api/autocomplete-zip', async (req, res) => {
    try {
      const { zipCode } = req.query;
  
      // Make a request to the Geonames API
      const geonamesResponse = await axios.get(`http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=${zipCode}&maxRows=5&username=ntyagi&country=US`);
    //   console.log(geonamesResponse);
      // Extract relevant data from the Geonames API response
      const suggestions = geonamesResponse.data.postalCodes.map(code => code.postalCode);
  
      res.json({ suggestions });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'An error occurred while fetching suggestions.' });
    }
});

app.get('/api/eBayFormData', async (req, res) => {
     console.log("YOOOO",req.query);
    const { keyword, category, new: isNew, used, unspecified, localPickup, freeShipping, distance, zipCode } = req.query;

    let url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${APPID}&RESPONSE-DATA-FORMAT=JSON&RESTPAYLOAD&paginationInput.entriesPerPage=50&keywords=${keyword}&buyerPostalCode=${zipCode}`;

    let filterIndex = 0;
    
    if (distance) {
        url += `&itemFilter(${filterIndex}).name=MaxDistance&itemFilter(${filterIndex}).value=${distance}`;
        filterIndex++;
    }
    if (category && category!='undefined') {
      url += `&itemFilter(${filterIndex}).name=categoryID&itemFilter(${filterIndex}).value=${category}`;
      filterIndex++;
  }
    
    if (freeShipping === 'true') {
        url += `&itemFilter(${filterIndex}).name=FreeShippingOnly&itemFilter(${filterIndex}).value=true`;
        filterIndex++;
    }
    
    if (localPickup === 'true') {
        url += `&itemFilter(${filterIndex}).name=LocalPickupOnly&itemFilter(${filterIndex}).value=true`;
        filterIndex++;
    }
    
    const conditions = [];
    if (isNew === 'true') conditions.push("1000"); // Assume "1000" means New
    if (used === 'true') conditions.push("3000");  // Assume "3000" means Used
    if (unspecified === 'true') conditions.push("4000");  // Assume "4000" means Unspecified

    if (conditions.length) {
        url += `&itemFilter(${filterIndex}).name=Condition`;
        conditions.forEach((condition, conditionIndex) => {
            url += `&itemFilter(${filterIndex}).value(${conditionIndex})=${condition}`;
        });
        filterIndex++;
    }

    url += `&itemFilter(${filterIndex}).name=HideDuplicateItems&itemFilter(${filterIndex}).value=true`;

    url += `&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo`;
    // console.log("URL",url);
    try {
      console.log("URL--",url)
        const ebayResponse = await axios.get(url);
        //res.json(ebayResponse.data);

        let items = ebayResponse.data?.findItemsAdvancedResponse?.[0].searchResult?.[0].item || [];
          // console.log("ITEMSSSSSSS: ",items);
        let processedData = items.map((item, index) => {
            // console.log("TEST",item.sellingStatus[0]);
             //console.log("TESTING",item.itemId);
            return {
                index: index + 1,
                image: item.galleryURL ? item.galleryURL : 'N/A',
                title: item.title || "N/A",
                price: item.sellingStatus[0]?.currentPrice?.[0]?.__value__ || "N/A",
                shipping: item.shippingInfo[0]?.shippingServiceCost?.[0]?.__value__ === '0.0' ? "Free Shipping" : (item.shippingInfo[0]?.shippingServiceCost?.[0]?.__value__ || "N/A"),
                zip: item.postalCode || "N/A",
                itemId: item.itemId[0] || "N/A",
                shippingInfo: item.shippingInfo || "N/A",
                returnsAccepted: item.returnsAccepted || "N/A",
                sellerInfo: item.sellerInfo || "N/A",
                storeInfo: item.storeInfo ||"N/A",
                viewItemURL: item.viewItemURL[0] ||"N/A"
            };
        });

        res.json(processedData);
        // console.log("YO: ",res);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while fetching data from eBay.' });
    }
});

app.get('/api/singleItemDetail', async (req, res) => {
    try {
        const { itemId } = req.query;
    
        let url = 'https://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=NehaTyag-Assignme-PRD-f72726e2f-5a99afdc&siteid=0&version=967&ItemID=%5BITEMID%5D&IncludeSelector=Description,Details,ItemSpecifics'
        url = url.replace('%5BITEMID%5D', itemId)
        // console.log(url);
         oAuthtokenObj = new OAuthToken(client_id,client_secret);
        //  console.log("TOKEN+",oAuthtokenObj);

        let headers = {
            headers:{
            "X-EBAY-API-IAF-TOKEN": await oAuthtokenObj.getApplicationToken()
            } 
        }
        
        const singleItemResponse = await axios.get(url, headers );
        // console.log("YOYOY",singleItemResponse);
        let items = singleItemResponse.data?.Item || [];
        if (!Array.isArray(items)) {
            items = items ? [items] : [];
        }
        let singleItemDetail = items.map((item, index) => {
            // console.log("YOYOY",item);
            return {
                productImages: item.PictureURL || "N/A",
                price: item.CurrentPrice.Value || "N/A",
                location: item.Location || "N/A" ,
                returnPolicy: item.ReturnsAccepted + ' within ' + item.ReturnPolicy.ReturnsWithin ,
                itemSpecifics: item.ItemSpecifics.NameValueList || "N/A" ,
                itemId: item.ItemID || "N/A"
            };
        });
         res.json(singleItemDetail);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ error: 'An error occurred while fetching suggestions.' });
    }
});

app.get('/api/productImages', async (req, res) => {
    try {
        const { prodTitle } = req.query;
        // /const productTitle = req.query.title;

        let decodedStr = querystring.unescape(prodTitle);
        let cleanedStr = decodedStr.replace(/[^\w\s]/gi, '');
        let url = `https://www.googleapis.com/customsearch/v1?q=${cleanedStr}&cx=${searchEngineId}&imgSize=huge&num=8&searchType=image&key=${apiKey}`
        // console.log('URLLL',url)
        const productImages = await axios.get(url);
        // console.log('HELLO',relatedItem.data)
         res.json(productImages.data)
        
   
    } catch (error) {
        console.error('Axios Error:', error);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.get('/api/similarProductsData', async (req, res) => {
    try {
        const { itemId } = req.query;
        //console.log('ITEMID',itemId)
        let url = `https://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICEVERSION=1.1.0&CONSUMER-ID=${APPID}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId=${itemId}&maxResults=20`
        console.log('URLLL',url)
        const relatedItem = await axios.get(url);
        console.log('HELLO',relatedItem.data)
        let items = relatedItem.data?.getSimilarItemsResponse?.itemRecommendations?.item || [];

        let processedData = items.map((item, index) => {
            // let text = item.timeLeft.substring(item.timeLeft.indexof('P'),item.timeLeft.indexof('D'))
            return {
                imageURL: item.imageURL ? item.imageURL : 'N/A',
                viewItemURL: item.viewItemURL ? item.viewItemURL : 'N/A',
                prodName: item.title ? item.title : 'N/A',
                price: item.buyItNowPrice.__value__  ? item.buyItNowPrice.__value__ : 'N/A',
                shippingCost: item.shippingCost.__value__ ? item.shippingCost.__value__ : 'N/A',
                daysLeft : item.timeLeft ? item.timeLeft.split('P')[1].split('D')[0] : 'N/A'
            };
        });
         console.log("HEHE",processedData)
        res.json(processedData)
        
   
    } catch (error) {
        console.error('Axios Error:', error);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});


app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});