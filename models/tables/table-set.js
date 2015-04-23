var crypto 		= require('crypto');
var fs 			= require('fs');
// var csv 		= require("fast-csv"); 
var cluster 	= require('cluster');
var Cleaner		= require('../table-cleaner.js');
// var Transform	= require('stream').Transform;
// var util 		= require('util');

var CLEAN_SUFFIX = '__clean.csv';

var Table = module.exports;

/**
 * Accept a .csv file uploaded from the web
 * that contains a data table.
 * Add the .csv to the database as a table
 * and add a reference to that table to a master table
*/


/**
 * Accept meta-data for a new table
 * including all of the column names, title and source info
 * as well as the data itself as a file path.
**/
Table.create = function(meta, data_path, callback) {
	var _this = this;

	// Convert headers to array
	// meta.columns = meta.columns.split(",");

	// Set up our db connection
	this.pool.getConnection(function(err, connection) {
		if (err) { callback(err, null); return; }

		_this.connection = connection;

		// Clean the meta data
		meta = _this.sanitizeMetaData( meta );

		// Add our meta-data to the db
		_this.addMetaData(meta, function(err, id) {
			if (err) { callback(err, null); _this.connection.release(); return; }

			// With the id of the entry in the tables table
			// for our data, create a new table for the data itself
			_this.createDataTable(id, meta.columns, function(err, tableName) {
				if (err) { callback(err, null); _this.connection.release(); return; }

				_this.cleanData(data_path, function(err, cleanPath) {
					if (err) { callback(err, null); _this.connection.release(); return; }

					// And insert that data into the table
					_this.addDataToTable(tableName, cleanPath, function(err) {
						if (err) { callback(err, null); _this.connection.release(); return; }
						callback(null, tableName);
						_this.connection.release();
						_this.pool.end();
					});
				});
			});
		});
	});
}

Table.update = function(id, meta, callback) {
	var _this = this;

	// Convert headers to array
	// meta.columns = meta.columns.split(",");

	// Set up our db connection
	this.pool.getConnection(function(err, connection) {
		if (err) { callback(err, null); return; }

		_this.connection = connection;

		// Add our meta-data to the db
		_this.updateMetaDataForId(id, meta, function(err) {
			if (err) { callback(err); return; }
			callback(null);
			_this.connection.release();
			_this.pool.end();
		});
	});
}

/**
 * Accept a table's meta-data
 * and add it to the tables table
 *
 * Return the table's id
 * @api private
*/
Table.addMetaData = function(meta, callback) {

	var sql =	"INSERT INTO tables (title, source, source_url, columns, layout) VALUES (?, ?, ?, ?, ?)";
	var query = this.connection.query(sql, [meta.title, meta.source, meta.source_url, meta.columns, meta.layout], function(err, rows, fields) {
		console.log(query.sql);
		if (err) { callback(err); console.log(err); return; }
		console.log("Inserted Tables Row:");
		console.log(rows['insertId']);
		callback(null, rows['insertId']);
	});
}

Table.updateMetaDataForId = function(id, meta, callback) {
	var sql =	"UPDATE tables SET" +
				" title=?," +
				" source=?," +
				" source_url=?," +
				" columns=?," +
				" layout=? " +
				"WHERE id=?";
	var query = this.connection.query(sql, [meta.title, meta.source, meta.source_url, meta.columns, meta.layout, id], function(err, rows, fields) {
		console.log(query.sql);
		if (err) { callback(err); console.log(err); return; }
		console.log("Updated Tables Row:");
		console.log(rows['insertId']);
		callback(null);
	});
}

Table.createDataTable = function(id, columns, callback) {
	var columnsArray = columns.split(",").map(this.formatColumn);
	var sql =	"CREATE TABLE ??.`?` (";
	columnsArray.forEach(function(column, i) {
		sql += "?? TEXT";
		if (i < columnsArray.length - 1) {
			sql += ","
		}
	});
	sql += ")";
	var query = this.connection.query(sql, [this.pool.config.connectionConfig.database, id].concat(columnsArray), function(err, rows, fields) {
		console.log(query.sql);
		if (err) { callback(err, null); console.log(err); return; }
		console.log("Created Data Table:");
		console.log(rows['insertId']);
		callback(null, id);
	});
}

Table.cleanData = function(data_path, callback) {
	var _this = this;

	// Create a transform function for streaming
	// escaped data back out into a file
	// var cleaner = new Transform({objectMode: true});
	// cleaner._transform = function(chunk, encoding, callback) {
	// 	var _cleaner = this;
	// 	// Turn the chunk into a string
	// 	var chunkString = chunk.toString();
	// 	// If there's a partial line hanging around from the last chunk, append this chunk to it
	// 	if (this._lastLineData) chunkString = this._lastLineData + chunkString;
	// 	// Split the new string into lines, in case there's a new partial line
	// 	var lines = chunkString.split('\n');
	// 	// Remember the last line so we can use it next time around, in case it's a partial
	// 	this._lastLineData = lines.splice(lines.length-1,1)[0];
	// 	// Clean each line
	// 	var cleanLines = lines.map(function(line) {
	// 		return _cleaner.cleanLine(line);
	// 	});
	// 	// Turn the lines array back into strings terminated by a newline charachter
	// 	var escapedString = cleanLines.join('\n');
	// 	// Pipe the escaped values back out
	// 	this.push(escapedString);
	//  	callback();
	// }

	// cleaner._flush = function(callback) {
	// 	if (this._lastLineData) this.push('\n' + this.cleanLine(this._lastLineData));
	// 	this._lastLineData = null;
	// 	callback();
	// }

	// cleaner.cleanLine = function(line) {
	// 	// Break out individual data values
	// 	var values = line.split(',');
	// 	// Escape each value
	// 	var cleanValues = values.map(function(value) {
	// 		// Escape the string and remove any quotes around it
	// 		return _this.pool.escape(value).slice(1,-1);
	// 	});
	// 	// Turn the escaped values back into a string
	// 	return cleanValues.join();
	// }

	var cleanPath = data_path.slice(0, -4) + CLEAN_SUFFIX;
	var unclean = fs.createReadStream(data_path);
	var clean = fs.createWriteStream(cleanPath);
	// unclean.on('data', function(chunk) {
	// 	var cleanChunk = _this.pool.escape(chunk.toString());
	// 	clean.write(cleanChunk);
	// });
	unclean
		.pipe( new Cleaner() )
		.pipe( clean );

	// When we're finished writing to the new file,
	// send the file name to the callback
	clean.on('finish', function() {
		callback(null, cleanPath);
	});
} 

Table.addDataToTable = function(tableName, data_path, callback) {
	var _this = this;
	this.connection.beginTransaction(function(err) {
		if (err) { callback(err, null); console.log(err); return; }

		var sql =	"LOAD DATA CONCURRENT LOCAL INFILE ?" +
					" IGNORE" +
					" INTO TABLE `?`" +
					" FIELDS TERMINATED BY ',' ENCLOSED BY \"'\"" +
					" IGNORE 1 LINES";
		console.log("About to load data into db");
		console.log( sql );
		var query = _this.connection.query(sql, [data_path, tableName], function(err, rows, fields) {
			console.log(query.sql);
			if (err) {
				_this.connection.rollback(function() { 
					callback(err);
					console.log(err);
					return;
				});
			}
			_this.connection.commit(function(err) {
				if (err) {
					_this.connection.rollback(function() {
						console.log(err);
						callback(err);
					});
					return;
				}

				// fs.unlink(data_path, function(err) {
				// 	if (err) {console.log(err); return;}
				// 	callback(null)
				// });
			});
		});
	});
}


/**
 * Accept api input data
 * and parse for storage
 * in the database
 * --  
 * 1) Create a table for [type]
 * 2) For each 'entity'
 * 3) 	Add to [entities] table
 * 4) 	Add to [type] table
 * 5)	Associate the entity and type
 * 6) 	Loop through 'columns'
 * 7)		Create a table for [name]
 * 8)		Associate the column and entity
 * 9)		Loop through 'rows'
 * 10)			Add (value, timestamp, identifier_columns, identifier_values) to [name] table
 * --
 * @api public
*/

Table.add = function(type, columns, entities, callback) {
	// this.type = type;
	// this.entities = data;

	var _this = this;
	var typeId;
	var columnIds = {};
	var entities_to_types = [];
	var columns_to_entities = [];

	var date = new Date();
	var entitiesFileName = "data/entities__" + date.toISOString() + "__" + cluster.worker.id + ".csv";
	var csvStream = csv.createWriteStream({headers: true}),
    	writableStream = fs.createWriteStream(entitiesFileName);

    csvStream.pipe(writableStream);
	for (i in entities) {
		var entity = entities[i];
		// console.log(_this.cleanEntity(entity.name));
		// console.log(entity.name);
		csvStream.write({entity: _this.cleanEntity(entity.name)});
	}
	csvStream.write(null);

	writableStream.on('finish', function() {
		console.log('done!'); 
		
		_this.pool.getConnection(function(err, connection) {
			if (err) { callback(err, null); return; }

			_this.connection = connection;
			connection.beginTransaction(function(err) {
				if (err) { callback(err, null); return; }

				_this.addType(type, function(err, id) {
					if (err) { callback(err, null); return; }
					typeId = id;

					var sql =	"LOAD DATA CONCURRENT LOCAL INFILE ?" +
								" IGNORE" +
								" INTO TABLE entities" +
								" FIELDS TERMINATED BY ','" +
								" IGNORE 1 LINES" +
								" (name)";
					var query = _this.connection.query(sql, [entitiesFileName], function(err, rows, fields) {
						console.log(query.sql);
						if (err) {
							connection.rollback(function() { 
								// callback(err);
							});
						}
						connection.commit(function(err) {
							if (err) {
								connection.rollback(function() {
									callback(err);
								});
								return;
							}

							fs.unlink(entitiesFileName, function(err) {
								if (err) {console.log(err);}
							});
							// callback(null);
							prepareColumns(callback);
						});
					});
				});
			});
		});
	});

	var columnStreams = {};
	var csvNames = [];
	function prepareColumns(callback) {
		var columnCount = 0;
		for (c in columns) {
			var name = columns[c];
			_this.addColumn(name, function(err, columnId, columnName) {
				if (err) { callback(err, null); return; }
				columnIds[columnName] = columnId;

				date = new Date();
				var csvName = "data/" + columnName + '__' + date.toISOString() + '__' + cluster.worker.id + '.csv';
				var ws = fs.createWriteStream(csvName);
				var cs = csv.createWriteStream({headers: true});
				cs.pipe(ws);
				columnStreams[columnName] = cs;
				csvNames.push(csvName);
 
				ws.on('finish', function() {
					console.log(columnName + ' done!'); 
					
					// _this.pool.getConnection(function(err, connection) {
					// 	if (err) { callback(err, null); return; } 

					// 	_this.connection = connection;
						var connection = _this.connection;
						connection.beginTransaction(function(err) {
							if (err) { callback(err, null); return; }

							var sql =	"LOAD DATA CONCURRENT LOCAL INFILE ?" +
										" IGNORE" +
										" INTO TABLE ??" +
										" FIELDS TERMINATED BY ','" +
										" IGNORE 1 LINES" +
										" (value, timestamp, identifier_columns, identifier_values, entityId, hash)";
							var query = connection.query(sql, [csvName, columnName], function(err, rows, fields) {
								if (err) {
									connection.rollback(function() {
										callback(err);
									});
								}
								connection.commit(function(err) {
									if (err) {
										connection.rollback(function() {
											callback(err);
										});
										return;
									}

									columnCount++;
									console.log("Finished writing column " + columnCount);
									if (columnCount == columns.length) {
										console.log("Done writing columns!");
										for (n in csvNames) {
											fs.unlink(csvNames[n], function(err) {
												if (err) {console.log(err);}
											});
										}
										callback(null);
									}
								});
							});
						});
					// });
				});

				if (Object.keys(columnStreams).length == columns.length) {
					writeColumnData();
				} 
			});
		}
	}

	function writeColumnData() {
		var sql = "SELECT id, name FROM entities WHERE "; 
		for (i in entities) {
			var entity = entities[i];
			sql += "name='" + _this.cleanEntity(entity.name) + "'";
			if (i < entities.length-1) {
				sql += " OR ";
			}
		}
		console.log(sql);
		_this.connection.query(sql, function(err, rows, fields) {
			if (err) { callback(err); return; }	
			// console.log(rows);

			var entitiesHash = {};
			for (r in rows) {
				entitiesHash[rows[r].name] = rows[r].id;
				entities_to_types.push({
					entityId: rows[r].id,
					typeId: typeId
				});
			}

			associateEntitiesAndType();
			
			for (e in entities) {
				var entity = entities[e];
				for (c in entity.columns) {
					var tempColumn = entity.columns[c];

					columns_to_entities.push({
						columnId: columnIds[_this.formatColumnHeader(tempColumn.name)],
						entityId: entitiesHash[_this.cleanEntity(entity.name)]
					});

					for (r in tempColumn.rows) {
						var row = tempColumn.rows[r];
						var valueDate = row.timestamp == null ? null : row.timestamp;
						var id_columns = Object.keys(row.identifiers).sort();
						var id_values = id_columns.map(function(column) { return row.identifiers[column]; });
						var data = { 
							value: row.value,
							timestamp: row.timestamp,
							identifier_columns: id_columns.join('__'),
							identifier_values: id_values.join('__'),
							entityId: entitiesHash[_this.cleanEntity(entity.name)]
						};

						var hashString = Object.keys(data).map(function(key) {
							return data[key]; 
						}).join('  ');
						var hash = crypto.createHash('md5').update(hashString).digest('hex');
						data['hash'] = hash;
						columnStreams[_this.formatColumnHeader(tempColumn.name)].write(data);
					}

					if (e == entities.length -1) {
						columnStreams[_this.formatColumnHeader(tempColumn.name)].write(null);
					} 
				}
			}

			associateColumnsAndEntities();
		});
	}

	function associateEntitiesAndType() {
		date = new Date();
		var path = "data/entities_to_types__" + date.toISOString() + "__" + cluster.worker.id + ".csv";
		csv.writeToPath(path, entities_to_types, {headers: true}).on("finish", function() {
			// _this.pool.getConnection(function(err, connection) {
			// 	if (err) { callback(err, null); return; }

			// 	_this.connection = connection;
				var connection = _this.connection;
				connection.beginTransaction(function(err) {
					if (err) { callback(err, null); return; }

					var sql =	"LOAD DATA CONCURRENT LOCAL INFILE ?" +
								" IGNORE" +
								" INTO TABLE entities_to_types" +
								" FIELDS TERMINATED BY ','" +
								" IGNORE 1 LINES" +
								" (entityId, typeId)";
					_this.connection.query(sql, [path], function(err, rows, fields) {
						if (err) {
							connection.rollback(function() { 
								callback(err);
							});
						}
						connection.commit(function(err) {
							if (err) {
								connection.rollback(function() {
									callback(err);
								});
								return;
							}
							console.log("Done associating entities and type!");
							fs.unlink(path, function(err) {
								if (err) {console.log(err);}
							});
							// callback(null);
						});
					});
				});
			// });
		});
	}

	function associateColumnsAndEntities() {
		date = new Date();
		var path = "data/columns_to_entities__" + date.toISOString() + "__" + cluster.worker.id + ".csv";
		csv.writeToPath(path, columns_to_entities, {headers: true}).on("finish", function() {
			// _this.pool.getConnection(function(err, connection) {
			// 	if (err) { callback(err, null); return; }

			// 	_this.connection = connection;
				var connection = _this.connection;
				connection.beginTransaction(function(err) {
					if (err) { callback(err, null); return; }

					var sql =	"LOAD DATA CONCURRENT LOCAL INFILE ?" +
								" IGNORE" +
								" INTO TABLE columns_to_entities" +
								" FIELDS TERMINATED BY ','" +
								" IGNORE 1 LINES" +
								" (columnId, entityId)";
					_this.connection.query(sql, [path], function(err, rows, fields) {
						if (err) {
							connection.rollback(function() { 
								callback(err);
							});
						}
						connection.commit(function(err) {
							if (err) {
								connection.rollback(function() {
									callback(err);
								});
								return;
							}
							fs.unlink(path, function(err) {
								if (err) {console.log(err);}
							});

							console.log("Done associating columns and entities!");
							// callback(null);
						});
					});
				});
			// });
		});
	}


	// var _this = this;
	// this.pool.getConnection(function(err, connection) {
	// 	_this.connection = connection;
	// 	if (err) { callback(err, null); return; }
	// 	connection.beginTransaction(function(err) {
	// 		if (err) { callback(err, null); return; }

	// 		// Create a table for the type
	// 		// and process the entities
	// 		_this.addType(type, function(err, typeId) {
	// 			if (err) { callback(err, null); return; }
	// 			_this.addEntitiesForTypeId(entities, typeId, function(err) {
	// 				if (err) {
	// 					connection.rollback(function() {
	// 						callback(err);
	// 					});
	// 				}
	// 				connection.commit(function(err) {
	// 					connection.rollback(function() {
	// 						callback(err);
	// 					});
	// 				});
	// 			});		
	// 		});
	// 	});
	// });

	// Create a table for the type
	// and process the entities
	// this.addType(type, function(err, typeId) {
	// 	if (err) { callback(err, null); return; }
	// 	_this.addEntitiesForTypeId(entities, typeId, function(err) {
	// 		callback(err);			
	// 	});		
	// });
}  

/**
 * Accept an array of entities
 * and a type id for which to
 * categorize the entities
 * 
 * @api private
*/
Table.addEntitiesForTypeId = function(entities, typeId, callback) {
	var _this = this;
	var entitiesAdded = [];
	entities.forEach(function(entity, index) {		
		_this.addEntityForTypeId(entity, typeId, callback);
	});
}

/**
 * Accept an entity
 * and a type id for which to
 * categorize it
 * 
 * @api private
*/
Table.addEntityForTypeId = function(entity, typeId, callback) {
	var _this = this;
	this.addEntity(entity.name, function(err, entityId) {
		if (err) { callback(err, null); return; }
		_this.associateEntityAndType(entityId, typeId, callback);
		_this.addColumnsForEntityId(entity.columns, entityId, callback);
	});
}

/**
 * Accept a list of columns
 * and an entity id with which
 * to categorize them
 * 
 * @api private
*/
Table.addColumnsForEntityId = function(columns, entityId, callback) {
	var _this = this;
	columns.forEach(function(column, index) {
		_this.addColumnForEntityId(column, entityId, callback);
	});
}

/**
 * Accept a column
 * and an entity id for which
 * to categorize it
 * 
 * @api private
*/
Table.addColumnForEntityId = function(column, entityId, callback) {
	var _this = this;
	this.addColumn(column.name, function(err, columnId) {
		if (err) { callback(err, null); return; }
		_this.associateColumnIdAndEntity(columnId, entityId, callback);
		_this.addRowsForColumnAndEntityId(column.rows, column.name, entityId, callback);
	});
}

/**
 * Accept a list of rows
 * and a column name for which
 * to categorize them
 * 
 * @api private
*/
Table.addRowsForColumnAndEntityId = function(rows, column, entityId, callback) {
	var _this = this;
	rows.forEach(function(row, index) {
		_this.addRowForColumnAndEntityId(row, column, entityId, callback);
	});
}

/**
 * Accept a row of data
 * and a column name indicating
 * the table into which to categorize it
 * 
 * @api private
*/
Table.addRowForColumnAndEntityId = function(row, column, entityId, callback) {
	var data = {
		value: row.value,
		timestamp: new Date(row.timestamp),
		entityId: entityId
	};

	var id_columns = Object.keys(row.identifiers).sort();
	var id_values = id_columns.map(function(column) { return row.identifiers[column]; });

	data['identifier_columns'] = id_columns.join();
	data['identifier_values'] = id_values.join();

	var hashString = Object.keys(data).map(function(key) {
		return data[key];
	}).join('  ');
	var hash = crypto.createHash('md5').update(hashString).digest('hex');
	data['hash'] = hash;

	this.addRowWithDataToColumn(data, column, function(err) {
		if (err) { callback(err); return; }
		callback(null);
	});
}

/**
 * Accept a type
 * and add it to the types table
 * if it isn't already there
 * 
 * Return the type's id
 * @api private
*/
Table.addType = function(type, callback) {
	var _this = this;
	type = this.formatType(type);
	var sql = "SELECT id FROM types WHERE name=?";
	this.connection.query(sql, [type], function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		if (rows.length > 0) {
			console.log(type + ' already exists with id ' + rows[0].id);
			callback(null, rows[0].id)
		} else {
			var sql = "INSERT INTO types (name) VALUES (?)";
			var query = _this.connection.query(sql, [type], function(err, rows, fields) {
				console.log(query.sql);
				if (err) { callback(err, null); return; }
				console.log(type + ' added to types table with id ' + rows['insertId']);
				callback(null, rows['insertId'])
			});	
		}
	});
}

/**
 * Accept an entity
 * and add it to the entities table
 * if it isn't already there
 * 
 * Return the entity's id
 * @api private
*/
Table.addEntity = function(entity, callback) {
	var _this = this;
	entity = this.formatColumnHeader(entity);
	var sql = "SELECT id FROM entities WHERE name=" + entity;
	this.connection.query(sql, function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		if (rows.length > 0) {
			console.log(entity + ' already exists with id ' + rows[0].id);
			callback(null, rows[0].id)
		} else {
			var sql = "INSERT INTO entities (name) VALUES (" + entity + ")";
			_this.connection.query(sql, function(err, rows, fields) {
				if (err) { callback(err, null); return; }
				console.log(entity + ' added to entities table with id ' + rows['insertId']);
				callback(null, rows['insertId'])
			});	
		}
	});
}

/**
 * Accept a column
 * and add it to the columns table
 * if it isn't already there
 *
 * And create a table for the column
 * if one doesn't already exist
 * 
 * Add an index on the hash
 * of the table's values
 *
 * Return the column's id
 * @api private
*/
Table.addColumn = function(column, callback) {
	var _this = this;
	column  = 	this.formatColumnHeader(column);
	var sql =	"INSERT INTO columns (name) VALUES (?) " +
				"ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)";

	var query = this.connection.query(sql, [column], function(err, rows, fields) {
		// console.log(query.sql);
		if (err) { callback(err, null); return; }
		var columnId = rows['insertId'];
		// console.log(column + ' added to columns table with id ' + columnId);

		sql =	"CREATE TABLE IF NOT EXISTS ??.?? " +
				"(value TEXT," +
				" timestamp DATETIME," +
				" identifier_columns TEXT," +
				" identifier_values TEXT," +
				" entityId MEDIUMINT," +
				" hash VARCHAR(128), " +
				"UNIQUE KEY hash_index (hash))";
		_this.connection.query(sql, [_this.pool.config.connectionConfig.database, column], function(err, rows, fields) {
			if (err) { callback(err, null); return; }
			// console.log('Added table for column ' + column);
			callback(null, columnId, column);

			// sql = "CREATE INDEX hash_index ON ?? (entityId)";
			// this.connection.query(sql, [column], function(err, rows, fields) {
			// 	if (err) { callback(err); return; }
			// 	console.log('Created index on ' + column + ' table')
			// 	callback(null, columnId);
			// });
		});
	});	
} 

/**
 * Accept a set of data
 * and add it as a row
 * to the given column's table
 * 
 * Return the column's id
 * @api private
*/
Table.addRowWithDataToColumn = function(data, column, callback) {
	column  = 	this.formatColumnHeader(column);
	var sql = "INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE value=value";
	var query = this.connection.query(sql,
					[
						column,
						data
					],
					function(err, rows, fields) {
		if (err) { callback(err); return; }
		callback(null);
	});
}

/**
 * Accept an entityId and a typeId
 * and associate them in the dababase
 * establishing a many-to-many relationship
 * 
 * @api private
*/
Table.associateEntityAndType = function(entityId, typeId, callback) {
	var sql =	"INSERT INTO entities_to_types (entityId, typeId) VALUES (?, ?) " +
				"ON DUPLICATE KEY UPDATE entityId=entityId";

	this.connection.query(sql, [entityId, typeId], function(err, rows, fields) {
		if (err) { callback(err); return; }
		console.log('Associated entityId ' + entityId + ' and typeId ' + typeId);
		callback(null);
	});
}

/**
 * Accept an entityId and a columnId
 * and associate them in the dababase
 * establishing a many-to-many relationship
 * 
 * @api private
*/
Table.associateColumnIdAndEntity = function(columnId, entityId, callback) {
	var sql =	"INSERT INTO columns_to_entities (columnId, entityId) VALUES (?, ?) " +
				"ON DUPLICATE KEY UPDATE columnId=columnId";

	this.connection.query(sql, [columnId, entityId], function(err, rows, fields) {
		if (err) { callback(err); return; }
		console.log('Associated columnId ' + columnId + ' and entityId ' + entityId);
		callback(null);
	});
}