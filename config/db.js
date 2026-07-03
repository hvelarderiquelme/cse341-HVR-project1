const {MongoClient} = require('mongodb');

//Connect Node.js to MogoDB Atlas database cluster
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'project-part1';

async function connectDB() {
  try {
    await client.connect(); 
    console.log(`Connected successfully to MongoDB Atlas database ${dbName}!`);
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
};

const getCollection = (collectionName) => {
    return client.db(dbName).collection(collectionName);
}

module.exports = {
    connectDB,
    getCollection
}
