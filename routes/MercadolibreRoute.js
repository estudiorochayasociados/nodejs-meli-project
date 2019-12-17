const express = require('express');
const config = require('dotenv').config();
const ProductController = require('../controller/ProductController');
const session = require("express-session");
const meli = require('../controller/MercadolibreController');

var router = express.Router();
//login user

const access_token = config.parsed.TOKEN;

router.get("/auth", async function (req, res) {
    const url = await meli.getUrlAuth(config.parsed.APP_ID, config.parsed.REDIRECT_URI + "/mercadolibre/login");
    console.log(url);
    res.redirect(url);
});

router.get("/login", async function (req, res) {
    const auth = await meli.auth(config.parsed.APP_ID, config.parsed.APP_SECRET, req.query.code, config.parsed.REDIRECT_URI + "/mercadolibre/login");
    console.log(auth);
    req.session.user_id = auth.user_id;
    req.session.access_token = auth.access_token;
    req.session.refresh_token = auth.refresh_token;
    res.json(auth)
}
);

//items
router.post("/item", async (req, res) => {
    const add = await meli.addProduct(req.body, true, 1.13, 1.28, req.session.access_token);
    res.status(200).send({ add });
});

router.put("/item", async (req, res) => {
    const edit = await meli.editProduct(req.body, true, 1.13, 1.28, req.session.access_token);
    res.status(200).send({ edit });
});

router.get("/item/:id", async (req, res) => {
    const get = await meli.getItem(req.params.id, req.session.access_token);
    res.status(200).send({ get });
});

router.get('/list-to-update-meli', async (req, res) => {
    var items = await ProductController.list();
    const add = [];
    const edit = [];
    i = 0;
    items.forEach(async (item) => {
        if (item.mercadolibre.length === 0) {
            await meli.addItem(item, true, 1.28, "gold_pro", req.session.access_token);
            await meli.addItem(item, true, 1.13, "gold_special", req.session.access_token);
        } else {
            item.mercadolibre.forEach(async (meli_item) => {
                const percent = (meli_item.type == "gold_pro") ? 1.28 : 1.13;
                await meli.editItem(meli_item.code, item, true, percent, meli_item.type, req.session.access_token);
                // console.log(meli_item);
            })
        }
    })

    res.send(200);
})

router.get('/change-all-status-item', async (req, res) => {
    var items = await ProductController.list();
    const obj = [];
    items.forEach(async (item) => {
        await meli.changeState(item.code.mercadolibre_premium, 'paused', req.session.access_token);
        await meli.changeState(item.code.mercadolibre_classic, 'paused', req.session.access_token);
    })
    res.status(200).send({ obj });
})

//ventas
router.get("/orders", async (req, res) => {
    const r = await meli.getOrders(access_token, 140101258, 1);
    console.log(r);
    res.json({ r });
});

router.get("/ordersGetAll", async (req, res) => {
    const orders = [];
    for (i = 1300; i < 2000; i++) {
        console.log(i)
        const r = await meli.getOrders(req.session.access_token, req.session.user_id, i);
        r.forEach(async element => {
            var buyer = (element.buyer);
            const data = [];
            data.nombre = buyer.first_name;
            data.apellido = buyer.last_name;
            data.email = buyer.email;
            data.celular = buyer.phone;
            data.telefono = buyer.alternative_phone;
            data.dni = buyer.billing_info.doc_number;
            //await user.create(data);
            console.log(data);
        });
    }
    res.json({ r });
});

module.exports = router;