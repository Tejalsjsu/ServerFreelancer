var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var connection = require('../mongoodb');
var MongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/";

function Insert(){
    this.postProject = function(project) {
        console.log("in insert" +project.projectName);
        MongoClient.connect(url, function (err,db) {
            if(err){
                console.log(err.toString()+ " " +url);
            }
            else{
                console.log("Connection established");
            }
            var dbo = db.db("freelancer");
            dbo.collection("project").insertOne(project, function(err, result){
                if(err){
                    console.log("Error in getting result");
                }else {
                    return result;
                }
            });
        })
    }
}

exports = module.exports = new Insert;