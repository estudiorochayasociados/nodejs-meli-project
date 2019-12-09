const express = require('express');
const producto = require('../controller/producto');
var router = express.Router();

app.get("/list", async (req, res) => {
    const get = await producto.getItemWeb("https://www.morano.com.ar/api/products/list-json.php");
    res.status(200).send({ get });
}) 

module.exports = router;