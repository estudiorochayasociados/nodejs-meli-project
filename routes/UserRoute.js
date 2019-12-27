const express = require('express');
const UserController = require('../controller/UserController');
var router = express.Router();

router.get("/", async (req, res) => {
    const get = await UserController.list();
    res.status(200).send(get);
})

router.get("/:id", async (req, res) => {
    let view = await UserController.view(req.params.id);
    res.status(200).json(view);
})

router.post("/", async (req, res) => {
    const get = await UserController.create(req.body);
    res.status(200).send({ get });
})

router.put("/", async (req, res) => {
    const get = await UserController.update(req.body);
    res.status(200).send({ get });
})

router.delete("/:id", async (req, res) => {
    let del = await UserController.delete(req.params.id);
    res.status(200).json(del);
})

module.exports = router;