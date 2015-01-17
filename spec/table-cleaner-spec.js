var fs 				= require('fs');
var stream			= require('stream');
var tableCleaner 	= require('../models/table-cleaner.js');

describe('Table Cleaner', function() {
	var cleanData,
		csvPath = './spec/test_table_cleaner.csv';

	beforeEach(function() {
		// fs.createReadStream(csvPath).pipe(tableCleaner);
		// tableCleaner.on('write', function())
		// tableCleaner.on('finish', function() {
		// 	// var lines = cleanData.toString().split('\n');
		// 	console.log(this);
		// 	expect(lines.length).toBe(9);
		// 	done();
		// });
	});

	it('it should clean a line', function() {
		var line = tableCleaner.cleanLine('Github,SCSS,Custom @mixins,100+ source files,"7,000 selectors","2 final stylesheets, because of IE selector limit","DROP TABLE tables",');
		expect(line).toBe("'Github','SCSS','Custom @mixins','100+ source files','7,000 selectors','2 final stylesheets, because of IE selector limit','DROP TABLE tables',''");
	});

	// it('should clean multiple lines and put them back together', function() {
		
	// });
});