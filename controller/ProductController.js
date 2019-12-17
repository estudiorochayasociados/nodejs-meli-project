const axios = require('axios');
const ProductsModel = require('../model/ProductModel');

exports.getItemWeb = async (link) => {
    await axios.get(link)
        .then((response) => {
            response = response.data;
            response.forEach(item => {
                console.log(item);
                ProductsModel.findOne({ 'code.web': item.data.cod }, (err, response) => {
                    if (err) console.log(err)
                    if (response) {
                        const images = [];
                        response.title = item.data.titulo;
                        response.description.text = item.data.desarrollo;
                        response.description.video = "https://youtu.be/HKTa9jnsoZ4";                        
                        response.stock = (item.data.stock) ? item.data.stock : 1 ;
                        response.code.web = item.data.cod;
                        response.price.default = item.data.precio;
                        response.category = item.category.data.titulo;
                        response.subcategory = item.category.subcategories[0].data.titulo;
                        item.images.forEach(img => {
                            images.push({ "source" : "https://www.morano.com.ar/" + img.ruta, "order" : img.orden} )
                        });       
                        response.images = images;     
                        this.update(response);                        
                    } else {
                        const data = {};
                        data.description = {};
                        data.code = {};
                        data.price = {};
                        const images = [];
                        data.title = item.data.titulo;
                        data.description.text = item.data.desarrollo;
                        data.description.video = "https://youtu.be/HKTa9jnsoZ4";                        
                        data.stock = (item.data.stock) ? item.data.stock : 1 ;
                        data.code.web = item.data.cod;
                        data.price.default = item.data.precio;
                        data.category = item.category.data.titulo;
                        data.subcategory = item.category.subcategories[0].data.titulo;
                        item.images.forEach(img => {
                            images.push({ "source" : "https://www.morano.com.ar/"+img.ruta, "order" : img.orden} )
                        });       
                        data.images = images;    
                        this.create(data);                        
                    }
                }) 
            });
        })
        .catch(e => {
            console.log(e);
        })
}

exports.list = async () => {
    return ProductsModel.find()
}

exports.create = (item) => { 
    var data = new ProductsModel(item);
    data.save(function (err, body) {
        if (err) console.log(err);
        return body
    })
};

exports.update = (item) => {
    return ProductsModel.update({ 'code.web': item.code.web}, { $set: item }, function (err, body) {
        if (err) console.log(err)
        return body
    })
};

exports.view = (codigo) => {
    return ProductsModel.findOne({ 'code.web': codigo }, function (err, body) {
        if (err) console.log(err);
        return body;
    })
};