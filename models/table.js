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
	this.addType(type, function(err, typeId) {
		if (err) { callback(err, null); return; }

		// Add each entity to the type table
		// as well as the entities table
		// and process its data
		entities.forEach(function(entity, index) {
			console.log(entity.name);
			_this.addEntity(entity.name, function(err, entity, entityId) {
				if (err) { callback(err, null); return; }
				
				// Associate the entity with the type
				_this.associate(entityId, typeId, function(err) {
					if (err) callback(err);
					
					// 
					entity.columns.forEach(function(column, index) {

					});
				});

				// 
			});
		});
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
			callback(null, entity, rows[0].id)
		} else {
			var sql = "INSERT INTO entities (name) VALUES (" + entity + ")";
			connection.query(sql, function(err, rows, fields) {
				if (err) { callback(err, null); return; }
				console.log(entity + ' added to entities table with id ' + rows['insertId']);
				callback(null, entity, rows['insertId'])
			});	
		}
	});
}

/**
 * Accept an entityId and a typeId
 * and associate them in the dababase
 * establishing a many-to-many relationship
 * 
 * @api private
*/
Table.prototype.associate = function(entityId, typeId, callback) {
	var sql = "SELECT entityId, typeId FROM entities_to_types WHERE entityId=? AND typeId=?";
	console.log(sql);
	connection.query(sql, [entityId, typeId], function(err, rows, fields) {
		if (err) { callback(err, null); return; }
		if (rows.length > 0) {
			console.log('These items are already associated');
			callback(null);
		} else {
			var sql = "INSERT INTO entities_to_types (entityId, typeId) VALUES (?, ?)";
			console.log(sql);
			connection.query(sql, [entityId, typeId], function(err, rows, fields) {
				if (err) { callback(err, null); return; }
				console.log('Associated entityId ' + entityId + ' and typeId ' + typeId);
				callback(null);
			});
		}
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

