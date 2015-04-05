var mysql 	   	= require('mysql');
var fs 			= require('fs');
var common 	   	= require('../common');
var config 	   	= common.config();
var Table 		= require('../models/tables/table.js');
var fixtures 	= require('./fixtures.json');

describe('Tables', function() {

	var table;
	beforeEach(function( done ) {

		// Add dummy data to test database
		// connection.query('INSERT INTO types (name) VALUES (startup)', function(err, rows, fields) {
		// 	if (err) throw err;
		// });

		// Rebuild the database
		fs.readFile('spec/test_db_setup.sql', 'utf8', function(err, sql) {
			if (err) throw err;
			var connection = mysql.createConnection({
				host		: config.database.host,
				user		: config.database.user,
				password	: config.database.password,
				multipleStatements	: true
			});
			var query = connection.query(sql, function(err, rows, fields) {
				if (err) throw err;

				// Create the table object
				// once we've set up the database
				table = new Table();

				// End the connection
				connection.end();

				// Start running tests
				done();
			});
		});
	});

	xdescribe('Initiating a table', function() {
		
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

	describe('Getting a table', function() {

		it('should return an error when not passed a table id', function( done ) {
			table.find( undefined, 0, function( err ) {
				expect( err ).toEqual( new Error('No table id specified') );
				done();
			});
		});

		it('should return an error if the correct table cannot be found', function( done ) {
			table.find( 'undefined', 0, function( err ) {
				expect( err ).toEqual( new Error( 'No table found for id undefined' ) );
				done();
			});
		});
	});
});