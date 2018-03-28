var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongoURL = "mongodb://localhost:27017/freelancer";
var kafka = require('./kafka/client');


var Producer = kafka.Producer,
    client = new kafka.Client(),
    producer = new Producer(client);

producer.on('ready', function () {
    console.log('Producer is ready');
});

producer.on('error', function (err) {
    console.log('Producer is in error state');
    console.log(err);
})
