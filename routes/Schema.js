// app/models/user.js
// load the things we need
let mongoose = require('mongoose');
let bcrypt   = require('bcrypt');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost:27017/freelancer');
// define schema for our user model
let User = Schema({

    username : { type:String, index : true },
    email     : {type:String},
    password  : {type:String}
});
mongoose.model('login', User);

// create the model for users and expose it to our app
//let User = module.exports = mongoose.model('login', User);
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
    let query = {username: username}
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