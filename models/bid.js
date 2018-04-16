const mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/freelancer');


const BidSchemas = new Schema({
    projectId: {type: Schema.Types.ObjectId, ref: 'projects'},
    bidAmount: Number,
    completionDays: Number,
    bidDate:String
});
var model = mongoose.model('bids', BidSchemas);

module.exports = model;
