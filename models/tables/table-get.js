var Table = module.exports;

/**
 * Accept a table id
 * and return the table's meta-data and actual data
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


Table.find = function(id, page, callback) {
	var _this = this;

	// Check for any errors
	if ( id === undefined ) {
		callback( new Error('No table id specified'), null );
		return;
	}

	// Convert headers to array
	// meta.columns = meta.columns.split(",");

	// Set up our db connection
	this.pool.getConnection(function(err, connection) {
		if (err) { callback(err, null); return; }

		_this.connection = connection;

		// Find the meta data for this table
		var all_data = {};
		_this.findMetaData(id, function(err, meta) {
			if (err) { callback(err, null); _this.connection.release(); return; }

			// Check for empty meta
			if ( !meta ) {
				callback( new Error( 'No table found for id undefined' ), null );
				_this.connection.release(); _this.pool.end();
				return;
			}

			// Add the meta data to a data hash
			all_data = _this.sanitizeMetaData(meta);

			// Now get the actual data
			_this.findData(id, page * _this.pagingLimit, function(err, data) {
				if (err) { callback(err, null); _this.connection.release(); return; }

				// Add the real data to the data object
				all_data['data'] = data;

				// Find the total number of rows
				_this.findRowCountForTableId(id, function(err, count) {
					if (err) { callback(err, null); _this.connection.release(); return; }
					all_data['num_rows'] = count;
					callback(null, all_data);
					_this.connection.release();
					_this.pool.end();
				});
			});
		});
	});
}

Table.findMetaData = function(id, callback) {
	var sql = "SELECT * FROM tables WHERE id=?";
	var query = this.connection.query(sql, [id], function(err, rows, fields) {
		console.log(query.sql);
		if (err) { callback(err, null); console.log(err); return; }
		console.log("Got Meta Data:");
		console.log(rows);
		callback(null, rows[0]);
	});
}

Table.findData = function(id, startingPoint, callback) {
	// var sql = "SELECT * FROM ?? LIMIT ?,?";
	var sql = "SELECT * FROM ??";
	var query = this.connection.query(sql, [id/*, startingPoint, this.pagingLimit*/], function(err, rows, fields) {
		console.log(query.sql);
		if (err) { callback(err, null); console.log(err); return; }
		console.log("Got Data For Table:");
		console.log(id);
		callback(null, rows);
	});
}

Table.findRowCountForTableId = function(id, callback) {
	var sql = "SELECT COUNT(*) FROM ??";
	var query = this.connection.query(sql, [id], function(err, rows, fields) {
		console.log(query.sql);
		if (err) { callback(err, null); console.log(err); return; }
		console.log("Got row count:");
		console.log(rows);
		callback(null, rows[0]['COUNT(*)']);
	});
}

Table.getMetaData = function(id, callback) {

	// Check for any errors
	if ( id === undefined ) {
		callback( new Error('No table id specified'), null );
		return;
	}

	// Check for undefined id
	this.pool.getConnection(function(err, connection) {
		if (err) { callback(err, null); return; }

		var sql = "SELECT * FROM tables WHERE id=?";
		var query = connection.query(sql, [id], function( err, rows, fields ) {

			// End the connections
			connection.release();
			this.pool.end();

			// Is there an error
			if ( err ) { callback( err, null ); console.log( err ); return }

			// Was there really a table here?
			if ( !rows[0] ) {
				callback( new Error( 'No table found for id ' + id ), null );
				return;
			}

			// Send it back
			callback( null, rows[0] );

		}.bind( this ));

	}.bind( this ));
}

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

Table.search = function(query, page, callback) { 
	var terms = query.split(' ');
	terms = this.pluralizeTerms(terms);
	var _this = this;
	console.log("Page: " + page);

	var allTypes, allColumns, allColumnNames;
	var areWeDone = function() {
		if (allTypes != undefined && allColumns != undefined) {

			if (allTypes.length == 0) { 
				callback(null, null);
			} else {
				var startingPoint = _this.pagingLimit * page;

				_this.findEntitiesForType(allTypes[0].id, startingPoint, _this.pagingLimit, function(err, entityIds) {
					console.log("here");
				if (err) { callback(err, null); return; }
				if (entityIds.length == 0 ) { callback(null, null); return; }
					_this.findNamesForEntityIds(entityIds, function(err, entities) {
						if (err) { callback(err, null); return; }
						_this.findDataForEntitesAndColumns(entities, allColumns, function(err, data, columnNames) {
							if (err) { callback(err, null); return; }
							callback(null, {
								type: allTypes[0].name,
								columns: columnNames,
								entities: data
							});

							_this.pool.end();
						});
					});
				});
			}
		}
	}

	this.pool.getConnection(function(err, connection) {
		if (err) { callback(err, null); return; }
		_this.connection = connection;

		_this.findTypesForTerms(terms, function(err, types) {
			if (err) { callback(err, null, null); return; }
			allTypes = types;
			console.log("Types:");
			console.log(types);
			areWeDone();
		});

		_this.findColumnsForTerms(terms, function(err, columns) {
			if (err) { callback(err, null, null); return; }

			// Make sure columns are unique
			var columnIds = [];
			allColumnNames = [];
			allColumns = [];
			for(index in columns) {
				if (columnIds.indexOf(columns[index].id) == -1) {
					columnIds.push(columns[index].id);
					allColumnNames.push(columns[index].name);
					allColumns.push(columns[index]);
				}
			}

			// allColumns = columns;
			console.log("Columns:");
			console.log(allColumns);
			areWeDone();
		});
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
					"(MATCH (name) AGAINST (? WITH QUERY EXPANSION) OR" +
					" strcmp(soundex(name), soundex(?)) = 0 OR" +
					" name LIKE '%" + term + "%' OR" +
					" name SOUNDS LIKE ?)";
	// var sql =	"SELECT * FROM types " +
	// 			"WHERE " +
	// 			"name SOUNDS LIKE ?";
	var query = this.connection.query(sql, [term, term, term], function(err, rows, fields) {
		console.log(query.sql);
		if (err) { callback(err, null); return; }
		console.log(rows);
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
					" name LIKE '%" + term + "%' OR" +
					" name SOUNDS LIKE ?)";
	// var sql =	"SELECT * FROM columns " +
	// 				"WHERE " +
	// 				"MATCH (name) AGAINST (? WITH QUERY EXPANSION);"
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
Table.findEntitiesForType = function(typeId, startingPoint, pagingLimit, callback) {
	var sql =	"SELECT entityId FROM entities_to_types " +
				"WHERE typeId = ? LIMIT ?,?";
	this.connection.query(sql, [typeId, startingPoint, pagingLimit], function(err, rows, fields) {
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
	var columnsWithData = [];
	var count = 0;
	entities.forEach(function(entity, index) {
		if (index > _this.pagingLimit) return;
		_this.findDataForEntityAndColumns(entity, columns, function(err, data, columnNames) {
			if (err) { callback(err, null); return; }
			allEntities.push({
				name: entity.name,
				columns: data
			});
			for (n in columnNames) {
				if (columnsWithData.indexOf(columnNames[n]) == -1) {
					columnsWithData.push(columnNames[n]);
				}
			}
			count ++;

			if (count == _this.pagingLimit || count == entities.length || count == 0) {
				callback(null, allEntities, columnsWithData);
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
	var allData = [];

	// Parse out the 
	var uniqueColumns = [];
	var columnsWithData = [];
	var count = 0;

	if (columns.length == 0) {
		callback(null, allData);
	} else {
		columns.forEach(function(column, index) {
			if (uniqueColumns.indexOf(column.name) == -1) {
				uniqueColumns.push(column.name);
				_this.findDataForEntityAndColumn(entity, column, function(err, data) {
					if (err) { callback(err, null); return; }
					if (data.length > 0) {
						allData.push({
							name: column.name,
							rows: data
						});
						if (columnsWithData.indexOf(column.name) == -1) {
							columnsWithData.push(column.name);
						}
					}
					count++;

					if (count == columns.length) {
						callback(null, allData, columnsWithData);
					}
				});
			}
		});
	}
}

/**
 * Accent an entity and a column
 * and find relevant data
 *
 * @api private
*/
Table.findDataForEntityAndColumn = function(entity, column, callback) {
	var sql =	"SELECT * FROM ?? WHERE entityId = ?";
	var query = this.connection.query(sql, [column.name, entity.id], function(err, rows, fields) {
		// console.log(query.sql);
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
