var mongoose = require('mongoose');

module.exports = mongoose.model('Answer', {

    Question : {_id : {type : mongoose.Schema.ObjectId},
                Title : {type : String, default: ''},
                Subject : {type : String, default: ''}},
    Answer : {type : String, default: ''}

});
