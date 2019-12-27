const TokenModel = require('../model/TokenModel');
const dateNow = require("moment-timezone").tz("America/Argentina/Buenos_Aires").format();

exports.list = async () => {
    return TokenModel.find();
}

exports.create = (item) => {
    var data = new TokenModel(item);
    data.save(function (err, body) {
        if (err) console.log(err);
        return body
    })
};

exports.update = (item) => {
    item.date = dateNow;
    return TokenModel.findOneAndUpdate({ 'user_id': item.user_id }, { $set: item }, { new: true }, function (err, body) {
        if (err) console.log(err)
        return body
    })
};

exports.view = function (user_id) {
    return TokenModel.findOne({ 'user_id': user_id }, (err, res) => { return res });
};
 