const express = require('express');
const session = require("express-session");
const ProductController = require('../controller/ProductController');
const MercadolibreController = require('../controller/MercadolibreController');
const TokenController = require('../controller/TokenController');
var router = express.Router();
//login user

router.get("/auth", async function (req, res) {
    const url = await MercadolibreController.getUrlAuth(process.env.APP_ID, process.env.REDIRECT_URI + "/mercadolibre/login");
    //res.redirect(url);
    res.send(url);
});

router.get("/login", async function (req, res) {
    const auth = await MercadolibreController.auth(req.query.code, process.env.REDIRECT_URI + "/mercadolibre/login");
    if (auth) {
        req.session.user_id = auth.user_id;
        req.session.access_token = auth.access_token;
        req.session.refresh_token = auth.refresh_token;
        res.json(auth)
    }
}
);

router.get("/refresh-token", async (req, res) => {
    const token = await TokenController.view(process.env.USER_ID); //get token mongodb
    const reAuth = await MercadolibreController.checkToken(token.access_token);
    if (reAuth) {
        req.session.user_id = reAuth.user_id;
        req.session.access_token = reAuth.access_token;
        req.session.refresh_token = reAuth.refresh_token;
        res.json(reAuth)
    }
});

//items
router.post("/item", async (req, res) => {
    const token = await TokenController.view(process.env.USER_ID); //get token mongodb
    const add = await MercadolibreController.addItem(req.body.item, req.body.shipping, req.body.percent, req.body.type, token.access_token);
    res.status(200).send(add);
});

router.put("/item/:id", async (req, res) => {
    const token = await TokenController.view(process.env.USER_ID); //get token mongodb
    const edit = await MercadolibreController.editItem(req.params.id, req.body.item, req.body.shipping, req.body.percent, req.body.type, token.access_token);
    res.status(200).send(edit);
});

router.get("/item/:id", async (req, res) => {
    const get = await MercadolibreController.getItem(req.params.id, token.access_token);
    res.status(200).send({ get });
});
 
router.get('/change-all-status-item', async (req, res) => {
    var items = await ProductController.list();
    const obj = [];
    items.mercadolibre.forEach(async (item) => {
        await MercadolibreController.changeState(item.code, 'paused', token.access_token);
    })
    res.status(200).send({ obj });
})

router.get('/change-status/:id', async (req, res) => {
    const token = await TokenController.view(process.env.USER_ID); //get token mongodb
    const obj = await MercadolibreController.changeState(req.params.id, req.body.status, token.access_token);
    res.status(200).send(obj);
})

//ventas
router.get("/orders", async (req, res) => {
    MercadolibreController.getOrders(token.access_token, 140101258, 1).then((err, data) => {
        if (err) res.send(400).json(err.data);
        res.json({ data });
    });
});

router.get("/ordersGetAll", async (req, res) => {
    const orders = [];
    for (i = 1300; i < 2000; i++) {
        console.log(i)
        const r = await MercadolibreController.getOrders(token.access_token, req.session.user_id, i);
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