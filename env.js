module.exports = {
	"development": {
		"database": {
			"host": "localhost",
			"user": "root",
			"password": "",
			"name": "columns"
		}
	},
	"test": {
		"database": {
			"host": "localhost",
			"user": "root",
			"password": "",
			"name": "columns-test"
		}
	},
	"production": {
		// "database": {
		// 	"host": "us-cdbr-east-06.cleardb.net",
		// 	"user": "bba37e07bb3047",
		// 	"password": "4310d579",
		// 	"name": "heroku_451ce68e01560d7"
		// }
		"database": {
			"host": process.env.RDS_HOSTNAME,
			"user": process.env.RDS_USERNAME,
			"password": process.env.RDS_PASSWORD,
			"name": process.env.RDS_PORT
		}
	}
};