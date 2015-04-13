var common 	   		= require('../common')
var config 	   		= common.config();
var mysql 	   		= require('mysql');
var nodemailer		= require("nodemailer");
var smtpTransport 	= require('nodemailer-smtp-transport');
var fs 				= require('fs');
var handlebars		= require('handlebars');

function Registration() {

	this.connection = mysql.createConnection({
		host				: config.database.host,
		user				: config.database.user,
		password			: config.database.password,
		database 			: config.database.name,
		multipleStatements	: true
	});
}

Registration.prototype.registerUser = function( user, callback ) {

	if ( this._isEmailValid( user ) ) {

		this._addUser( user, function( err, id ) {
			if ( err ) { callback( err, null ); return; }

			this._welcomeUser( user );
			callback( null );

		}.bind( this ));
	} else {
		callback( new Error('Invalid email address'), null );
	}
};

Registration.prototype._addUser = function( user, callback ) {
	var sql =	"INSERT INTO users (email) VALUES (?) " +
				"ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)";

	this.connection.connect();
	var query = this.connection.query(sql, [user], function(err, rows, fields) {
		this.connection.end();

		if ( err ) {
			callback( err, null );
		} else {
			callback( null, rows['insertId'] );
		}

		return;

	}.bind( this ));
};

Registration.prototype._welcomeUser = function( user ) {
	var transporter = nodemailer.createTransport(smtpTransport({
	 	host: "smtp.1and1.com",
        port: 587,
		auth: {
			user: 'jeremy@thecolumnsproject.com',
			pass: 'C0lumn5!'
		}
	}));

	var html = handlebars.compile( fs.readFileSync('views/emails/welcome.html').toString() )({
		host: config.app.host
	}).toString();
	// console.log( html );

	var mailOptions = {
		from: "\"The Columns Project\" <jeremy@thecolumnsproject.com>",
		to: "<" + user + ">",
		subject: 'Welcome to The Columns Project',
		generateTextFromHTML: true,
		html: html
	};

	transporter.sendMail(mailOptions, function( err, response ) {
	   	if ( err ) {
			console.log( err );
	  	} else {
			console.log( "Message sent to: " + user );
		}
	});
};

Registration.prototype._isEmailValid = function( email ) {
	return /\S+@\S+\.\S+/.test( email );
};

module.exports = Registration;