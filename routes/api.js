var express    	= require('express');
var router 		= express.Router();
var Table 		= require('../models/tables/table.js');

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
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
	})

	// Return a table for a given id
	.get(function(req, res) {
		res.end();
	});

module.exports = router;
