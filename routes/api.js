var express    			= require('express');
var router 				= express.Router();
var Busboy 				= require('busboy');
var fs 					= require('fs');
var os 					= require('os');
var cluster 			= require('cluster');
var path 				= require('path');
var Table 				= require('../models/tables/table.js');
var Registration 		= require('../models/registration.js');
var ShareMessage 		= require('../models/share-message.js');
var common 	   			= require('../common');
var config 	   			= common.config();
var hbs 				= require('hbs');
var path 				= require('path');

// Redirect root requests (http://colum.nz)
// to the web app for now
router.get('/', function(req, res) {
	res.redirect( config.app.host );
});

// Testing embeddable table
router.get('/test-table/:id', function( req, res ) {
	res.render( 'test-table', {
		embed_host: config.embed.host,
		embed_id: req.params.id || 1
	});
});

// Route for getting just the embed script for a particular table
// This is useful when the embed needs to be served via an iframe
router.get('/embed-table/:id', function( req, res ) {
	res.render( 'embed-table', {
		embed_host: config.embed.host,
		embed_id: req.params.id
	});
});

router.get('/:id', function( req, res ) {

	// Get the data for this table id
	var table = new Table();
	table.getMetaData(req.params.id, function(err, data) {
		if ( err ) {
			console.log( err );
			res.render( 'table', {
				title: "Ain't no table here"
			});
		} else {
			// Send up handelbars helper
			hbs.registerHelper('ifIsProduction', function( options ) {
				return process.env.NODE_ENV === 'production' ? options.fn(this) : options.inverse(this);
			});

			// Set up share message generator
			var shareMessage = new ShareMessage( data );
			console.log( data );

			res.render( 'table', {
				title: data.title || 'Untitled',
				embed_host: config.embed.host,
				embed_id: req.params.id || 1,
				embed_uri: encodeURIComponent( config.embed.host + '/' + req.params.id || 1 ),
				tweet_body: encodeURIComponent( shareMessage.twitterMessage() ),
				email_subject: shareMessage.emailMessage().subject,
				email_body: shareMessage.emailMessage().body,
				home_host: config.app.host
			});
		}
	});
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
		table.create(req.body, req.files.data.path, function(err, id) {
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

		// var busboy = new Busboy({ headers: req.headers });

		// var filePath = path.join( os.tmpdir(), new Date().toISOString() + '_' + cluster.worker.id + '.csv' );
		// var fileStream = fs.createWriteStream( filePath );

		// busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {

		//     file.pipe( fileStream );

		//     fileStream.on('finish', function() {
		    	
		//     });

		//     file.on('data', function(data) {
		//         console.log('File [' + fieldname +'] got ' + data.length + ' bytes');
		//     });

		//     file.on('end', function() {
		//         console.log("file finished: " + filename);
		//     });
		// });

		// busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
		// 	console.log( fieldname );
		// 	console.log( val );
		//     req.body[fieldname] = val;
		// });

		// busboy.on('finish', function () {
		//     console.log("finished");

		//     console.log( 'Creating new table from file:' );
		// 		table.create(req.body, filePath, function(err, id) {
		// 			if (err) {
		// 				res.json({
		// 					status: 'fail',
		// 					message: err
		// 				});
		// 			} else {
		// 				res.json({
		// 					status: 'success',
		// 					data: {
		// 						table_id: id
		// 					}
		// 				});
		// 			}
		// 		});
		// });

		// req.pipe(busboy);
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
