require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {MongoClient, ObjectId} = require('mongodb');


const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

//Connect Node.js to MogoDB Atlas database cluster
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'project-part1';

//end points

//Home route (Hello World fallback)
app.get('/', (re,res) => {
    res.send('Hello World');
});

//Endpoint: Get All contacts
app.get('/contacts', async(re,res) => {
    try{
        //for my collection
        const collection = client.db(dbName).collection('contacts');
        //Find all documents and convert them into a stanard JAvaScript array
        const allContacts = await collection.find({}).toArray();
        res.json(allContacts);
    }catch(error){
        res.status(500).send("Error pulling data from the database.");
    }
    
});

// Endpoint 2: GET ONE single contact by its unique ID
app.get('/contacts/:id', async (req, res) => {
    try {
        const collection = client.db(dbName).collection('contacts');
        
        // Convert the text ID string from the URL into a real MongoDB Object ID
        const contactId = new ObjectId(req.params.id);
        
        // Search the database for the matching unique _id record
        const singleContact = await collection.findOne({ _id: contactId });
        
        if (!singleContact) {
            return res.status(404).send("Contact not found.");
        }
        
        res.json(singleContact);
    } catch (error) {
        res.status(500).send("Contact ID is formatted incorrectly or does not exist.");
    }
});


async function startServer() {
  try {
    await client.connect(); 
    console.log("Connected successfully to MongoDB Atlas database!");
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
}

startServer();