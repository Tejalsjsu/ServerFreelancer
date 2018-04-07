var express = require('express');
var kafka = require('./client');
var router = express.Router();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/";
var kafka_topic = require('../../configs/kafka_topic').kafka_topic_enums;


router.post('/postproject', function (req, res, next) {
    console.log("In Post Project");
    var reqName = req.body.name;
    var reqDescription = req.body.description;
    var reqSkills =  req.body.skills;
    var reqPay = req.body.pay;
    var reqBudget = req.body.budget;
    var reqStatus = "Open";
    //var reqEmployer = req.session.userId;
    var reqDate = new Date(Date.now()).toISOString();

    kafka.make_request(kafka_topic.PROJECT,{"employerId": req.session.userId, "projectName":req.body.name, "projectDescription": reqDescription,"budgetRange": reqBudget, "skills": reqSkills,
    "projectpay": reqPay, "status": reqStatus, "postProjectDate": reqDate, "Bids": 0}, function(err,results){
        console.log(results);
        if(err){
            done(err,{});
            res.status(401).json({message: "Project not posted. Try again!", status: '401'});
        }
        else
        {
            if(results.status === 201){
                res.status(201).json({message: "Project posted successful", status: '201'});
            }
            else {
                console.log("Error in post "+results);
                res.status(201).json({message: "Project not posted. Try again!", status: '401'});
            }
        }
    });
});

router.post('/getAllProjects', function(req, res, next) {
    MongoClient.connect(url, function (err,db) {
        if(err){
            console.log(err.toString()+ " " +url);
        }
        else{
            console.log("Connection established");
        }
        var dbo = db.db("freelancer");
        //var collection = db.collection("login");
        dbo.collection("projects").find({}).toArray(function(err,result){
            if(err){
                console.log("Error in getting result");
            }else if(result.length){
                console.log("fetched successfully from db " +result[0].projectName);
                res.status(201).json({message: "Project not found. Try again!", status: '201', details: result});
                kafka.make_request('project',{"details": result }, function(err,resultsKafka){
                    if(err){
                        done(err,{});
                        res.status(401).json({message: "Project not posted. Try again!", status: '401'});
                    }
                    else {
                        console.log("Success");
                        res.status(201).json({message: "Project not found. Try again!", status: '201', details: resultsKafka});
                    }
                });
            }else{
                res.json({message: "fetch data successful",status:'201', details: result});
                console.log('No documents found');
            }
        });
    })
});

//fetch data from consumer from backend
router.post('/fetchAllProjects', function(req, res, next) {
    kafka.make_request(kafka_topic.FETCH,{"fetch": "AllProjects" }, function(err,resultsKafka){
        if(err){
            done(err,{});
            res.status(401).json({message: "Project not posted. Try again!", status: '401'});
        }
        else {
            console.log("Success" +resultsKafka.details);
            res.status(201).json({message: "Project not found. Try again!", status: '201', details: resultsKafka.details});
        }
    });
});

router.post('/addMoney', function (req, res, next) {
    console.log("In Add Money" +req.body.cardNo);
    let addDate = new Date(Date.now()).toISOString();

    if(req.session.userId != undefined){
        kafka.make_request(kafka_topic.USER,{"paymentData": req.body, "userId": req.session.userId, "addDate": addDate, "transactionType": 'Credit'}, function(err,results){
            console.log(results);
            if(err){
                done(err,{});
                res.status(401).json({message: "Money could not be added. Try again!", status: '401'});
            }
            else
            {
                if(results.status === 201){
                    res.status(201).json({message: "Money added successful", status: '201'});
                }
                else {
                    console.log("Error in post "+results);
                    res.status(401).json({message: "Project not posted. Try again!", status: '401'});
                }
            }
        });
    }else{
        res.json({status: '402'});
    }
});

router.post('/withdrawMoney', function (req, res, next) {
    let addDate = new Date(Date.now()).toISOString();

    if(req.session.userId != undefined){
        kafka.make_request(kafka_topic.USER,{"paymentData": req.body, "userId": req.session.userId, "addDate": addDate, "transactionType": 'Debit'}, function(err,results){
            console.log(results);
            if(err){
                done(err,{});
                res.status(401).json({message: "Money could not be added. Try again!", status: '401'});
            }
            else
            {
                if(results.status === 201){
                    res.status(201).json({message: "Money added successful", status: '201'});
                }
                else {
                    console.log("Error in post "+results);
                    res.status(401).json({message: "Project not posted. Try again!", status: '401'});
                }
            }
        });
    }else{
        res.json({status: '402'});
    }
});

module.exports = router;