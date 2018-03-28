var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');
var monk = require ('monk');
//var db = monk('mongodb://localhost:27017');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/ GET Userlist page. /
router.get('/userlist', function(req, res) {
    var MongoClient = mongodb.MongoClient;
    var url = "mongodb://localhost:27017/";
    MongoClient.connect(url, function (err,db) {
        if(err){
            console.log(err.toString()+ " " +url);
        }
        else{
            console.log("Connection established");
        }
        var dbo = db.db("freelancer");
        //var collection = db.collection("login");
        dbo.collection("login").find({}).toArray(function(err,result){
            if(err){
                console.log("Error in getting result");
            }else if(result.length){
            res.json({'userlist': result});
            }else{
                console.log('No documents found');
            }
        });
    })

});


module.exports = router;
