var mysql 	   		= require('mysql');
var fs 				= require('fs');
var common 	   		= require('../common');
var config 	   		= common.config();
var Registration	= require('../models/registration.js');

describe('Registration', function() {

	var registration;
	beforeEach(function( done ) {

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
				registration = new Registration();

				// End the connection
				connection.end();

				// Start running tests
				done();
			});
		});
	});

	afterEach(function() {
		// registration.connection.end();
	});

	describe('New Registration', function() {

		beforeEach(function() {
			spyOn( registration, '_addUser' ).and.callFake(function( user, callback) {
				callback( null, 1 );
			});
			spyOn( registration, '_welcomeUser' );
		});

		it('should return an error if passed an invalid email', function( done ) {
			spyOn( registration, '_isEmailValid' ).and.returnValue( false );
			registration.registerUser('lubin.jeremy@gmail.com', function( err ) {
				expect( err ).toEqual( new Error('Invalid email address') );
				expect( registration._addUser ).not.toHaveBeenCalled();
				expect( registration._welcomeUser ).not.toHaveBeenCalled();
				done();
			});
		});

		it('should add the user to the database', function( done ) {
			spyOn( registration, '_isEmailValid' ).and.returnValue( true );
			registration.registerUser('lubin.jeremy@gmail.com', function( err ) {
				expect( registration._addUser ).toHaveBeenCalled();
				done();
			});
		});

		it('should send the user a welcome email', function( done ) {
			spyOn( registration, '_isEmailValid' ).and.returnValue( true );
			registration.registerUser('lubin.jeremy@gmail.com', function( err ) {
				expect( registration._welcomeUser ).toHaveBeenCalled();
				done();
			});
		});
	});

	describe('Adding User to Database', function() {

		it('should add new users to the database', function( done ) {
			registration._addUser( 'lubin.jeremy@gmail.com', function( err, id ) {
				expect( id ).toBe( 2 );
				done();
			});
		});

		it('should ignore duplicate additions', function( done ) {
			registration._addUser( 'jeremy.lubin@columns.com', function( err, id ) {
				expect( id ).toBe( 1 );
				done();
			});
		});
	});

	describe('Sending Welcome Email', function() {

	});

});