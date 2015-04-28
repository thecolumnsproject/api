var cluster 	= require('cluster');
if (cluster.isMaster) {

	var cpuCount = require('os').cpus().length;
	for (var i = 0; i < cpuCount; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker) {
		console.log('Worker ' + worker.id + ' died :(');
			cluster.fork();
	});

} else {

	var express    	= require('express');
	var bodyParser 	= require('body-parser');
	// var parted 		= require('parted');
	var multer  	= require('multer');
	var session 	= require('cookie-session');
	var app        	= express();

	// Configure the API route settings
	var api = require('./routes/api');
	app.use('/', function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', '*');
		next();
	});

	// Set up global middleware
	app.use(bodyParser({limit: '200mb'}));
	app.use(multer({
		dest: './uploaded-data/',
		onFileUploadStart: function(file) {
            console.log('Starting ' + file.name);
            // console.log(file);
        },
        onFileUploadData: function(file, data) {
            console.log('Got a chunk of data!');
            console.log(file.path);
        },
        onFileUploadComplete: function(file) {
            console.log('Completed file!');
            // console.log(file);
        },
        onParseStart: function() {
            console.log('Starting to parse request!');
        },
        onParseEnd: function(req, next) {
            console.log('Done parsing!');
            console.log(req.files, req.body);
            next();
        },
		onFileSizeLimit: function (file) {
		  console.log('Crossed file size limit! Failed: ', file.originalname)
		  fs.unlink('./' + file.path) // delete the partially written file 
		},
		onFilesLimit: function () {
		  console.log('Crossed file limit!')
		},
		onFieldsLimit: function () {
		  console.log('Crossed fields limit!')
		},
		onPartsLimit: function () {
		  console.log('Crossed parts limit!')
		},
        onError: function(e, next) {
            if (e) {
                console.log(e.stack);
            }
            next();
        }
	}));
	// app.use(function(req, res, next) {
	// 	// req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
	// 	// 	var saveTo = path.join(__dirname + '/uploaded-data/', path.basename(fieldname));
 //  //     		file.pipe(fs.createWriteStream(saveTo));
	// 	// });
	// 	// req.busboy.on('finish', function(key, value, keyTruncated, valueTruncated) {
	// 	// 	console.log('Done uploading file!');
	// 	// });
	// 	// req.pipe(req.busboy);
	// 	req.busboy.on('finish', next);
	// });
	// app.use(parted({
	//   // custom file path
	//   path: __dirname + '/uploaded-data',
	//   // memory usage limit per request
	//   // limit: 30 * 1024,
	//   limit: 200000000,
	//   diskLimit: 200000000,
	//   // disk usage limit per request
	//   // diskLimit: 30 * 1024 * 1024,
	//   // enable streaming for json/qs
	//   stream: true
	// }));
	app.use(session({
	  keys: ['blerg']
	  // secureProxy: true // if you do SSL outside of node
	}));

	app.use('/', api);

	// Start the server
	var port = process.env.PORT || 8080;
	app.listen(port);
	console.log('Magic happens on port ' + port + " with worker " + cluster.worker.id); 
}

