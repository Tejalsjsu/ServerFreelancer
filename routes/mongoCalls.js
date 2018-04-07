var express = require('express');
var dbConnection = require('./mongoodb');
var mongodb = require('mongodb');
var router = express.Router();
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt')
var salt = bcrypt.genSaltSync(10);
const mongoose = require('mongoose');
var {User} = require('./Schema');
var MongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/";
var ObjectId = require('mongodb').ObjectID;
var BidSchemas = require('../models/bid');
var ProjectSchema = require('../models/Project');


router.post('/signup_mongodb', function(req, res) {
    console.log("In login function");
        var reqUsername = req.body.username;
        var reqPassword = req.body.password;
        var reqEmail =  req.body.email;
        var hash = bcrypt.hashSync(reqPassword, salt);


    console.log("after url set");
    MongoClient.connect(url, function (err,db) {
        if(err){
            console.log(err.toString()+ " " +url);
        }
        else{
            console.log("Connection established");
        }
        var dbo = db.db("freelancer");
        var myobj = { username: reqUsername, password: hash, email: reqEmail};
        //var collection = db.collection("login");
        dbo.collection("login").insertOne(myobj, function(err, result){
            if(err){
                console.log("Error in getting result");
            }else if(result.length){
                res.status(201).json({'status': '201','userlist': result});
            }else{
                console.log('No documents found');
                res.json({'status': '401'});
            }
        });
    })

})


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});


 passport.use(new LocalStrategy(
     function(username, password, done) {
         console.log("username " +username+ " Pass " +password);
         MongoClient.connect(url, function (err,db) {
             if(err){
                 console.log(err.toString()+ " " +url);
             }
             else{
                 console.log("Connection established");
             }
             var dbo = db.db("freelancer");
             dbo.collection("login").findOne({ email: username }, function (err, user){
             if (err) throw err;
                 console.log(user);
                 if (!user) {
                     console.log("In !User error " +user.username);
                     return done(null, false, { message: 'Incorrect username.', isCorrect : 'false' });
                 }else{
                     console.log("COrrect username check pass " +user.password);
                     if(bcrypt.compareSync(password, user.password)){
                         console.log("In pass check" +user.password);
                         return done(null, {"email": user.email,"userId" : user._id, isCorrect: 'true'})
                     }
                     else{
                         console.log("Incorrect pass");
                         return done(err, false, { message: 'Incorrect password.' , isCorrect: 'false'});
                     }
                 }
             });
         });
     }
 ));


router.post('/login', function(req, res) {
    var username = req.body.name;
    var password = req.body.password;

    passport.authenticate('local', function(err, user) {
        if(err) {
            console.log("In err main" +err);
            res.status(401).json({message: "Invalid Password or UserName", status: '401'});
        } else {
            if(user.isCorrect == 'false'){
                console.log("No matching username from db");
                return res.status(401).send({
                    message: user.message,
                    status: '401'
                });
            }else{
                    req.session.user = user.email;
                    req.session.userId = user.userId;
                    console.log(req.session.user);
                console.log(req.session.userId);
                    console.log("session initilized");
                    return res.status(201).send({
                        message: "Login successful",
                        status: '201',
                        email: user.email,
                        userId: req.session.userId
                    });
                }
        }
    })(req, res);
});

router.post('/postproject', function (req, res, next) {
    console.log("In Post Project");
    var reqName = req.body.name;
    var reqDescription = req.body.description;
    var reqSkills =  req.body.skills;
    var reqPay = req.body.pay;
    var reqBudget = req.body.budget;
    var reqStatus = "Not Started";
    //var reqEmployer = req.session.userId;
    var reqEmployer = req.session.userId
    var reqDate = Date.now();
    console.log("session is " +reqEmployer);




    var postProject = "insert into tblproject" +
        "(`employerId`,`projectName`, `projectDescription`,`budgetRange`,`status`,`projectpay`) values " +
        "("+reqEmployer+",'"+reqName+"','" +reqDescription+"','" +reqBudget+"','" +reqStatus+"','" +reqPay+"')";

    console.log("Query is:"+postProject);

    mysql.fetchData(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            if(results.affectedRows > 0){
                console.log("valid Signup");
                res.status(201).json({message: "Project posted successful", status: '201'});
            }
            else {
                console.log("Invalid Sign up");
                res.status(401).json({message: "Project not posted. Try again!", status: '401'});
            }
        }
    },postProject);
});

router.post('/getProjectsByUser', function(req, res, next) {
    MongoClient.connect(url, function (err,db) {
        if(err){
            console.log(err.toString()+ " " +url);
        }
        else{
            console.log("Connection established");
        }
        var dbo = db.db("freelancer");
        //var collection = db.collection("login");
        dbo.collection("projects").find({employerId: req.session.userId}).toArray(function(err,result){
            if(err){
                console.log("Error in getting result");
            }else if(result.length){
                res.json({message: "fetch data successful",status:'201', details: result});
            }else{
                console.log('No documents');
            }
        });
    })

});

router.post('/getProjectDetails', function(req, res, next){
    try{
        console.log("In fetch function");
        var reqProjectId = req.body.projectId;
        console.log(reqProjectId);
        if(req.session.userId!= null ) {
            MongoClient.connect(url, function (err,db) {
                if (err) {
                    console.log(err.toString() + " " + url);
                }
                else {
                    console.log("Connection established");
                    var dbo = db.db("freelancer");
                    dbo.collection("projects").find({'_id': ObjectId(reqProjectId)}).toArray(function (err, result) {
                        if (err) {
                            console.log("Error in getting result");
                            res.json({message: "Failed to fetch data", status: '401'});
                        } else {
                            console.log(result);
                            console.log("Result " +result.length);
                            if (result.length) {
                                res.json({message: "fetch data successful", status: '201', details: result});
                            } else {
                                console.log('No documents');
                                res.json({message: "Failed to fetch data", status: '401'});
                            }
                        }
                    });
                }
            })
        }else{
            console.log("No UserID found");
            res.json({message: "Failed to fetch data", status: '401'});
        }
    }catch(exception){
        console.log(exception);
    }
});

router.post('/postBid', function (req, res, next) {
    try{
        var reqProjectId = req.body.projectId;
        var reqFreelancer = req.session.userId
        var reqAmount = (req.body.bidamount!= null ? parseInt(req.body.bidamount): req.body.bidamount);
        var reqDuration = (req.body.duration!= null ? parseInt(req.body.duration): req.body.duration);
        var bidDate = new Date(Date.now()).toISOString();

        MongoClient.connect(url, function (err,db) {
            if(err){
                console.log(err.toString()+ " " +url);
            }
            else{
                console.log("Connection established");
            }
            var dbo = db.db("freelancer");
            //var myobj = { projectId: reqProjectId, freelancerId: reqFreelancer, bidAmount: reqAmount, completionDays: reqDuration, bidDate: bidDate};
            var myobj = { freelancerId: reqFreelancer, bidAmount: reqAmount, completionDays: reqDuration, bidDate: bidDate};
            //var collection = db.collection("login");
            //dbo.collection("bids").insertOne(myobj, function(err, result){
            //$push created an array of bidsinfo
            dbo.collection("projects").update(
                {_id: ObjectId(reqProjectId)},
                {$push: {bidsinfo:
                            {freelancerId: reqFreelancer, bidAmount: reqAmount, completionDays: reqDuration, bidDate: bidDate}}},
                  function(err, result){
                    if(err){
                    console.log("Error in getting result" +err);
                    res.json({'status': '401'});
                    }else {
                     dbo.collection("projects").update(
                         {_id : ObjectId(reqProjectId)},
                         {$set: { status: "Assign Pending" }},
                     {upsert: true}
                 );
                    res.status(201).json({'status': '201','userlist': result});
                }
            });
        })
    }catch (error){
        console.log("Could not insert in mongo Bid" +error.toString())
    }
});


router.post('/getBidsAgg', async (req, res) => {
     BidSchemas.find({}, function(err, bidSchemas) {
         bidSchemas
             .group({
                 _id:'$projectId',
                 average :{ $avg: '$bidAmount'}
             })
         })
         console.log(bidSchemas);
         res.send(bidSchemas);
 });

// to find average
router.post('/getAllProjectsWithBids', function(req, res, next) {
    MongoClient.connect(url, function (err,db) {
        if(err){
            console.log(err.toString()+ " " +url);
        }
        else{
            console.log("Connection established");
        }
        var dbo = db.db("freelancer");
        //var collection = db.collection("login");
        dbo.collection("projects").aggregate(
            [
                {
                    "$unwind" : {
                        "path" : "$bidsinfo"
                    }
                },
                {
                    "$group" : {
                        "_id" : {
                            "projectId": "$_id",
                            "projectName" : "$projectName",
                            "projectDescription" : "$projectDescription",
                            "budgetRange" : "$budgetRange",
                            "skills" : "$skills",
                            "projectpay" : "$projectpay",
                            "status" : "$status",
                            "postProjectDate" : "$postProjectDate"
                        },
                        "average" : {
                            "$avg" : "$bidsinfo.bidAmount"
                        },
                        "averagecompletionDays" : {
                            "$avg" : "$bidsinfo.completionDays"
                        },
                        "count" : {
                            "$sum" : 1.0
                        }
                    }
                }
            ],
            {
                "allowDiskUse" : false
            }
        ).toArray(function(err,result){
            if(err){
                console.log("Error in getting result" +err);
            }else if(result.length){
                console.log("fetched successfully from db " +result[0].projectName);
                res.status(201).json({message: "Project not found. Try again!", status: '201', details: result});
            }else{
                res.json({message: "fetch data successful",status:'201', details: result});
                console.log('No documents found');
            }
        });
    })
});

module.exports = router;