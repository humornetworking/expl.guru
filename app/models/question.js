var mongoose = require('mongoose');

module.exports = mongoose.model('Question', {
    /*_id : {type : mongoose.Schema.ObjectId},*/
    Title : {type : String, default: ''},
    Subject : {type : String, default: ''},
    User : {
        _id: {type : String, default: ''},
        Name: {type : String, default: ''},
        Email: {type : String, default: ''}


    },
    Date: { type: Date, default: Date.now }
});