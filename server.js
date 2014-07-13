var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var common = require('./common')
var config = common.config();
var mysql 	   = require('mysql');
var connection = mysql.createConnection({
	host		: config.database.host,
	user		: config.database.user,
	password	: config.database.password,
	database	: config.database.name
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser());

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
	console.log(app.get('env'));	
});

router.route('/columns')

	// Create new columns
	.post(function(req, res) {

		var sql;
		// Parse the POSTED data
		// var timestamp = connection.escape(request.body.item.timestamp);
		// console.log("timestamp: " + timestamp);
		// var year = request.body.item.year;
		// var month = request.body.item.month;
		// var day = request.body.item.day;
		// var minute = request.body.item.minute;
		// var second = request.body.item.second;
		// var millisecond = request.body.item.millisecond;

		// Update the entity
		// ------------------
		var entity = connection.escape(req.body.entity.name);
		var columns = req.body.entity.columns;

		// Check whether the entity exists
		sql = "SELECT id FROM entities WHERE name=" + entity;
		connection.query(sql, function(err, rows, fields) {
			if (err) {
				console.log(err);
				return;
			}

			var id;
			if (rows.length > 0) {

				// If the entity already exists, get its ID
				addColumnsForEntityId(columns, rows[0].id);
			} else {

				// If the entity doesn't exist, add it
				var sql = "INSERT INTO entities (name) VALUES (" + entity + ")";
				connection.query(sql, function(err, rows, fields) {
					if (err) throw(err);

					// and get its ID
					addColumnsForEntityId(columns, rows['insertId']);
				});	
			}

		});

		function addColumnsForEntityId(columns, id) {
			columns.forEach(function(column, index) {
				addColumnForEntityId(column, id);
			});
		} 

		function addColumnForEntityId(column, id) {
			var name = connection.escape(column.name).toLowerCase().replace(' ', '_');

			var data = {
				value: connection.escape(column.value),
				timestamp: new Date(connection.escape(column.timestamp)),
				entityId: id
			};

			// Check whether the column exists as a table
			var sql = "SELECT * FROM information_schema.tables WHERE table_schema = '" + config.database.name + "' AND table_name = ? LIMIT 1";
			connection.query(sql, [name], function(err, rows, fields) {
				if (err) throw (err);

				if (rows.length > 0) { /* The table exists! */
					insertColumnIntoTable(data, name);
				} else { /* No it doesn't :-( */
					var sql = 'CREATE TABLE ?? (value TEXT, timestamp DATETIME, entityId MEDIUMINT)';
					connection.query(sql, [name], function(err, rows, fields) {
						if (err) throw(err);
						insertColumnIntoTable(data, name);
					});
				}
			});
		}

		function insertColumnIntoTable(column, name) {
			var value = column.value;
			var timestamp = new Date(column.timestamp);
			var entityId = column.entityId;

			var sql = "INSERT INTO ?? (value, timestamp, entityId) VALUES (?, ?, ?)";
			connection.query(sql, [name, value, timestamp, entityId], function(err, rows, fields) {
				if (err) throw(err);

				res.json({
					rows: rows
				});
			});
		}

		// Update the entity's data
	});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);