var express    	= require('express');
var app        	= express(); 				
var bodyParser 	= require('body-parser');

// Configure the API route settings
var api = require('./routes/api');
app.use('/api', function(req, res, next) {
	console.log('Setting headers');
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	console.log('Headers set');
	next();
});

// Set up global middleware
app.use(bodyParser());

// all of our routes will be prefixed with /api
app.use('/api', api);

// Start the server
var port = process.env.PORT || 8080;
app.listen(port);
console.log('Magic happens on port ' + port);