const express = require("express");
const config = require("./config"); 
const app = express();

//settings
app.set('trust proxy', 1) // trust first proxy
app.use(
    config.session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        maxAge: 3000000,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);
app.locals.pretty = true;
app.use(config.morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(config.cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    next();
});

app.listen(process.env.PORT);

//Routes
app.use('/mercadolibre', require("./routes/MercadolibreRoute"));
app.use('/product', require("./routes/ProductRoute"));
app.use('/user', require("./routes/UserRoute"));

