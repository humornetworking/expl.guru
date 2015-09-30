var express  = require('express');
var app      = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jwt        = require("jsonwebtoken");
var connections = {};
app.set('connections', connections);

require('./app/util/socket.js')(app,io,jwt);

var mongoose = require('mongoose'); 					// mongoose for mongodb



var port  	 = process.env.PORT || 8080; 				// set the port
var setup = require('./config/setup'); 			// load the database config
var morgan   = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');






var mailgun = require("mailgun-js")({apiKey: setup.mail_api_key, domain: setup.mail_domain});

// configuration ===============================================================
mongoose.connect(setup.database); 	// connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
app.set('superSecret', setup.secret); // secret variable


// routes ======================================================================
require('./app/routes.js')(app, jwt, mailgun);


http.listen(port, function(){
    console.log('listening on *:8080');
});




