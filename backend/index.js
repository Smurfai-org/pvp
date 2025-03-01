const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Cia yra backend");
});

app.listen(5000, () => {
    console.log('listening on port 5000');
});