const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send("Cia yra backend");
});

app.listen(5000, () => {
    console.log('listening on port 5000');
});