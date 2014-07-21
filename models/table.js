var common 	   	= require('../common')
var config 	   	= common.config();
var mysql 	   	= require('mysql');
var connection 	= mysql.createConnection({
	host		: config.database.host,
	user		: config.database.user,
	password	: config.database.password,
	database	: config.database.name
});

module.exports = Table;

function Table() {
	this.type = '';
	this.entities = [];
}

/**
 * Accept api input data
 * and parse for storage
 * in the database
 * --  
 * 1) Create a table for [type] 			- done
 * 2) For each 'entity'						- done
 * 3) 	Add to [entities] table 			- done
 * 4) 	Add to [type] table 				- done
 * 5) 	Loop through 'columns'
 * 6)		Create a table for [name]
 * 7)		Loop through 'rows'
 * 8)			Add (value, timestamp, identifier_columns, identifier_values) to [name] table
 * --
 * @api public
*/

Table.prototype.add = function(type, entities, callback) {
	// this.type = type;
	// this.entities = data;
	var _this = this;

	// Create a table for the type
	// and process the entities
	this.addType(type, function(err, typeId) {
		if (err) { callback(err, null); return; }
		_this.addEntitiesForTypeId(entities, typeId, callback);
	});
}

/**
 * Accept an array of entities
 * and a type id for which to
 * categorize the entities
 * 
 * @api private
*/
Table.prototype.addEntitiesForTypeId = function(entities, typeId, callback) {
	var _this = this;
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
Table.prototype.addEntityForTypeId = function(entity, typeId, callback) {
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
Table.prototype.addColumnsForEntityId = function(columns, entityId, callback) {
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
Table.prototype.addColumnForEntityId = function(column, entityId, callback) {
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
Table.prototype.addRowsForColumnAndEntityId = function(rows, column, entityId, callback) {
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
Table.prototype.addRowForColumnAndEntityId = function(row, column, entityId, callback) {
	var data = {
		value: row.value,
		timestamp: new Date(row.timestamp),
		entityId: entityId
	};

	var id_columns = [];
	var id_values = [];
	for(identifier in row.identifiers) {
		id_columns.push(identifier);
		id_values.push(row.identifiers[identifier]);
	}
	data['identifier_columns'] = id_columns.join();
	data['identifier_values'] = id_values.join();

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
Table.prototype.addType = function(type, callback) {
	type = this.formatColumnHeader(type);
	var sql = "SELECT id FROM types WHERE name=" + type;
	connection.query(sql, function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		if (rows.length > 0) {
			console.log(type + ' already exists with id ' + rows[0].id);
			callback(null, rows[0].id)
		} else {
			var sql = "INSERT INTO types (name) VALUES (" + type + ")";
			connection.query(sql, function(err, rows, fields) {
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
Table.prototype.addEntity = function(entity, callback) {
	entity = this.formatColumnHeader(entity);
	var sql = "SELECT id FROM entities WHERE name=" + entity;
	connection.query(sql, function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		if (rows.length > 0) {
			console.log(entity + ' already exists with id ' + rows[0].id);
			callback(null, rows[0].id)
		} else {
			var sql = "INSERT INTO entities (name) VALUES (" + entity + ")";
			connection.query(sql, function(err, rows, fields) {
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
 * Return the column's id
 * @api private
*/
Table.prototype.addColumn = function(column, callback) {
	column  = 	this.formatColumnHeader(column);
	var sql =	"INSERT INTO columns (name) VALUES (" + column + ") " +
				"ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)";

	connection.query(sql, function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		var columnId = rows['insertId'];
		console.log(column + ' added to columns table with id ' + columnId);

		sql =	"CREATE TABLE IF NOT EXISTS ??.?? " +
				"(value TEXT," +
				" timestamp DATETIME," +
				" identifier_columns TEXT," +
				" identifier_values TEXT," +
				" entityId MEDIUMINT)";
		connection.query(sql, [config.database.name, column], function(err, rows, fields) {
			if (err) { callback(err, null); return; }
			console.log('Added table for column ' + column);
			callback(null, columnId);
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
Table.prototype.addRowWithDataToColumn = function(data, column, callback) {
	column  = 	this.formatColumnHeader(column);
	var sql = "INSERT INTO ?? SET ?";
	var query = connection.query(sql,
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
Table.prototype.associateEntityAndType = function(entityId, typeId, callback) {
	var sql = "SELECT entityId, typeId FROM entities_to_types WHERE entityId=? AND typeId=?";
	connection.query(sql, [entityId, typeId], function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		if (rows.length > 0) {
			console.log('These items are already associated');
			callback(null);
		} else {
			var sql = "INSERT INTO entities_to_types (entityId, typeId) VALUES (?, ?)";
			connection.query(sql, [entityId, typeId], function(err, rows, fields) {
				if (err) { callback(err, null); return; }
				console.log('Associated entityId ' + entityId + ' and typeId ' + typeId);
				callback(null);
			});
		}
	});
}

/**
 * Accept an entityId and a columnId
 * and associate them in the dababase
 * establishing a many-to-many relationship
 * 
 * @api private
*/
Table.prototype.associateColumnIdAndEntity = function(columnId, entityId, callback) {
	var sql =	"INSERT INTO columns_to_entities (columnId, entityId) VALUES (?, ?) " +
				"ON DUPLICATE KEY UPDATE columnId=columnId";

	connection.query(sql, [columnId, entityId], function(err, rows, fields) {
		if (err) { callback(err); return; }
		console.log('Associated columnId ' + columnId + ' and entityId ' + entityId);
		callback(null);
	});
}


// table.addColumn = function(column) {
// 	type 		= 	formatColumnHeader(type);
// 	var sql 	=	"SELECT * FROM information_schema.tables " +
// 					"WHERE table_schema = ? " +
// 					"AND table_name = ?? LIMIT 1";

// 	connection.query(sql, [config.database.name, type], function(err, rows, fields) {
// 		if (err) { callback (err, null); return; }		 Something went wrong 
// 		if (rows.length > 0) { 							/* The table exists! */
// 			callback(null, rows, fields);
// 		} else { 										/* No it doesn't :-( */
// 			sql ='CREATE TABLE ?? (entityId MEDIUMINT)';
// 			connection.query(sql, [type], function(err, rows, fields) {
// 				if (err) throw(err);
// 				insertColumnIntoTable(data, name);
// 			});
// 		}
// 	});
// }	

/**
 * Accept an entity
 * and add it to a table for its type
 * or create a new table for the type
 * if one doesn't exist
 * 
 * @api private
*/
// table.updateType = function(entity, callback) {
// 	var _this = this;

// 	var sql =	"SELECT * FROM information_schema.tables " +
// 				"WHERE table_schema = ? " +
// 				"AND table_name = ?? LIMIT 1";

// 		connection.query(sql, [config.database.name, this.type], function(err, rows, fields) {
// 			if (err) { callback (err, null); return; }

// 			if (rows.length > 0) {  The table exists! 

// 				// insertColumnIntoTable(data, name);
// 				_this.createType();

// 			} else { /* No it doesn't :-( */

// 				var sql = 'CREATE TABLE ?? (value TEXT, timestamp DATETIME, entityId MEDIUMINT)';
// 				connection.query(sql, [name], function(err, rows, fields) {
// 					if (err) throw(err);
// 					insertColumnIntoTable(data, name);
// 				});
// 			}
// 		});
// }

Table.prototype.formatColumnHeader = function(name) {
	return connection.escape(name).toLowerCase().replace(' ', '_');
}

