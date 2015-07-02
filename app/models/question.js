var mongoose = require('mongoose');

module.exports = mongoose.model('Question', {
    /*_id : {type : mongoose.Schema.ObjectId},*/
    Title : {type : String, default: ''},
    Subject : {type : String, default: ''}
});