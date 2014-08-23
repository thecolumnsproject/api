var mysql 	   	= require('mysql');
var fs 			= require('fs');

var Table 		= require('../models/tables/table.js');
var fixtures 	= require('./fixtures.json');

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
				// connection.query('INSERT INTO types (name) VALUES (startup)', function(err, rows, fields) {
				// 	if (err) throw err;
				// });

				// Rebuild the database
				fs.readFile('spec/test_db_setup.sql', 'utf8', function(err, sql) {
					if (err) throw err;
					console.log(table.pool);
					var query = table.pool.query(sql, function(err, rows, fields) {
						console.log(query.sql);
						if (err) throw err;
						console.log(rows);
					});
				});
			});

			afterEach(function() {
				// Clear test database
				// connection.query('TRUNCATE TABLE types', function(err, rows, fields) {
				// 	if (err) throw err;
				// });
			});

			it('should add new types to the table', function() {
				// runs(function() {
				// 	table.add(data);
				// });

				// waitsFor()


			});
		});
	});
});