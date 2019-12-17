const express = require('express');
const ProductController = require('../controller/ProductController');
var router = express.Router();

router.get("/getItemWeb", async (req, res) => {
    const get = await ProductController.getItemWeb("https://www.morano.com.ar/api/products/list-json.php");
    res.status(200).send({ get });
})

router.get("/", async (req, res) => {
    const get = await ProductController.list();
    res.status(200).send({ get });
})

router.get("/:id", async (req, res) => {
    console.log(req.params.id);
    let view = await ProductController.view(req.params.id);
    res.status(200).json(view);
})

router.post("/", async (req, res) => {
    const get = await ProductController.create(req.body);
    res.status(200).send({ get });
})

router.put("/", async (req, res) => {
    const get = await ProductController.update(req.body);
    res.status(200).send({ get });
})

module.exports = router;