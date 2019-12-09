const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = new Schema({
    nombre: {
        type: String,
        required: 'Please enter your nombre',
        trim: true,
        uppercase:true
    },
    apellido: {
        type: String,
        required: 'Please enter your apellido',
        trim: true,
        uppercase:true
    },
    email: {
        type: String,
        required: 'Please enter your email',
        trim: true,
        lowercase:true,
        unique : true
    },
    celular: Array,
    telefono: Array,
    domicilio: String,
    localidad: String,
    provincia: String,
    dni:{
       required:"numero dni" ,
       type: Number,
       trim:true,
       unique : true
    } ,
    fecha : {
        creacion:  { type: Date, default: Date.now },
        actualizacion: { type: Date, default: Date.now }
    }
});

module.exports = mongoose.model('User', User);