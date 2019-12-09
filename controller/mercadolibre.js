const axios = require('axios');
const productos = require("./producto");

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
    console.log("https://api.mercadolibre.com/orders/search?seller=" + seller_id + "&offset=" + page + "&access_token=" + token);
    return await axios.get("https://api.mercadolibre.com/orders/search?seller=" + seller_id + "&offset=" + page + "&access_token=" + token)
        .then(response => {
            return response.data.results;
        })
}


//CATEGORIES 
exports.getPredictionCategorie = async (title) => {
    return axios.get("https://api.mercadolibre.com/sites/MLA/category_predictor/predict?title=" + title)
        .then(async r => {
            var data = {};
            var id = r.data.id;
            if (r.data.shipping_modes.indexOf("me2")) {
                dimensions = await this.getShippingDimension(id);
                data["dimensions"] = dimensions;
            }
            data["id"] = id;
            return data;
        });

}

exports.getShippingDimension = async (categorie) => {
    return await axios.get("https://api.mercadolibre.com/categories/" + categorie + "/shipping_preferences")
        .then(r => {
            if (r.data.dimensions !== null) {
                dimensions = r.data.dimensions.height + "x" + r.data.dimensions.width + "x" + r.data.dimensions.length + "," + r.data.dimensions.weight;
            } else {
                dimensions = 0;
            }
            return dimensions;
        });
}


//SHIPPING
exports.shippingPriceByDimension = async (dimension) => {
    return await axios.get("https://api.mercadolibre.com/sites/MLA/shipping_options?zip_code_from=2400&zip_code_to=1001&dimensions=" + dimensions)
        .then(r => {
            price = r["data"]["options"]["0"]["list_cost"] + 100;
            return price;
        });
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

/** 
 * @param data => model product listing check on models
 * @param addShipping => true or false
 * @param percentClassic => 1.13% example
 * @param percentPremium => 1.28% example
 * @param token => get of auth page
 */

exports.addProduct = async (data, addShipping, percentClassic, percentPremium, token) => {
    //CREATE OBJETO MELI
    const itemMeli = {};
    itemMeli.title = data.titulo;
    itemMeli.currency_id = "ARS";
    itemMeli.available_quantity = (data.stock) ? data.stock : 1;
    itemMeli.buying_mode = "buy_it_now";
    itemMeli.condition = "new";
    itemMeli.description = { plain_text: data.descripcion.texto };
    itemMeli.pictures = [{ source: "https://www.morano.com.ar/assets/img/logo.png" }];

    //PREDICCION DE LA CATEGORIA VIA TITULO
    const category = await this.getPredictionCategorie(data.titulo + data.categoria + data.subcategoria);

    //CALCULAR PRECIO ME2 X CATEGORIA
    var shipping = (addShipping === true && category.dimension !== null) ? await this.shippingPriceByDimension(category.dimension) : 0;
    itemMeli.category_id = category.id;

    //CALCULAR PRECIOS SEGUN EL TIPO DE PUBLICACION
    var classicPrice = (data.precios.lista * percentClassic) + shipping;
    var premiumPrice = (data.precios.lista * percentPremium) + shipping;

    //AGREGAR ITEM EN TIPO PREMIUM
    itemMeli.listing_type_id = "gold_pro";
    itemMeli.price = premiumPrice.toFixed(2);
    

    var premium = await axios.post("https://api.mercadolibre.com/items?access_token=" + token, itemMeli)
        .then(response => {
            data.codigo.mercadolibre_premium = response.data.id;
            data.precios.premium = premiumPrice.toFixed(2);
            productos.update(data);
            return response.data;
        })
        .catch(e => {
            console.log(e.response.data);
        })

    //AGREGAR ITEM EN TIPO CLASSIC
    itemMeli.listing_type_id = "gold_special";
    itemMeli.price = classicPrice.toFixed(2);
    console.log(itemMeli);
    var clasica = await axios.post("https://api.mercadolibre.com/items?access_token=" + token, itemMeli)
        .then(response => {
            data.codigo.mercadolibre_clasica = response.data.id;
            data.precios.clasica = classicPrice.toFixed(2);
            productos.update(data);
            return response.data;
        })
        .catch(e => {
            console.log(e.response.data);
        })
}

exports.editProduct = async (data, addShipping, percentClassic, percentPremium, token) => {
    //CREATE OBJETO MELI
    const itemMeli = {};
    itemMeli.title = data.titulo;
    itemMeli.available_quantity = (data.stock) ? data.stock : 1;
    itemMeli.pictures = [{ source: "https://www.morano.com.ar/assets/img/logo.png" }];

    //PREDICCION DE LA CATEGORIA VIA TITULO PARA AGREGAR AL PRECIO DEL ENVIO
    const categorie = await this.getPredictionCategorie(data.titulo + data.categoria + data.subcategoria);
    var shipping = (addShipping === true && categorie.dimension !== null) ? await this.shippingPriceByDimension(categorie.dimension) : 0;

    //CALCULAR PRECIOS SEGUN EL TIPO DE PUBLICACION
    var classicPrice = (data.precios.lista * percentClassic) + shipping;
    var premiumPrice = (data.precios.lista * percentPremium) + shipping;

    //EDITAR ITEM EN TIPO PREMIUM
    if (data.codigo.mercadolibre_premium !== null) {
        itemMeli.price = premiumPrice.toFixed(2);
        var premium = await axios.put("https://api.mercadolibre.com/items/" + data.codigo.mercadolibre_premium + "?access_token=" + token, itemMeli)
            .then(response => {
                data.precios.premium = premiumPrice.toFixed(2);
                productos.update(data);
                console.log(true);
                return response.data;                
            })
            .catch(e => {
                console.log(e.response.data.cause);
            })
    }

    //EDITAR ITEM EN TIPO CLASSIC
    if (data.codigo.mercadolibre_clasica !== null) {
        itemMeli.price = classicPrice.toFixed(2);
        var clasica = await axios.put("https://api.mercadolibre.com/items/" + data.codigo.mercadolibre_clasica + "?access_token=" + token, itemMeli)
            .then(response => {
                data.precios.clasica = classicPrice.toFixed(2);
                productos.update(data);
                console.log(true);
                return response.data;
            })
            .catch(e => {
                console.log(e.response.data.cause);
            })
    }
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