var mysql 	   	= require('mysql');
var fs 			= require('fs');
var common 	   	= require('../../common');
var config 	   	= common.config();
var Table 		= require('../../models/tables/table.js');
var fixtures 	= require('./fixtures.json');

describe('Tables', function() {

	var table;
	var connection;

	beforeEach(function( done ) {

		connection = mysql.createConnection({
			host		: config.database.host,
			user		: config.database.user,
			password	: config.database.password,
			multipleStatements	: true
		});

		// Add dummy data to test database
		// connection.query('INSERT INTO types (name) VALUES (startup)', function(err, rows, fields) {
		// 	if (err) throw err;
		// });

		// Rebuild the database
		fs.readFile('spec/api/test_db_setup.sql', 'utf8', function(err, sql) {
			if (err) throw err;
			var query = connection.query(sql, function(err, rows, fields) {
				if (err) throw err;

				// Create the table object
				// once we've set up the database
				table = new Table();

				// Start running tests
				done();
			});
		});
	});

	afterEach(function( done ) {
		// End the connection
		connection.end();

		done();
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

	describe('Getting table data', function() {

		beforeEach(function( done ) {
			var sql = 'INSERT INTO tables (title) VALUES ("Hello")';
			var query = connection.query(sql, function(err, rows, fields) {
				if (err) throw err;

				// Start running tests
				done();
			});
		});

		it('should return an error when not passed a table id', function( done ) {
			table.getMetaData( undefined, function( err, data ) {
				expect( err ).toEqual( new Error('No table id specified') );
				done();
			});
		});

		it('should return an error if the table does not exist', function( done ) {
			table.getMetaData( 1, function( err, data ) {
				expect( err ).toEqual( new Error( 'No table found for id 1' ) );
				done();
			});
		});

		it('should return a title when the id is valid', function( done ) {
			table.getMetaData( 2, function( err, data ) {
				expect( data.title ).toEqual( "Hello" );
				done();
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

	describe('Cleaning table meta data', function() {

		it('should clean each individual column', function() {
			expect( table.sanitizeMetaData({
				columns: 'Github.,   .A random column.   ,Studio Filter10F 5&2 A23 A24 Abk. Abr. AD ADC AEF AF Ampl. Anch.'
			})).toEqual({
				title: undefined,
				source: undefined,
				source_url: undefined,
				columns: 'Github,A random column,Studio Filter10F 5&2 A23 A24 Abk Abr AD ADC AEF AF Ampl Anch',
				layout: undefined
			});
		});

		it('should eliminate duplicate columns', function () {
			expect( table.sanitizeMetaData({
				columns: 'Which areas could be improved?,Which areas could be improved?,Which areas could be improved?,Which areas could be improved?'
			})).toEqual({
				title: undefined,
				source: undefined,
				source_url: undefined,
				columns: 'Which areas could be improved?,Which areas could be improved?_2,Which areas could be improved?_3,Which areas could be improved?_4',
				layout: undefined
			});
		});
	});

	describe('Cleaning a table column name', function() {

		it('should remove trailing periods and whitespace', function() {
			expect( table.cleanColumn( 'Github.' ) ).toEqual( 'Github' );
		});

		it('should truncate anything after the 64th character', function() {
			expect( table.cleanColumn('hi') ).toBe('hi');
			expect( table.cleanColumn( 'aherhaskflqoetickdneglticoelfotiedcstufidosqleidcjflawudjftoweudci') )
				.toBe('aherhaskflqoetickdneglticoelfotiedcstufidosqleidcjflawudjftoweud');
			expect( table.cleanColumn( 'aherhaskflqoetickdneglticoelfotied cstufidosqleidcjflawudjftoweudci aherhaskflqoetickdneglticoelfotiedcstufidosqleidcjflawudjftoweudci') )
				.toBe('aherhaskflqoetickdneglticoelfotied cstufidosqleidcjflawudjftoweu');
		})

	});

	describe('Appending a number to a column name', function() {
		var column;

		it('should append the count to the column so that the name is longer after than it was before', function() {
			column = 'This is my column name';
			expect( table.appendCount( column, 10 ).length ).toBe( column.length + 3 );
			expect( table.appendCount( column, 1 ).length ).toBe( column.length + 2 );
		});

		it('should truncate the column so that the name is the same length before as after if appending the count would put the column over the limit', function() {
			column = 'aherhaskflqoetickdneglticoelfotiedcstufidosqleidcjflawudjftoweud';
			expect( table.appendCount( column, 10 ).length ).toBe( 64 );
			expect( table.appendCount( column, 1 ).length ).toBe( 64 );
			expect( table.appendCount( column + 'haera' , 10 ).length ).toBe( 64 );
		});

		it('should append the count to the column name, separated by an underscore', function() {
			expect( table.appendCount( "Hi this is a column", 10 ) ).toBe( "Hi this is a column_10" );
			expect( table.appendCount( "aherhaskflqoetickdneglticoelfotiedcstufidosqleidcjflawudjftoweudasdf", 10 ) ).toBe( "aherhaskflqoetickdneglticoelfotiedcstufidosqleidcjflawudjftow_10" );
		});
	});
});