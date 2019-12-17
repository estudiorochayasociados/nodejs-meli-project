const axios = require('axios');
const User = require('../model/UserModel');

exports.create =  (json) => {
    console.log(json);
    const data = new User(json);
    data.save(function(err, body) {
        if(err) console.log(err)
        console.log(body)
    });
};