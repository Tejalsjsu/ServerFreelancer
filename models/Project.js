const mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/freelancer');


const ProjectSchemas = new Schema({
    projectId: {type: Schema.Types.ObjectId},
    employerId: {type: Schema.Types.ObjectId , ref: 'logins'},
    projectName: String,
    projectDescription: String,
    budgetRange: String,
    skills: String,
    projectpay: String,
    status: String,
    postProjectDate :String,
    count: Number,
    average: Number

});
var model = mongoose.model('projects', ProjectSchemas);

module.exports = model;
