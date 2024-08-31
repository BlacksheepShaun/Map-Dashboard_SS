const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
    res.send('Hello from the Nde.js backend');
});

app.get('/get_text', (req, res) => {
    res.send('We are sending backend text');
});

app.listen(port, () => {
    console.log(`Server is running on port number ${port}`);
});

