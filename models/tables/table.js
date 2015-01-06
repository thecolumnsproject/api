var tableSet 	= require('./table-set');
var tableGet 	= require('./table-get');
var tableUtils	= require('./table-utils');

var conflate 	= require('conflate');
var common 	   	= require('../../common')
var config 	   	= common.config();
var mysql 	   	= require('mysql');

function Table() {
	this.type = '';
	this.entities = [];
	this.pagingLimit = 20;
	this.pool = mysql.createPool({
		connectionLimit 	: 1000000,
		host				: config.database.host,
		user				: config.database.user,
		password			: config.database.password,
		database			: config.database.name,
		multipleStatements	: true
	});
	this.connection;
}

conflate(Table.prototype, tableSet);
conflate(Table.prototype, tableGet);
conflate(Table.prototype, tableUtils);
module.exports = Table;

