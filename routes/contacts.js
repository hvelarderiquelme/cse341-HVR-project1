const express = require('express');
const {ObjectId} = require('mongodb');
const{getCollection} = require('../config/db');
const router = express.Router();


/*****************************************************************
 * ********************   GET ROUTES   ***************************
******************************************************************/
//Home route
/**
 * @openapi
 * /:
 *   get:
 *     summary: Home route
 *     description: Returns a simple hello world message.
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', (req,res) => {
    res.send('Hello World');
});

//Endpoint: Get All contacts, type http://localhost:8080/contacts in the url box
/**
 * @openapi
 * /contacts:
 *   get:
 *     summary: Get all contacts
 *     description: Retrieve a standard array of all contact documents from the database.
 *     responses:
 *       200:
 *         description: A list of contacts.
 *       500:
 *         description: Database error.
 */
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
/**
 * @openapi
 * /contacts/{id}:
 *   get:
 *     summary: Get a single contact by ID
 *     description: Search the database for a matching unique _id record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique MongoDB Object ID
 *     responses:
 *       200:
 *         description: Contact object found.
 *       404:
 *         description: Contact not found.
 *       500:
 *         description: Invalid ID format.
 */
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

/**************************************************************************
 * **************************  POST ROUTES*********************************
 * ************************************************************************/
/**
 * @openapi
 * /contacts:
 *   post:
 *     summary: Create a new contact
 *     description: Inserts a new document into the MongoDB collection.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - favoriteColor
 *               - birthday
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               favoriteColor:
 *                 type: string
 *               birthday:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact created successfully.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Database insertion failed.
 */
router.post('/contacts', async(req,res) => {
    const {firstName, lastName, email, favoriteColor, birthday} = req.body;

    //Validate input
    if(!firstName || !lastName || !email || !favoriteColor || !birthday){
        return res.status(400).json({
            error: 'All fields (fieldName, lastName, email, favoriteColor, birthday) are required.'
        });
    }

    try {
        //calls the contacts collexction
        const contactsCollection = getCollection('contacts');
        //Assemble the new docuiment
        const newContact = { firstName, lastName, email, favoriteColor, birthday};
        //inserts the new document in the MOngoDB collection
        const result = await contactsCollection.insertOne(newContact);
        //returns the is of the new document
        return res.status(201).json({ id: newContact._id});
    } catch(error) {
        return res.status(500).json({error: 'Database saving failed.', details: error.message})
    }
});

/**************************************************************************
 * **************************  PUT ROUTES*********************************
 * ************************************************************************/
/**
 * @openapi
 * /contacts/{id}:
 *   put:
 *     summary: Update an existing contact
 *     description: Updates fields of a specific contact document using its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique MongoDB Object ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - favoriteColor
 *               - birthday
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               favoriteColor:
 *                 type: string
 *               birthday:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contact updated successfully.
 *       400:
 *         description: Missing required fields.
 *       404:
 *         description: Contact not found.
 *       500:
 *         description: Database update failed.
 */
router.put('/contacts/:id', async(req,res) => {
    const {id}=req.params;
    const {firstName, lastName, email, favoriteColor, birthday} = req.body;

    //Validate input
    if(!firstName || !lastName || !email || !favoriteColor || !birthday){
        return res.status(400).json({
            error: 'All fields (fieldName, lastName, email, favoriteColor, birthday) are required.'
        });
    }

    try {
        //calls the contacts collexction
        const contactsCollection = getCollection('contacts');
        //Assemble the updated fields
        const updateContact = { firstName, lastName, email, favoriteColor, birthday};
        //updates the document in the MOngoDB collection using its id
        const result = await contactsCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: updateContact}
        );
        //check if document was found
        if(result.matchedCount === 0){
            return res.status(404).json({error: 'Contact not found'});
        }
        //returns 204 no content status or 200 sucess message
        return res.status(200).json({ message: 'Contact updated successfully.' }); 
    } catch(error) {
        return res.status(500).json({error: 'Database saving failed.', details: error.message})
    }
});

/**************************************************************************
 * **************************  DELETE ROUTES*********************************
 * ************************************************************************/
/**
 * @openapi
 * /contacts/{id}:
 *   delete:
 *     summary: Delete a contact
 *     description: Deletes a document from the MongoDB collection using its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique MongoDB Object ID to delete
 *     responses:
 *       200:
 *         description: Contact deleted successfully.
 *       404:
 *         description: Contact not found.
 *       500:
 *         description: Database deletion failed.
 */
router.delete('/contacts/:id', async(req,res) => {
    const {id}=req.params;
    
    try {
        //calls the contacts collection
        const contactsCollection = getCollection('contacts');
        
        //deletes the document in the MOngoDB collection using its id
        const result = await contactsCollection.deleteOne(
            {_id: new ObjectId(id)}
        );
        //check if document was found
        if(result.deletedCount === 0){
            return res.status(404).json({error: 'Contact not found'});
        }
        //returns 200 sucess message
        return res.status(200).json({ message: 'Contact deleted successfully.' }); 
    } catch(error) {
        return res.status(500).json({error: 'Database saving failed.', details: error.message})
    }
});


module.exports = router;