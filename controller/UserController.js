const UserModel = require('../model/UserModel');

exports.list = async () => {
    return UserModel.find();
}

exports.create = (item) => {
    var data = new UserModel(item);
    data.save(function (err, body) {
        if (err) console.log(err);
        return body
    })
};

exports.update = (item) => {
    return UserModel.findOneAndUpdate({ '_id': item._id }, { $set: item }, { new: true }, function (err, body) {
        if (err) console.log(err)
        return body
    })
};

exports.view = function (user_id) {
    return UserModel.findOne({ '_id': ObjectId(user_id)}, (err, res) => { return res });
};
 
exports.delete = function (user_id) {
    return UserModel.deleteOne({ '_id': ObjectId(user_id)}, (err, res) => { return res });
};