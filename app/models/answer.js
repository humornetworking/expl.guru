var mongoose = require('mongoose');

module.exports = mongoose.model('Answer', {

    _id : {type : mongoose.Schema.ObjectId},
    question : {_id : {type : mongoose.Schema.ObjectId},
                Title : {type : String, default: ''},
                Subject : {type : String, default: ''}},
    answer : {type : String, default: ''}

});
