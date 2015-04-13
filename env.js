module.exports = {
	"development": {
		"database": {
			"host": "localhost",
			"user": "root",
			"password": "",
			"name": "columns"
		},
		"app":{
			"host": "http://127.0.0.1"
		},
		"data_path": "./uploaded-data/"
	},
	"test": {
		"database": {
			"host": "localhost",
			"user": "root",
			"password": "",
			"name": "columns_test"
		},
		"app":{
			"host": "http://appstg.thecolumnsproject.com"
		},
		"data_path": "./uploaded-data/"
	},
	"staging": {
		"database": {
			"host": process.env.RDS_HOSTNAME,
			"user": process.env.RDS_USERNAME,
			"password": process.env.RDS_PASSWORD,
			"name": 'columns'
		},
		"app":{
			"host": "http://appstg.thecolumnsproject.com"
		},
		"data_path": "./uploaded-data/"
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
			"name": 'columns'
		},
		"app":{
			"host": "http://app.thecolumnsproject.com"
		},
		"data_path": "./uploaded-data/"
	}
};