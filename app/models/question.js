var mongoose = require('mongoose');

module.exports = mongoose.model('Question', {
    Title : {type : String, default: ''},
    Subject : {type : String, default: ''}
});