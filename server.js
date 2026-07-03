require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const contactRoutes = require('./routes/contacts');
//const {MongoClient, ObjectId} = require('mongodb');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use('/', contactRoutes);

//Start Server
async function startServer() {
    try {
        await connectDB();//wait for db to connect sucessfully
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log("Failed to connect to the database");
    }
};


startServer();