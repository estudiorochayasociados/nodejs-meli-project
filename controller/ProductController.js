const axios = require('axios');
const ProductsModel = require('../model/ProductModel');

exports.updateProductsWithWeb = async (link) => { 
    var add = [];
    var update = [];
    var totalArray = [];
    this.setStock(0);
    return axios.get(link)
        .then(async r => {
            console.log("start");
            for await (const item of r.data) {
                var itemSearch = await this.view(item.data.cod);                
                if (itemSearch) {
                    const images = [];
                    itemSearch.title = item.data.titulo;
                    itemSearch.description.text = item.data.desarrollo;
                    itemSearch.description.video =  process.env.VIDEO_ITEM;
                    itemSearch.stock = (item.data.stock) ? item.data.stock : 1;
                    itemSearch.code.web = item.data.cod;
                    itemSearch.price.default = item.data.precio;
                    itemSearch.category = item.category.data.titulo;
                    itemSearch.subcategory = item.category.subcategories[0].data.titulo;
                    item.images.forEach(img => {
                        images.push({ "source": "https://www.morano.com.ar/" + img.ruta, "order": img.orden })
                    });
                    images.push({ "source": "https://www.morano.com.ar/assets/img/logo.png", "order": 1 })
                    itemSearch.images = images;
                    this.update(itemSearch);
                    update.push({product:itemSearch.title});
                } else {
                    const data = {};
                    data.description = {};
                    data.code = {};
                    data.price = {};
                    const images = [];
                    data.title = item.data.titulo;
                    data.description.text = item.data.desarrollo;
                    data.description.video =  process.env.VIDEO_ITEM;
                    data.stock = (item.data.stock) ? item.data.stock : 1;
                    data.code.web = item.data.cod;
                    data.price.default = item.data.precio;
                    data.category = item.category.data.titulo;
                    data.subcategory = item.category.subcategories[0].data.titulo;
                    item.images.forEach(img => {
                        images.push({ "source": "https://www.morano.com.ar/" + img.ruta, "order": img.orden })
                    });
                    images.push({ "source": "https://www.morano.com.ar/assets/img/logo.png", "order": 1 })
                    data.images = images;
                    this.create(data);
                    add.push({product:data.title});                    
                }
            } 
            totalArray.push({"add" : add, "update" : update});
            console.log("end");
            return await totalArray;
        }) 
}

exports.list = async () => {
    return ProductsModel.find();
}

exports.create = (item) => {
    var data = new ProductsModel(item);
    data.save(function (err, body) {
        if (err) console.log(err);
        return body
    })
};

exports.update = (item) => {
    return ProductsModel.update({ 'code.web': item.code.web }, { $set: item }, function (err, body) {
        if (err) console.log(err)
        return body
    })
};

exports.view = function (codigo) {
    return ProductsModel.findOne({ 'code.web': codigo }, (err, res) => { return res });
};

exports.setStock = function(stock) {
    return ProductsModel.updateMany({}, { stock: stock })
}