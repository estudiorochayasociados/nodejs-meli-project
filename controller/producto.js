const axios = require('axios');
const Productos = require('../model/Productos');

exports.getItemWeb = async (link) => {
    await axios.get(link)
        .then((response) => {
            response = response.data;
            response.forEach(item => {
                const data = {};
                data["titulo"] = item.data.titulo + "222";
                data["descripcion"] = {};
                data["descripcion"]["texto"] = item.data.desarrollo;
                data["stock"] = item.data.stock;
                data["codigo"] = {};
                data["codigo"]["web"] = item.data.cod;
                data["precios"] = {};
                data["precios"]["lista"] = (item.data.precio * 1);
                data["categoria"] = item["category"]["data"]["titulo"];
                data["subcategoria"] = item["category"]["subcategories"][0]["data"]["titulo"];
                data["images"] = item.images;
                console.log(data);
                Productos.findOne({ 'codigo.web': data["codigo"]["web"] }, (err, response) => {
                    if (err) console.log(err)
                    if (response) {
                        this.update(data);
                    } else {
                        this.create(data);
                    }
                });
            });
        })
        .catch(e => {
            console.log(e);
        })
}

exports.list = async () => {
    return Productos.find()
}

exports.create = (item) => {
    var data = new Productos(item);
    data.save(function (err, body) {
        if (err) console.log(err);
        return body
    })
};

exports.update = (item) => {
    return Productos.update({ 'codigo.web': item["codigo"]["web"] }, { $set: item }, function (err, body) {
        if (err) console.log(err)
        return body
    })
};

exports.view = (codigo) => {
    return Productos.findOne({ 'codigo.web': codigo }, function (err, body) {
        if (err) console.log(err);
        return body;        
    })
};
