const mongoose = require('mongoose');
const { Schema } = mongoose;

const Productos = new Schema({
    titulo: {
        type: String,
        required: 'Ingresar titulo', 
        uppercase:true
    },
    categoria: {
        type: String,
        trim: true,
        uppercase:true
    },
    subcategoria: {
        type: String, 
        uppercase:true
    },
    stock: Number,
    codigo: {
        mercadolibre_clasica: {
            type: String
        },
        mercadolibre_premium: {
            type: String
        },
        web: {
            type: String,
            require: "Ingresar codigo",
            unique: true
        },
        sistema: {
            type: String
        }        
    },
    descripcion: {
        texto: String,
        ean: String,
        video: String,        
    },
    imagenes: Array,
    atributos: {
        condicion: String,
        color: String,
        marca: String
    },
    envio: Number,
    precios:{
       lista: {
           type: Number,
           require: "Ingresar precio lista"
       },
       clasica  : {
           type: Number,
           require: "Ingresar precio clasica"
       },
       premium: {
           type: Number,
           require: "Ingresar precio premium"
       }
    } ,
    fecha : {
        creacion:  { type: Date },
        actualizacion: { type: Date, default: Date.now }
    }
});

module.exports = mongoose.model('Productos', Productos);