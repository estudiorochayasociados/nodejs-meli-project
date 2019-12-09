const express = require('express');
const producto = require('../controller/producto');
const meli = require('../controller/mercadolibre');
var router = express.Router();

//login user
router.get("/auth", async function (req, res) {
    const url = await meli.getUrlAuth(app_id, redirect_url + '/login');
    res.redirect(url);
});

router.get("/login", async function (req, res) {
        const auth = await meli.auth(app_id, app_secret, req.query.code, redirect_url + '/login');
        req.session.user_id = auth.user_id;
        req.session.access_token = auth.access_token;
        req.session.refresh_token = auth.refresh_token;
        res.json(auth)
    }
);

//productos
router.post("/add-item", async (req, res) => {
    const add = await meli.addProduct(req.body, true, 1.13, 1.28, token);
    res.status(200).send({ add });
});

router.get("/edit-item", async (req, res) => {
    const edit = await meli.editProduct(req.body, true, 1.13, 1.28, token);
    res.status(200).send({ edit });
});

router.get("/get-item", async (req, res) => {
    const get = await meli.getItem("MLA828988721", token);
    res.status(200).send({ get });
});

router.get('/list-to-update-meli',async  (req,res) => {
    var items = await producto.list();
    const obj = [];
    var i = 0;
     items.forEach(async (item) => {
        if(item.codigo.mercadolibre_clasica === undefined || item.codigo.mercadolibre_premium === undefined) {
            const add = await meli.addProduct(item, false, 1.13, 1.28, token);
            obj.push(add);
            console.log(i++)
        } else {
            const edit = await meli.editProduct(item, false, 1.13, 1.28, token);
            obj.push(edit);
            console.log(i++)
        }        
    })
    res.status(200).send({ obj });
})

//ventas
router.get("/orders", async (req, res) => {
    const orders = [];
    res.header("Content-Type", 'application/json');
    for (i = 1300; i < 2000; i++) {
        console.log(i)
        const r = await meli.getOrders(token, "145263251", i);
        r.forEach(async element => {
            var buyer = (element.buyer);
            const data = [];
            data.nombre = buyer.first_name;
            data.apellido = buyer.last_name;
            data.email = buyer.email;
            data.celular = buyer.phone;
            data.telefono = buyer.alternative_phone;
            data.dni = buyer.billing_info.doc_number;
            await user.create(data);
        });
    }
    res.json({ orders });
});

module.exports = router;