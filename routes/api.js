var express    	= require('express');
var router 		= express.Router();
var Table 		= require('../models/tables/table.js');

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
	console.log(app.get('env'));	
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
		table.find(req.params.id, function(err, data) {
			if (err) {
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

		res.json({
			status: 'success',
			data: {
				source: 'Lubin Truth Institute',
				title: 'Friends of Mine',
				sort_by_column: 'age',
				layout: {
					style: [{
						property: 'padding',
						value: '12px'
					}],
					values: [{
						type: 'group',
						layout: [{
							property: 'flex-direction',
							value: 'column'
						}, {
							property: 'align-items',
							value: 'flex-start'
						}],
						values: [{
							type: 'single',
							style: [{
								property: 'color',
								value: '#3a3a3a'
							}],
							data: 'first_name'
						},{
							type: 'single',
							data: 'hometown',
							style: [{
								property: 'color',
								value: '#888'
							},{
								property: 'font-size',
								value: '14px'
							}, {
								property: 'margin-top',
								value: '4px'
							}]
						}]
					},
					{
						type: 'single',
						data: 'age',
						style: [{
							property: 'color',
							value: '#3a3a3a'
						},{
							property: 'font-size',
							value: '24px'
						}]
					}]
				},
				data: [{
					first_name: 'Jermy',
					last_name: 'Lubin',
					hometown: 'Princeton',
					age: 27,
					unit: 'Years'
				},
				{
					first_name: 'Jess',
					last_name: 'Schwartz',
					hometown: 'Mechanicsburg',
					age: 28,
					unit: 'Years'
				},
				{
					first_name: 'Amir',
					last_name: 'Kanpurwala',
					hometown: 'Princeton',
					age: 27,
					unit: 'Years'
				},
				{
					first_name: 'Jeff',
					last_name: 'LaFlam',
					hometown: 'Raliegh',
					age: 28,
					unit: 'Years'
				},
				{
					first_name: 'Phil',
					last_name: 'Chacko',
					hometown: 'Princeton',
					age: 28,
					unit: 'Years'
				},
				{
					first_name: 'Albert',
					last_name: 'Choi',
					hometown: 'Raliegh',
					age: 13,
					unit: 'Years'
				},
				{
					first_name: 'Kelly',
					last_name: 'Fee',
					hometown: 'Chicago',
					age: 27,
					unit: 'Years'
				},
				{
					first_name: 'Elaine',
					last_name: 'Zelby',
					hometown: 'Chicago',
					age: 27,
					unit: 'Years'
				},
				{
					first_name: 'Kousha',
					last_name: 'Navidar',
					hometown: 'Albany',
					age: 26,
					unit: 'Years'
				},
				{
					first_name: 'Craig',
					last_name: 'Hosang',
					hometown: 'Alameda',
					age: 28,
					unit: 'Years'
				}]
			}
		});
		res.end();
	});

module.exports = router;
