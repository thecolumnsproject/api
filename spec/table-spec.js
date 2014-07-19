var common 	   	= require('../common')
var config 	   	= common.config();
var mysql 	   	= require('mysql');
var connection 	= mysql.createConnection({
	host		: config.database.host,
	user		: config.database.user,
	password	: config.database.password,
	database	: config.database.name
});

var Table 		= require('../models/table.js');
var fixtures 	= require('./fixtures');

describe('Tables', function() {
	describe('Initiating a table', function() {
		
		var data;
		var table;
		beforeEach(function() {
			data = fixtures['initial-table-data'];
			table = new Table();
		});

		it('should have proper default values', function() {
			expect(table.type).toEqual('');
			expect(table.entities).toEqual([]); 
		});

		describe('adding types', function () {

			beforeEach(function() {
				// Add dummy data to test database
				connection.query('INSERT INTO types (name) VALUES (startup)', function(err, rows, fields) {
					if (err) throw err;
				});
			});

			afterEach(function() {
				// Clear test database
				connection.query('TRUNCATE TABLE types', function(err, rows, fields) {
					if (err) throw err;
				});
			});

			it('should add new types to the table', function() {
				runs(function() {
					table.add(data);
				});

				// waitsFor()


			});
		});
	});
});