var express    			= require('express');
var router 				= express.Router();
var Busboy 				= require('busboy');
var fs 					= require('fs');
var os 					= require('os');
var cluster 			= require('cluster');
var path 				= require('path');
var Table 				= require('../models/tables/table.js');
var Registration 		= require('../models/registration.js');

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	var env = process.env.NODE_ENV  || 'development';
	res.json({ message: 'hooray! welcome to our api! You are in the ' + env + ' environment' });
	// console.log(app.get('env'));	
});

router.route('/columns')

	// Create new columns
	.post(function(req, res) {

		var table = new Table();
		table.add(req.body.data.type, req.body.data.columns, req.body.data.entities, function(err) {
			if (err) {
				console.log(err);
				res.json({
					status: 'fail',
					message: err
				});
			} else {
				res.json({
					status: 'success',
					data: null
				});
			}
			res.end();
		});
	})

	// Perform a search given a query
	.get(function(req, res) {
		
		var table = new Table();
		table.search(req.query.query, req.query.page || 0, function(err, data) {
			if (err) {
				console.log(err);
				res.json({
					status: 'fail',
					message: err
				});
			} else {
				res.json({
					status: 'success',
					data: data
				});
			}
			res.end();
		});
	});

router.route('/columns/table/:id')

	.post(function(req, res) {
		var table = new Table();
		table.update(req.params.id, req.body, function(err) {
			if (err) {
				res.json({
					status: 'fail',
					message: err
				});
			} else {
				res.json({
					status: 'success',
				});
			}
		});
	})

	.get(function(req, res) {
		var table = new Table();
		table.find(req.params.id, req.query.page || 0, function(err, data) {
			if (err) {
				res.json({
					status: 'fail',
					message: err.message
				});
			} else {
				res.json({
					status: 'success',
					data: data
				});
			}
		});
	});

router.route('/columns/table')

	.post(function(req, res) {
		var table = new Table();
		var busboy = new Busboy({ headers: req.headers });

		var filePath = path.join( os.tmpdir(), new Date().toISOString() + '_' + cluster.worker.id + '.csv' );
		var fileStream = fs.createWriteStream( filePath );

		busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

		    file.pipe( fileStream );

		    fileStream.on('finish', function() {
		    	console.log( 'Creating new table from file:' );
				table.create(req.body, filePath, function(err, id) {
					if (err) {
						res.json({
							status: 'fail',
							message: err
						});
					} else {
						res.json({
							status: 'success',
							data: {
								table_id: id
							}
						});
					}
				});
		    });

		    file.on('data', function(data) {
		        console.log('File [' + fieldname +'] got ' + data.length + ' bytes');
		    });

		    file.on('end', function() {
		        console.log("file finished: " + filename);
		    });
		});

		busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
		    req.body[fieldname] = val;
		});

		busboy.on('finish', function () {
		    console.log("finished");
		});

		req.pipe(busboy);

		// console.log( 'Creating new table from file:' );
		// console.log( req.busboy );
		// table.create(req.body, req.files.data.path, function(err, id) {
		// 	if (err) {
		// 		res.json({
		// 			status: 'fail',
		// 			message: err
		// 		});
		// 	} else {
		// 		res.json({
		// 			status: 'success',
		// 			data: {
		// 				table_id: id
		// 			}
		// 		});
		// 	}
		// });
	})

	// Return a table for a given id
	.get(function(req, res) {
		res.end();
	});

router.route('/columns/register')

	.post(function( req, res ) {

		var registration = new Registration;
		registration.registerUser( req.body.user, function( err ) {
			if (err) {
				res.json({
					status: 'fail',
					message: err
				});
			} else {
				res.json({
					status: 'success'
				});
			}
		});
	});

module.exports = router;
