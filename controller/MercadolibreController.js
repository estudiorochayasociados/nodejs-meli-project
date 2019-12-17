const ProductController = require("./ProductController")
const axios = require('axios');
const ProductsModel = require('../model/ProductModel');

//AUTH LOGIN
exports.getUrlAuth = async (app_id, redirect_uri) => {
    return "http://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=" + app_id + "&redirect_uri=" + redirect_uri;
}

exports.auth = async (id, secret, code, redirect_uri) => {
    return axios.post('https://api.mercadolibre.com/oauth/token?grant_type=authorization_code',
        {
            client_id: id,
            client_secret: secret,
            code: code,
            redirect_uri: redirect_uri
        })
        .then(response => {
            return response.data
        })
        .catch(error => {
            console.log(error);
        })
}

exports.refreshToken = async (id, secret, refresh_token) => {
    return axios.post('https://api.mercadolibre.com/oauth/token?grant_type=refresh_token',
        {
            client_id: id,
            client_secret: secret,
            refresh_token: refresh_token
        })
        .then(response => {
            return response.data
        })
        .catch(error => {
            console.log(error);
        })
}

//ORDERS
exports.getOrders = async (token, seller_id, page) => {
    return await axios.get("https://api.mercadolibre.com/orders/search?seller=" + seller_id + "&offset=" + page + "&access_token=" + token)
        .then(response => {
            return response.data.results;
        })
}

//CATEGORIES 
exports.getPredictionCategory = async (title) => {
    return axios.get("https://api.mercadolibre.com/sites/MLA/category_predictor/predict?title=" + title)
        .then(async r => {
            var data = {};
            data.dimensions = 0;
            var id = r.data.id;
            if (r.data.shipping_modes.indexOf("me2")) {
                dimensions = await this.getShippingDimension(id);
                if (dimensions) {
                    data.dimensions = dimensions;
                }
            }
            data.id = id;
            return data;
        })
        .catch(e => {
            console.log(e.response);
        })

}

exports.getShippingDimension = async (categorie) => {
    return await axios.get("https://api.mercadolibre.com/categories/" + categorie + "/shipping_preferences")
        .then(r => {
            if (r.data.dimensions != null) {
                dimensions = r.data.dimensions.height + "x" + r.data.dimensions.width + "x" + r.data.dimensions.length + "," + r.data.dimensions.weight;
            } else {
                dimensions = 0;
            }
            return dimensions;
        })
        .catch(e => {
            console.log(e.response);
        })
}


//SHIPPING
exports.shippingPriceByDimension = async (dimension) => {
    return await axios.get("https://api.mercadolibre.com/sites/MLA/shipping_options?zip_code_from=2400&zip_code_to=1001&dimensions=" + dimensions)
        .then(r => {
            price = r["data"]["options"]["0"]["list_cost"] + 100;
            return price;
        })
        .catch(e => {
            console.log(e.response.data);
        })
}

//PRODUCTS
exports.getItem = (item_id, token) => {
    return axios.get("https://api.mercadolibre.com/items/" + item_id + "?access_token=" + token)
        .then(response => {
            return response.data;
        })
        .catch((error) => {
            if (error.response) {
                return error.response
            }
            return "Problem submitting New Post", error;
        });
}



exports.addItem = async (data, addShipping, percentPrice, type, token) => {
    //PREDICCION DE LA CATEGORIA VIA TITULO
    const category = await this.getPredictionCategory(data.title + data.category + data.subcategory);

    //CALCULAR PRECIO ME2 X CATEGORIA
    var shipping = (addShipping === true && category.dimensions !== 0) ? await this.shippingPriceByDimension(category.dimensions) : 0;

    //CREATE OBJETO MELI
    const itemMeli = {};
    itemMeli.title = data.title;
    itemMeli.currency_id = "ARS";
    itemMeli.available_quantity = (data.stock) ? data.stock : 1;
    itemMeli.buying_mode = "buy_it_now";
    itemMeli.condition = "new";
    itemMeli.price = ((data.price.default * percentPrice) + shipping).toFixed(2);
    itemMeli.description = { plain_text: data.description.text };
    itemMeli.pictures = [];
    itemMeli.attributes = [];
    itemMeli.attributes.push({"id": "EAN","name": "EAN","value_id": null,"value_name": "7794940000796"});
    data.images.forEach(img => {
        itemMeli.pictures.push({ source: img.source });
    });    
    itemMeli.pictures.push({ source: "https://www.morano.com.ar/assets/img/logo.png" });
    itemMeli.video_id = data.description.video;
    itemMeli.listing_type_id = type;
    itemMeli.category_id = category.id;

    //AGREGAR ITEM EN TIPO PREMIUM
    await axios.post("https://api.mercadolibre.com/items?access_token=" + token, itemMeli)
        .then(response => {
            console.log(response.data);
            ProductsModel.findOne({ "code.web": data.code.web }, (err, product) => {
                const meli_id = response.data.id;
                product.mercadolibre.push({ type: type, code: response.data.id, price: itemMeli.price, percent: percentPrice });
                product.save((err) => {
                    if(err) console.log(err);
                });
            });
            return true;
        })
        .catch(e => {
            //console.log(e.response.data);
        })
}

exports.editItem = async (itemId, data, addShipping, percentPrice, type, token) => {
    //PREDICCION DE LA CATEGORIA VIA TITULO
    const category = await this.getPredictionCategory(data.title + data.category + data.subcategory);

    //CALCULAR PRECIO ME2 X CATEGORIA
    var shipping = (addShipping === true && category.dimensions !== 0) ? await this.shippingPriceByDimension(category.dimensions) : 0;

    await this.changeState(itemId, 'active', token);

    //CREATE OBJETO MELI
    const itemMeli = {};
    itemMeli.title = data.title;
    itemMeli.available_quantity = (data.stock) ? data.stock : 1;
    itemMeli.price = ((data.price.default * percentPrice) + shipping).toFixed(2);
    itemMeli.video_id = data.description.video;
    itemMeli.pictures = [];
    itemMeli.attributes = [];
    itemMeli.attributes.push({"id": "EAN","name": "EAN","value_id": null,"value_name": "7794940000796"});
    data.images.forEach(img => {
        itemMeli.pictures.push({ source: img.source });
    });    
    itemMeli.pictures.push({ source: "https://www.morano.com.ar/assets/img/logo.png" });

    //AGREGAR ITEM EN TIPO PREMIUM
    await axios.put("https://api.mercadolibre.com/items/" + itemId + "?access_token=" + token, itemMeli)
        .then(response => {
            //console.log(response.data);
            ProductsModel.findOne({ "mercadolibre.code" : itemId }, (err, product) => {                
                indexMeliObject = product.mercadolibre.findIndex(x => x.code === itemId);
                product.mercadolibre.splice(indexMeliObject,1);
                product.mercadolibre.push({ type: type, code: itemId, price: itemMeli.price, percent: percentPrice });
                product.save(function (err) {
                    if (err) { console.log(err) }
                });

            });
            return response;
        })
        .catch(e => {
            console.log(e.response.data);
        })
}

exports.editProductDescription = (item_id, data, token) => {
    return axios.put("https://api.mercadolibre.com/items/" + item_id + "/description?access_token=" + token, data)
        .then(response => {
            return response.data;
        })
        .catch((error) => {
            if (error.response) {
                return error.response
            }
            return "Problem submitting New Post", error;
        });
}

exports.changeState = (item_id, status, token) => {
    return axios.put("https://api.mercadolibre.com/items/" + item_id + "?access_token=" + token, { "status": status })
        .then(response => {
            return response.data;
        })
        .catch((error) => {
            if (error.response) {
                return error.response
            }
            return "Problem submitting New Post", error;
        });
}