const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
//const MongoDB = require("./config/MongoDB"); 
const app = express();
const config  = require('dotenv').config();
app.set('view options', { pretty: true });


console.log(config.parsed);

//settings
app.set('trust proxy', 1) // trust first proxy
app.use(
    session({
        secret: config.parsed.SESSION_SECRET,
        resave: false,
        maxAge: 3000000,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);
app.locals.pretty = true;
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(process.env.PORT || config.parsed.PORT);

//Routes
app.use('/mercadolibre', require("./routes/MercadolibreRoute"));
app.use('/product', require("./routes/ProductRoute"));