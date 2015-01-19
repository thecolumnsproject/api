var fs 				= require('fs');
var stream			= require('stream');
var TableCleaner 	= require('../models/table-cleaner.js');
var spec 			= require('stream-spec');

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
		this.tableCleaner = new TableCleaner();
	});

	it('it should clean a line', function() {
		var line = this.tableCleaner.cleanLine('Github,SCSS,Custom @mixins,100+ source files,"7,000 selectors","2 final stylesheets, because of IE selector limit","DROP TABLE tables",');
		expect(line).toBe("'Github','SCSS','Custom @mixins','100+ source files','7,000 selectors','2 final stylesheets, because of IE selector limit','DROP TABLE tables',''");
	});

	// it('should clean multiple lines and put them back together', function() {

	// });
});