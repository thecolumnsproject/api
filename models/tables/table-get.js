var Table = module.exports;

/**
 * Accept a query from string
 * and parse for type and columns
 * 
 * --  
 * 1) Break the query into plural and singular search terms
 * 2) Find the types associated with the search terms
 * 3) Find all the column names that match query terms
 * 4) 	Find all the entities associated with the types
 * 5) 		Filter for the column names that match an entity
 * 7)		
 * --
 *
 * @return column data object
 * @api public
*/

Table.search = function(query, callback) {
	var terms = query.split(' ');
	terms = this.pluralizeTerms(terms);

	var allTypes, allColumns;
	var areWeDone = function() {
		if (allTypes != undefined && allColumns != undefined) {
			callback(null, allTypes, allColumns);
		}
	}


	this.findTypesForTerms(terms, function(err, types) {
		if (err) { callback(err, null, null); return; }
		allTypes = types;
		areWeDone();
	});

	this.findColumnsForTerms(terms, function(err, columns) {
		if (err) { callback(err, null, null); return; }
		allColumns = columns;
		areWeDone();
	});

}

/**
 * Accept an array of terms
 * and find a list of types that match
 *
 * @api private
*/
Table.findTypesForTerms = function(terms, callback) {
	var _this = this;
	var types = [];
	var count = 0;
	terms.forEach(function(term, index) {
		_this.findTypesForTerm(term, function(err, newTypes) {
			if (err) { callback(err, null); return; }
			types = types.concat(newTypes);
			count++;

			if (count == terms.length) {
				callback(null, types);
			}
		});
	});
}

/**
 * Accept an array of terms
 * and find a list of columns that match
 *
 * @api private
*/
Table.findColumnsForTerms = function(terms, callback) {
	var _this = this;
	var columns = [];
	var count = 0;
	terms.forEach(function(term, index) {
		_this.findColumnsForTerm(term, function(err, newColumns) {
			if (err) { callback(err, null); return; }
			columns = columns.concat(newColumns);
			count++;

			if (count == terms.length) {
				callback(null, columns);
			}
		});
	});
}

/**
 * Accept a term
 * and find a list of types that match
 *
 * @api private
*/
Table.findTypesForTerm = function(term, callback) {
	var sql =	"SELECT * FROM types " +
					"WHERE " +
					// "MATCH (name) AGAINST (? WITH QUERY EXPANSION)";
					"(strcmp(soundex(name), soundex(?)) = 0 OR" +
					" name LIKE '%$" + term + "%' OR" +
					" name SOUNDS LIKE ?)";
	this.connection.query(sql, [term, term], function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		callback(null, rows);
	});
}

/**
 * Accept a term
 * and find a list of columns that match
 *
 * @api private
*/
Table.findColumnsForTerm = function(term, callback) {
	var sql =	"SELECT * FROM columns " +
					"WHERE " +
					"(MATCH (name) AGAINST (? WITH QUERY EXPANSION) OR " +
					" strcmp(soundex(name), soundex(?)) = 0 OR" +
					" name LIKE '%$" + term + "%' OR" +
					" name LIKE '%" + term + "%' OR" +
					" name SOUNDS LIKE ?)";
	var query = this.connection.query(sql, [term, term, term], function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		console.log(query.sql);
		console.log(rows);
		callback(null, rows);
	});
}

// var query = req.query.query;
// console.log(query);

// var entities = [];
// var columns = [];

// // Find the entity in the database
// var sql = "SELECT * FROM entities WHERE name = ?";
// connection.query(sql, [query], function(err, rows, fields) {
// 	if (err) console.log(err);

// 	// Extract the matching entities
// 	// and get the columns for each
// 	console.log(rows);
// 	var numEntities = rows.length;
// 	rows.forEach(function(entity, index) {
// 		var entityId = entity.id;
// 		var name = entity.name;

// 		var entityJson = {
// 			name: entity.name,
// 			columns: {}
// 		};

// 		// Find every table with data
// 		sql = "SELECT TABLE_NAME " +
// 		"FROM INFORMATION_SCHEMA.COLUMNS " +
// 		"WHERE COLUMN_NAME='entityId' " +
// 		"AND TABLE_SCHEMA='" + config.database.name + "'";
// 		connection.query(sql, function(err, rows, fields) {

// 			// Get the entity's data from each table
// 			var numColumns = rows.length;
// 			rows.forEach(function(row, index) {
// 				var tableName = row['TABLE_NAME'];
// 				sql = "SELECT value, timestamp FROM ?? WHERE entityId=?";
// 				connection.query(sql, [tableName, entityId], function(err, rows, fields) {
// 					var columnName = fields[0].table;
// 					entityJson.columns[columnName] = rows;
// 					columns.push(columnName);
// 					if (Object.keys(entityJson.columns).length == numColumns) {
// 						entities.push(entityJson);
// 						if (entities.length == numEntities) {
// 							res.json({
// 								columns: columns.filter(function(elem, pos, self) {
// 									return self.indexOf(elem) == pos;
// 								}),
// 								entities: entities
// 							});
// 							res.end();
// 						}
// 					}
// 				});
// 			});

// 		});

// 	});
// });
