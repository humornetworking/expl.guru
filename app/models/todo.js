var mongoose = require('mongoose');

module.exports = mongoose.model('Todo', {
	busqueda : {type : String, default: ''}
});