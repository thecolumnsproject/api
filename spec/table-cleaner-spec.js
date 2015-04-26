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

	it('should clean multiple lines and put them back together', function( done ) {
		var clean = fs.createWriteStream( cleanData );
		fs.createReadStream( csvPath ).pipe( tableCleaner ).pipe( clean );
		clean.on( 'finish', function() {
			expect( fs.readFileSync( cleanData ).toString() ).toBe("'Company','Preprocessor','Prefixing','Source Files','Selectors','Style Enforcement','Notes'\n'Github','SCSS','Custom @mixins','100+ source files','7,000 selectors','2 final stylesheets, because of IE selector limit'\n'Buffer','LESS','Autoprefixer','93 source files','5328 selectors','2 final stylesheets'\n'CodePen','SCSS','Autoprefixer','171 source files','1186 selectors','Asset pipeline'\n'Ghost','SCSS (libsass)','Autoprefixer','36 source files','1609 selectors','Open source'\n'Groupon','Sass (syntax unclear)','Compass','Unknown source files','Unknown selectors','Toolstrap'\n'Lonely Planet','Sass','Autoprefixer','150+ source files','1527 selectors','BEM / OOCSS, Normalize.css, SVG icons'\n'Medium','LESS','Custom @mixins','50-100 source files','Unknown selectors','No nesting, custom methodology for naming'\n'Trello','LESS','Custom @mixins','44 source files','2426 selectors','1 final stylesheet, namespacing'");
			done();
		});
	});
});