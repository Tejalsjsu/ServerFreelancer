var express = require('express');
var router = express.Router();
var mysql = require('./mysql');
var session = require('client-sessions');
var app = express();
//var jwt = require('jsonwebtoken');

app.use(session({
    cookieName: 'session',
    secret: 'cmpe273_test_string',
    duration: 30 * 60 * 1000,    //setting the time for active session
    activeDuration: 5 * 60 * 1000,  })); // setting time for the session to be active when the window is open // 5 minutes set currently

const initialstate = {
    userdata: [
        {"id":1,"name":"Tejal","password":"Tejal"},
        {"id":2,"name":"Vish","password":"Vish"}
    ]
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send(initialstate);
});


router.post('/doLogin', function (req, res, next) {
    console.log("In server");
    var reqUsername = req.body.username;
    var reqPassword = req.body.password;
    var resData = {
        message:'',
        status: ''
    }

    var getUser="select userName,userEmail from tbllogin where userName='"+reqUsername+"' and userPassword='" +reqPassword+"'";
    console.log("Query is:"+getUser);

    mysql.fetchData(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            if(results.length > 0){
                console.log("valid login" , results[0].userEmail)
                resData.message =  "Login successful";

                // const token = jwt.sign({
                //     username: reqUsername
                // }, req.session.secret);
                //, token: token

                //Assigning the session
                session.Cookie.username = reqUsername;
                //req.session.password = reqPassword
                //console.log("session is " +req.session.username);
                //console.log(session);
                resData.status = "201";
                res.json({message: "Login successful", status: '201', email: results[0].userEmail, name : results[0].userName})
               // res.send(resData);
            }
            else {
                console.log("Invalid Login");
                resData.message =  "Login Failed";
                resData.status = "201";
               // res.send(resData);
                res.json({message: "Login failed", status: '401'});
            }
        }
    },getUser);
});


router.post('/saveData', function (req, res, next) {
    console.log("In sign up");
    var reqUsername = req.body.username;
    var reqPassword = req.body.password;
    var reqEmail =  req.body.email;

    var putUser = "insert into tbllogin (`userName`,`userPassword`, `userEmail`) values " +
        "('"+reqUsername+"','" +reqPassword+"','" +reqEmail+"')";

    console.log("Query is:"+putUser);

    mysql.fetchData(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            if(results.affectedRows > 0){
                console.log("valid Signu");
                res.status(201).json({message: "Signup successful", status: '201'});
            }
            else {
                console.log("Invalid Sign up");
                res.status(401).json({message: "Records not inserted", status: '401'});
            }
        }
    },putUser);
});

router.post('/getUserData', function(req, res, next){
   console.log("In fech data for dashboard");
   var reqUserName = req.body.usename;


    var getUser="select * from tbllogin where userName='"+reqUsername+"' and userPassword='" +reqPassword+"'";
    console.log("Query is:"+getUser);

    mysql.fetchData(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            if(results.length > 0){
                console.log("valid username and pass", +results.toJSON());
                res.status(201).json({message: "fetch data successful", details: results.toJSON()});
                // res.send(resData);
            }
            else {
                console.log("Invalid user name and pass");
                res.status(401).json({message: "Login failed"});
            }
        }
    },getUser);
});

router.get('/redirectToHomepage', function (req, res) {
    console.log("In method redirecte of users cookie " +session.Cookie.username);
    if(!req.session.username){
        console.log("Authenticated");
    }else {
        console.log("please login");
    }
return res.status(201);
});


module.exports = router;
