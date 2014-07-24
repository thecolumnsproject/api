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
	var _this = this;

	var allTypes, allColumns;
	var areWeDone = function() {
		if (allTypes != undefined && allColumns != undefined) {
			_this.findEntitiesForType(allTypes[0].id, function(err, entityIds) {
				if (err) { callback(err, null); return; }
				_this.findNamesForEntityIds(entityIds, function(err, entities) {
					if (err) { callback(err, null); return; }
					_this.findDataForEntitesAndColumns(entities, allColumns, function(err, data) {
						if (err) { callback(err, null); return; }
						callback(null, {
							type: allTypes[0].name,
							entities: data
						});
					});
				});
			})
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
				types = types.filter(function (e, i, arr) {
    				return arr.lastIndexOf(e) === i;
				});
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
				columns = columns.filter(function (e, i, arr) {
    				return arr.lastIndexOf(e) === i;
				});
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
	this.connection.query(sql, [term, term, term], function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		callback(null, rows);
	});
}

/**
 * Accept a type and send back a list
 * of entities that match it
 *
 * @api private
*/
Table.findEntitiesForType = function(typeId, callback) {
	var sql =	"SELECT entityId FROM entities_to_types " +
				"WHERE typeId = ?";
	this.connection.query(sql, [typeId], function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		callback(null, rows);
	});
}

/**
 * Accept a list of entityIds
 * and return the names that match them
 *
 * @api private
*/
Table.findNamesForEntityIds = function(entityIds, callback) {
	var entities = [];
	var _this = this;
	entityIds.forEach(function(entityId, index) {
		_this.findNameForEntityId(entityId['entityId'], function(err, name) {
			if (err) { callback(err, null); return; }
			entities.push(name[0]);

			if (entities.length == entityIds.length) {
				callback(null, entities);
			}
		})
	});
}

/**
 * Accept an entityId and find its name
 *
 * @api private
*/
Table.findNameForEntityId = function(entityId, callback) {
	var sql =	"SELECT * FROM entities WHERE id = ?";
	this.connection.query(sql, [entityId], function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		callback(null, rows);
	});
}

/**
 * Accent a list of entities and columns
 * and loop through each to find relevant data
 *
 * @api private
*/
Table.findDataForEntitesAndColumns = function(entities, columns, callback) {
	var _this = this;
	var allEntities = [];
	var count = 0;
	entities.forEach(function(entity, index) {
		_this.findDataForEntityAndColumns(entity, columns, function(err, data) {
			if (err) { callback(err, null); return; }
			allEntities.push({
				name: entity.name,
				columns: data
			});
			count ++;

			if (count == entities.length) {
				callback(null, allEntities);
			}
		});
	});
}

/**
 * Accent an entity and list of columns
 * and loop through each column to find relevant data
 *
 * @api private
*/
Table.findDataForEntityAndColumns = function(entity, columns, callback) {
	var _this = this;
	var allData = []
	var count = 0;
	columns.forEach(function(column, index) {
		_this.findDataForEntityAndColumn(entity, column, function(err, data) {
			if (err) { callback(err, null); return; }
			allData.push(data);
			count++;

			if (count == columns.length) {
				callback(null, allData);
			}
		});
	});
}

/**
 * Accent an entity and a column
 * and find relevant data
 *
 * @api private
*/
Table.findDataForEntityAndColumn = function(entity, column, callback) {
	var sql =	"SELECT * FROM ?? WHERE entityId = ?";
	var query = this.connection.query(sql, ["'" + column.name + "'", entity.id], function(err, rows, fields) {
		console.log(query.sql);
		if (err) { callback(err, null); return; }
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
