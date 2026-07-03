const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;

app.use(cors());

//end point returnign "Hello World"
app.get('/', (req, res) => {
    res.send(`Hello World`);
});

app.listen(PORT, () => {
    console.log(`Server is running in port ${PORT}`);
});