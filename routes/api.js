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
		table.add(req.body.data.type, req.body.data.entities, function(err) {
			if (err) {
				console.log(err);
				res.write('Something went wrong: ' + err);
			} else {
				res.write('Success!');
			}
			res.end();
			table.connection.end();
		});
	})

	// Perform a search given a query
	.get(function(req, res) {
		
		var table = new Table();
		table.search(req.query.query, function(err, data) {
			if (err) {
				console.log(err);
				res.write('Something went wrong: ' + err);
			} else {
				res.json(data);
			}
			res.end();
		});
	});

module.exports = router;
