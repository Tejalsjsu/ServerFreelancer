var request = require('request'), express = require('express'), assert = require("assert"), http = require("http");

describe('http tests', function() {

     it('Should return project details', function(done) {
         request.post('http://localhost:3001/kafka/kafkaProducer/getProjectDetails', {
             form : {
                 projectId: '5abae7340597ae3b88395ed2'
             }
         }, function(error, response, body) {
             assert.equal(200, response.statusCode);
             done();
         })
     });


    it('login', function(done) {
        request.post('http://localhost:3001/kafka/kafkaProducer/login', {
            form : {
                name : 'tejalp@gmail.com',
                password : 'tejalp'
            }
        }, function(error, response, body) {
            assert.equal(201, response.statusCode);
            done();
        });
    });

    it('should signup', function(done) {
         request.post('http://localhost:3001/kafka/kafkaProducer/signup_mongodb', {
             form : {
                 email : 'mocha@gmail.com',
                 password : 'mocha',
                 username: 'mochauser'
             }
         }, function(error, response, body) {
             assert.equal(201, response.statusCode);
             done();
         });
     });

    it('Should return projects', function(done) {
        request.post('http://localhost:3001/kafka/kafkaProducer/getProjectsByUser', {
            form : {
                userId: '5abae7340597ae3b88395ed2'
            }
        }, function(error, response, body) {
            assert.equal(201, response.statusCode);
            done();
        })
    });


});