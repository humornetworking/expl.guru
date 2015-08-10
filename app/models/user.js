
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    name: String,
    email: String,
    type: String,
    token: String
});

module.exports = mongoose.model('User', UserSchema);