const express = require('express');
const producto = require('../controller/producto');
var router = express.Router();

router.get("/list", async (req, res) => {
    //const get = await producto.getItemWeb("https://www.morano.com.ar/api/products/list-json.php");
    const get = await producto.list();
    res.status(200).send({ get });
}) 

module.exports = router;