var express = require('express');
var router = express.Router();
var mysql = require('./mysql');
var mysqlparams = require('./mysqlparams');
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

//var jwt = require('jsonwebtoken');
var sessionName = null;

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
    //var reqUsername = req.body.username;
    var reqUserEmail = req.body.username;
    var reqPassword = req.body.password;
    //var hash = bcrypt.hashSync(reqPassword, salt);
    var resData = {
        message:'',
        status: ''
    }

    var getUser="select userId,userName,userEmail,userPassword from tbllogin where userEmail='"+reqUserEmail+"'";
    console.log("Query is:"+getUser);
    mysql.fetchData(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            try{
                if(results.length > 0) {

                    if (bcrypt.compareSync(reqPassword, results[0].userPassword)) {
                        req.session.username = reqUserEmail;
                        req.session.userId = results[0].userId;
                        sessionName = req.session.userId;
                        console.log("session Initialized ");
                        console.log("Login successful");
                        resData.message = "Login successful";
                        res.json({
                            message: "Login successful",
                            status: '201',
                            email: results[0].userEmail,
                            name: results[0].userName,
                            token: req.session.id
                        })
                    }
                    else {
                        console.log("Invalid Password or UserName");
                        resData.message = "Invalid Password or UserName";
                        resData.status = "401";
                        // res.send(resData);
                        res.json({message: "Invalid Password or UserName", status: '401'});
                    }
                }
                else {
                    console.log("Invalid Login");
                    resData.message = "Login Failed";
                    resData.status = "401";
                    // res.send(resData);
                    res.json({message: "Login failed", status: '401'});
                }
            }catch(error){
                console.log("Exception occured" + error.toString());
            }

        }
    },getUser);
});

router.post('/saveData', function (req, res, next) {
    try{
        var reqUsername = req.body.username;
        var reqPassword = req.body.password;
        var reqEmail =  req.body.email;

        var hash = bcrypt.hashSync(reqPassword, salt);

        var putUser = "insert into tbllogin (`userName`,`userPassword`, `userEmail`) values " +
            "('"+reqUsername+"','" +hash+"','" +reqEmail+"')";

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
    }catch (error){
        console.log("Exception occured" + error.toString());
    }


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
                res.status(201).json({message: "fetch data successful", details: results});
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
   // console.log("In method redirect of users cookie " +req.session.userId);
    console.log("In method redirect of users cookie " +sessionName);
    if(req.session.userId!= null ){
        res.json({message: "Login done", status: '201'});
    }else {
        res.json({message: "Login failed", status: '401'});
    }
});

router.post('/logout', function (req,res, next){
    console.log(req.session.id);
    req.session.destroy();
    console.log('Session destroyed');
    sessionName = null;
    res.json({message: "Login failed", status: '201'});
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
    var reqEmployer = parseInt(sessionName);
    var reqDate = Date.now();
    console.log("user id is ", sessionName);

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

router.post('/getProjects', function(req, res, next){
    console.log("In fetch projects data for dashboard");
    if(req.session.userId!= null ) {
        var reqUserName = req.body.usename;

        var getProject = "select idtblProject, employerId, ProjectName, projectDescription, budgetRange," +
            "projectpay, postDate as EndDate, skills, Avg(bidAmount) as Bids, count(bidId) as count" +
            " from tblProject" +
            " LEFT JOIN tblBids ON tblProject.idtblProject = tblBids.projectId " +
            " where employerId=" + parseInt(req.session.userId) + " group by tblProject.idtblProject";

        console.log("Query is:" + getProject);

        mysql.fetchData(function (err, results) {
            if (err) {
                console.log(err.toString());
                throw err;
            }
            else {
                if (results.length > 0) {
                    console.log("valid username and pass", results.toString());
                    res.status(201).json({message: "fetch data successful",status:'201', details: results});
                    // res.send(resData);
                }
                else {
                    console.log("Invalid user name and pass");
                    res.status(401).json({message: "Failed to fetch data", status: '401'});
                }
            }
        }, getProject);
    }
    else {
        res.json({message: "Login failed", status: '401'});
    }

});

router.post('/editUpdateProfile', function (req, res, next) {
    console.log("In Post profile");
    var userId = req.session.userId;
    var proffesionHeading = req.body.proffesionHeading;
    var reqDescription = req.body.Description;
    var reqSkills =  req.body.skills;
    var reqPhone = req.body.phone;

    var reqDate = Date.now();
    console.log("user id is ", sessionName);

    var updateUsers = "update tbllogin set aboutUser = ? ,professionalHeading = ?,skills = ?,userPhone= ?  where userId = ?";
    var params = [reqDescription, proffesionHeading,reqSkills,reqPhone,userId ];

    console.log("Query is:"+updateUsers);

    mysqlparams.putdata(function(err,results){
        if(err){
            throw err;
        }
        else
        {
            if(results.affectedRows > 0){
                console.log("valid Signup");
                res.status(201).json({ status: '201'});
            }
            else {
                console.log("Invalid Sign up");
                res.status(401).json({ status: '401'});
            }
        }
    },params,updateUsers);
});

router.post('/getUserProfile', function(req, res, next){
    if(req.session.userId!= null ) {

        var getProfileData = "select * from tbllogin where userId=" + parseInt(req.session.userId) + "";
        console.log("Query is:" + getProfileData);

        mysql.fetchData(function (err, results) {
            if (err) {
                console.log(err.toString());
                throw err;
            }
            else {
                if (results.length > 0) {
                    console.log("valid username and pass", results.toString());
                    res.status(201).json({message: "fetch data successful",status:'201', details: results});
                    // res.send(resData);
                }
                else {
                    console.log("Session Expired");
                    res.status(401).json({message: "Failed to fetch data", status: '401'});
                }
            }
        }, getProfileData);
    }
    else {
        res.json({message: "Login failed", status: '401'});
    }

});

router.post('/getAllProjects', function(req, res, next){

    try{
        if(req.session.userId!= null ) {

            var getProject ="\n" +
                "select idtblProject, employerId, ProjectName, projectDescription, budgetRange," +
                "projectpay, DATE_ADD(postDate, INTERVAL 10 DAY) as 'EndDate' , skills, Avg(bidAmount) as 'Bids', count(bidId) as 'count'" +
                " from tblProject LEFT JOIN tblBids ON tblProject.idtblProject = tblBids.projectId group by tblProject.idtblProject"

            console.log("Query is:" + getProject);

            mysql.fetchData(function (err, results) {
                if (err) {
                    console.log(err.toString());
                    throw err;
                }
                else {
                    if (results.length > 0) {
                        console.log("valid username and pass", results.toString());
                        res.status(201).json({message: "fetch data successful",status:'201', details: results});
                        // res.send(resData);
                    }
                    else {
                        console.log("Invalid user name and pass");
                        res.status(401).json({message: "Failed to fetch data", status: '401'});
                    }
                }
            }, getProject);
        }
        else {
            res.json({message: "Login failed", status: '402'});
        }
    }catch(error){
        console.log("Exception in Dashboard Fetch " +error.toString());
    }
});

router.post('/getProjectDetails', function(req, res, next){
    try{
        console.log("In fetch function");
        var reqProjectId = (req.body.projectId!=null? parseInt(req.body.projectId): req.body.projectId)
        console.log(reqProjectId);
        if(req.session.userId!= null ) {

            var getProject = "select * from tblProject where idtblProject = "+reqProjectId;
            console.log("Query is:" + getProject);

            mysql.fetchData(function (err, results) {
                if (err) {
                    console.log(err.toString());
                    throw err;
                }
                else {
                    if (results.length > 0) {
                        console.log("valid username and pass", results.toString());
                        res.json({details: results, status:'201'});
                        // res.send(resData);
                    }
                    else {
                        console.log("Invalid user name and pass");
                        res.json({message: "Failed to fetch data", status: '401'});
                    }
                }
            }, getProject);
        }
        else {
            res.json({message: "Login failed", status: '402'});
        }

    }catch (exception) {
        console.log("In display project details: "+ exception.toString())
    }

});

router.post('/postBid', function (req, res, next) {
    try{
        var reqProjectId = (req.body.projectId!= null ? parseInt(req.body.projectId): req.body.projectId);
        var reqFreelancer = (sessionName!= null ? parseInt(sessionName): sessionName);
        var reqAmount = (req.body.bidamount!= null ? parseInt(req.body.bidamount): req.body.bidamount);
        var reqDuration = (req.body.duration!= null ? parseInt(req.body.duration): req.body.duration);

        console.log("user id is ", sessionName);

        var postBid = "insert into tblbids" +
            "(`projectId`,`userId`,`bidAmount`,`completionDays`) values " +
            "("+reqProjectId+","+reqFreelancer+"," +reqAmount+"," +reqDuration+")";

        console.log("Query is:"+postBid);

        mysql.fetchData(function(err,results){
            if(err){
                throw err;
            }
            else
            {
                if(results.affectedRows > 0){
                    console.log("Bid placed");
                    res.status(201).json({message: "Project posted successful", status: '201'});
                }
                else {
                    console.log("Invalid Sign up");
                    res.status(401).json({message: "Project not posted. Try again!", status: '401'});
                }
            }
        },postBid);

    }catch (error){
        concole.log("In Post Bid" +error.toString())
    }
});

router.post('/getBidInfo', function(req, res, next){
    console.log("In Bid function");
    var reqProjectId = (req.body.projectId!=null? parseInt(req.body.projectId): req.body.projectId)
    console.log(reqProjectId);
    if(req.session.userId!= null ) {


        var getBids = "select userName, userEmail, professionalHeading, skills, bidAmount, completionDays, bidAmount " +
            "from tblLogin, tblBids " +
            "where tblLogin.userId = tblBids.userId and tblBids.projectId ="+reqProjectId;

        console.log("Bid Query is:" + getBids);

        mysql.fetchData(function (err, results) {
            if (err) {
                console.log(err.toString());
                throw err;
            }
            else {
                if (results.length > 0) {
                    console.log("Bids retrived", results.toString());
                    res.json({details: results, status:'201'});
                    // res.send(resData);
                }
                else {
                    console.log("Something went wrong");
                    res.json({message: "Failed to fetch data", status: '401'});
                }
            }
        }, getBids);
    }
    else {
        res.json({message: "Login failed", status: '402'});
    }

});

module.exports = router;
