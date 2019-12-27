const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = new Schema({
    email: {
        type: String,
        required: 'require'        
    },
    password: {
        type: String,
        required: 'require'        
    },
    role: Array
},{ 
    versionKey: false 
});

module.exports = mongoose.model('User', User);