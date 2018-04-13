var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

function mongoCon() {
    this.getConnection = function() {
        var MongoClient = mongodb.MongoClient;
        var url = "mongodb://localhost:27017/";
        MongoClient.connect(url,
            {poolSize: 10},
            function (err,db) {
            if(err){
                console.log(err.toString()+ " " +url);
            }
            else{
                console.log("Connection pooling established");
            }
            return db;
        });
    };
}
exports = module.exports = new mongoCon;

