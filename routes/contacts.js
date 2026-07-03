const express = require('express');
const {ObjectId} = require('mongodb');
const{getCollection} = require('../config/db');
const router = express.Router();


//Home route
router.get('/', (req,res) => {
    res.send('Hello World');
});

//Endpoint: Get All contacts, type http://localhost:8080/contacts in the url box
router.get('/contacts', async(re,res) => {
    try{
        //for my collection
        const collection = getCollection('contacts');
        //Find all documents and convert them into a stanard JAvaScript array
        const allContacts = await collection.find({}).toArray();
        res.json(allContacts);
    }catch(error){
        res.status(500).send("Error pulling data from the database.");
    }
    
});


// Endpoint: GET ONE single contact by its unique ID. 
// Type http://localhost:8080/contacts/{any id from the database}

router.get('/contacts/:id', async (req, res) => {
    try {
        const collection = getCollection('contacts');
        
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



module.exports = router;