var fs 				= require('fs');
var stream			= require('stream');
var TableCleaner 	= require('../models/table-cleaner.js');
var spec 			= require('stream-spec');

describe('Table Cleaner', function() {
	var tableCleaner,
		cleanData = './spec/test_table_cleaner_clean.csv',
		csvPath = './spec/test_table_cleaner.csv';

	beforeEach(function( done ) {
		// fs.createReadStream(csvPath).pipe(tableCleaner);
		// tableCleaner.on('write', function())
		// tableCleaner.on('finish', function() {
		// 	// var lines = cleanData.toString().split('\n');
		// 	console.log(this);
		// 	expect(lines.length).toBe(9);
		// 	done();
		// });
		tableCleaner = new TableCleaner();
		done();
	});

	it('it should clean a line', function( done ) {
		var line = tableCleaner.cleanLine('Github.,SCSS,Custom @mixins,100+ source files,"7,000 selectors","2 final stylesheets, because of IE selector limit","DROP TABLE tables",');
		expect(line).toBe("'Github','SCSS','Custom @mixins','100+ source files','7,000 selectors','2 final stylesheets, because of IE selector limit','DROP TABLE tables',''");
		done();
	});

	it('should split lines that are delineated with "\\r", "\\r\\n" and "\\n"', function( done ) {
		var lines = 'Github, Gorthorb, whatever\nCSS Tricks, don\'t bother, nope\r\nHi Mom, what, she said\rthis,line,is wrong';
		expect( tableCleaner.splitLines( lines ) ).toEqual([
			'Github, Gorthorb, whatever',
			'CSS Tricks, don\'t bother, nope',
			'Hi Mom, what, she said',
			'this,line,is wrong'
		]);
		done();
	});

	xit('should clean multiple lines and put them back together', function() {
		var clean = fs.createWriteStream( cleanData );
		fs.createReadStream( csvPath ).pipe( tableCleaner ).pipe( clean );
		clean.on( 'finish', function() {
			expect( fs.readFileSync( cleanData ) ).toBe("")
		});
	});
});