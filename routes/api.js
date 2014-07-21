var express    	= require('express');
var router 		= express.Router();
var Table 		= require('../models/table.js');

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
	console.log(app.get('env'));	
});

router.route('/columns')

	// Create new columns
	.post(function(req, res) {

		var table = new Table();
		console.log(req.body.data.type);
		table.add(req.body.data.type, req.body.data.entities, function(err) {
			if (err) {
				console.log(err);
				res.write('Something went wrong: ' + err);
			} else {
				res.write('Success!');
			}
			res.end();
		});

		// var sql;
		// // Parse the POSTED data
		// // var timestamp = connection.escape(request.body.item.timestamp);
		// // console.log("timestamp: " + timestamp);
		// // var year = request.body.item.year;
		// // var month = request.body.item.month;
		// // var day = request.body.item.day;
		// // var minute = request.body.item.minute;
		// // var second = request.body.item.second;
		// // var millisecond = request.body.item.millisecond;

		// // Update the entity
		// // ------------------
		// var entity = connection.escape(req.body.entity.name);
		// var columns = req.body.entity.columns;

		// // Check whether the entity exists
		// sql = "SELECT id FROM entities WHERE name=" + entity;
		// connection.query(sql, function(err, rows, fields) {
		// 	if (err) {
		// 		console.log(err);
		// 		return;
		// 	}

		// 	var id;
		// 	if (rows.length > 0) {

		// 		// If the entity already exists, get its ID
		// 		addColumnsForEntityId(columns, rows[0].id);
		// 	} else {

		// 		// If the entity doesn't exist, add it
		// 		var sql = "INSERT INTO entities (name) VALUES (" + entity + ")";
		// 		connection.query(sql, function(err, rows, fields) {
		// 			if (err) throw(err);

		// 			// and get its ID
		// 			addColumnsForEntityId(columns, rows['insertId']);
		// 		});	
		// 	}

		// });

		// function addColumnsForEntityId(columns, id) {
		// 	columns.forEach(function(column, index) {
		// 		addColumnForEntityId(column, id);
		// 	});
		// } 

		// function addColumnForEntityId(column, id) {
		// 	var name = connection.escape(column.name).toLowerCase().replace(' ', '_');

		// 	var data = {
		// 		value: connection.escape(column.value),
		// 		timestamp: new Date(connection.escape(column.timestamp)),
		// 		entityId: id
		// 	};

		// 	// Check whether the column exists as a table
		// 	var sql = "SELECT * FROM information_schema.tables WHERE table_schema = '" + config.database.name + "' AND table_name = ? LIMIT 1";
		// 	connection.query(sql, [name], function(err, rows, fields) {
		// 		if (err) throw (err);

		// 		if (rows.length > 0) { /* The table exists! */
		// 			insertColumnIntoTable(data, name);
		// 		} else { /* No it doesn't :-( */
		// 			var sql = 'CREATE TABLE ?? (value TEXT, timestamp DATETIME, entityId MEDIUMINT)';
		// 			connection.query(sql, [name], function(err, rows, fields) {
		// 				if (err) throw(err);
		// 				insertColumnIntoTable(data, name);
		// 			});
		// 		}
		// 	});
		// }

		// function insertColumnIntoTable(column, name) {
		// 	var value = column.value;
		// 	var timestamp = new Date(column.timestamp);
		// 	var entityId = column.entityId;

		// 	var sql = "INSERT INTO ?? (value, timestamp, entityId) VALUES (?, ?, ?)";
		// 	connection.query(sql, [name, value, timestamp, entityId], function(err, rows, fields) {
		// 		if (err) throw(err);

		// 		res.json({
		// 			rows: rows
		// 		});
		// 		connection.end(function(err) {
		// 			if (err) console.log(err);
		// 		});
		// 		res.end();
		// 	});
		// }

		// Update the entity's data
	})

	// Perform a search given a query
	.get(function(req, res) {
		var query = req.query.query;
		console.log(query);

		var entities = [];
		var columns = [];

		// Find the entity in the database
		var sql = "SELECT * FROM entities WHERE name = ?";
		connection.query(sql, [query], function(err, rows, fields) {
			if (err) console.log(err);

			// Extract the matching entities
			// and get the columns for each
			console.log(rows);
			var numEntities = rows.length;
			rows.forEach(function(entity, index) {
				var entityId = entity.id;
				var name = entity.name;

				var entityJson = {
					name: entity.name,
					columns: {}
				};

				// Find every table with data
				sql = "SELECT TABLE_NAME " +
				"FROM INFORMATION_SCHEMA.COLUMNS " +
				"WHERE COLUMN_NAME='entityId' " +
				"AND TABLE_SCHEMA='" + config.database.name + "'";
				connection.query(sql, function(err, rows, fields) {

					// Get the entity's data from each table
					var numColumns = rows.length;
					rows.forEach(function(row, index) {
						var tableName = row['TABLE_NAME'];
						sql = "SELECT value, timestamp FROM ?? WHERE entityId=?";
						connection.query(sql, [tableName, entityId], function(err, rows, fields) {
							var columnName = fields[0].table;
							entityJson.columns[columnName] = rows;
							columns.push(columnName);
							if (Object.keys(entityJson.columns).length == numColumns) {
								entities.push(entityJson);
								if (entities.length == numEntities) {
									res.json({
										columns: columns.filter(function(elem, pos, self) {
											return self.indexOf(elem) == pos;
										}),
										entities: entities
									});
									res.end();
								}
							}
						});
					});

				});

			});

			// console.log(res.header('Access-Control-Allow-Origin'));
			// res.json({
			// 	rows: rows
			// });
			// console.log(res);
			// res.end();
		});
});

module.exports = router;
