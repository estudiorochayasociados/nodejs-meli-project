const express = require("express");
const session = require("express-session");
const mercadolibreRoute = require("./routes/mercadolibre");
const productoRoute = require("./routes/producto");
const app = express();

//app.use(express.json());
const mongoose = require('mongoose'); 

mongoose.connect('mongodb+srv://estudiorocha:faAr2010@estudiorocha-t104t.mongodb.net/meli-node?retryWrites=true&w=majority', function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Server successfully!');
    }
});

//config meli
const app_id = "5757202621369035";
const app_secret = "DbQn2RQNQ0gxt7hObFDN0kx9Adcfk68X";
const redirect_url = "http://localhost:3000/mercadolibre";
const token = "APP_USR-5757202621369035-120915-378dcfe663d0b38d5886c3e5da3911ff-140101258";
const refresh = "TG-5de9655af99fe200063a398d-145263251";

//settings
app.set('trust proxy', 1) // trust first proxy
app.use(
    session({
        secret: "343ji43j4n3jn4jk3n",
        resave: false,
        maxAge: 3000000,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

app.listen(process.env.PORT || 3000, process.env.HOST || "192.168.0.155");

//Routes
app.get('/hola', (res,req) => {
    res.json({"status": "HOLA"});
});
app.use('/mercadolibre', mercadolibreRoute);
app.use('/productos', productoRoute);
 