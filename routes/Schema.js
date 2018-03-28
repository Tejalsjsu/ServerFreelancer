// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/freelancer');
// define the schema for our user model
var UserSchema = mongoose.Schema({

    username : { type:String, index : true },
    email     : {type:String},
    password  : {type:String}
});

// create the model for users and expose it to our app
var User = module.exports = mongoose.model('login', UserSchema);
// methods ======================

module.exports.comparePassword = function (candiadtePass, hash, callback) {
    bcrypt.compare(candiadtePass, hash, function (err, isMatch) {
        console.log("In compare pass");
        if(err) throw err;
        callback(null, isMatch);
    });
}

module.exports.getUserNameByUserName = function (username, callback) {
    console.log("In get username");
    var query = {username: username}
    User.findOne(query, callback);
}

module.exports.getUserById = function (id, callback) {
    console.log("Find by id");
    User.findById(id, callback);

}

module.exports.createUser = function (newUser, callback) {
        console.log("in save");
    User.markModified("login");
            User.save(newUser, true,  function (err, newUser) {
                if (err);
            });
}