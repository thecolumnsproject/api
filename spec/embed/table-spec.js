var ColumnsEvent 			= require('../../javascripts/models/ColumnsEvent.js');
var ColumnsTable 			= require('../../javascripts/models/ColumnsTable.js');
var ColumnsTableDetailView 	= require('../../javascripts/models/ColumnsTableDetailView.js');

jasmine.getFixtures().fixturesPath = 'spec/embed/fixtures';

describe('Embeddable Table', function() {
	var embed;

	beforeEach(function() {
		loadFixtures('embed-script.html');

		var scriptTags = document.getElementsByTagName('script'),
			script = scriptTags[ scriptTags.length - 1];

		embed = new ColumnsTable( script );
	});

	afterEach(function() {
		ColumnsEvent.offAll();
	});

	describe('Initialization', function() {

		it('should be in preview mode when in the app', function() {
			var newEmbed = new ColumnsTable('<script type="text/javascript" src="http://colum.nz/public/embed-table.js" data-preview="true" async></script>');
			expect( newEmbed.preview ).toBe( true );
		});

		it('should not be in preview mode when embedded', function() {
			var newEmbed = new ColumnsTable('<script type="text/javascript" src="http://colum.nz/public/embed-table.js" async></script>');
			expect( newEmbed.preview ).toBeUndefined();
		});
	});

	describe('Rendering Skeleton', function() {

		it('should render large form factor when appropriate', function() {
			spyOn( embed, 'isLargeFormFactor' ).and.returnValue( true );
			embed.render();
			expect( $('.columns-table-panel-container').length ).toBe( 1 );
			expect( $('.columns-table-panel-container').parent() ).toBeMatchedBy('body');
		});

		describe('Large Form Factor', function() {

			it('should create the large form factor expanded table structure', function() {
				expect( $( embed.renderLargeFormFactorExpandedTable() ) ).toHaveClass('columns-table-panel-container');
				// expect( $( embed.renderLargeFormFactorExpandedTable() ).find('.columns-table-shield').length ).toBe( 1 );
				expect( $( embed.renderLargeFormFactorExpandedTable() ).find('.columns-table-panel').length ).toBe( 1 );
			});
		});
	});

	describe('Expanding Table', function() {

		describe('Large Form Factor', function() {

			beforeEach(function( done ) {
				loadFixtures('embeddable-panel.html');
				spyOn( embed, 'isLargeFormFactor' ).and.returnValue( true );
				embed.render();
				done();
			});

			it('should append the table to the panel', function( done ) {
				embed.expand();
				setTimeout(function() {
					expect( embed.$$table.parent() ).toHaveClass('columns-table-panel');
					done();
				}, 250);
			});

			it('should animate the rows into position in the panel', function() {

			});
		});
	});

	xdescribe('Rendering Data', function() {

		describe('Large Form Factor', function() {

			beforeEach(function() {
				spyOn( embed, 'isLargeFormFactor' ).and.returnValue( true );
				embed.render();
			});

			it('should add a header to the panel', function() {

			});
		})
	});

	describe('Formatting Data', function() {

		describe('Formatting the Source Url', function() {

			it('should preserve correctly formatted urls', function() {
				expect( embed.formatSourceUrl("http://myurl.com") ).toBe("http://myurl.com");
				expect( embed.formatSourceUrl("https://myurl.com") ).toBe("https://myurl.com");
			});
		
			it('should add a protocol to urls without one', function() {
				expect( embed.formatSourceUrl("myurl.com") ).toBe("http://myurl.com");
			});

			it('should leave empty urls alone', function() {
				expect( embed.formatSourceUrl("") ).toBe("");
			})
		});
	});

	describe('Rendering a Row', function() {
		var layout = {
			type: 'group',
			style: [{
				property: 'padding',
				value: '12px'
			}],
			values: []
		};

		it('should be z-indexed relative to position in the table', function() {
			expect( embed.renderRow( {}, 5, layout ) ).toHaveCss( { "z-index": "-5"} );
			expect( embed.renderRow( {}, 10, layout ) ).toHaveCss( { "z-index": "-10"} );
			expect( embed.renderRow( {}, 0, layout ) ).toHaveCss( { "z-index": "0"} );
		});
	});

	describe('Listening to Editor Events', function() {

		beforeEach(function() {			
			embed.preview = true;
			embed.render();
			embed._setupEventListeners();
		});

		describe('Opening an Existing Table', function() {
			var layout = { model: {} };
			var table = {
				layout: layout
			}

			beforeEach(function( done ) {
				spyOn( embed, 'generateLayout' );
				spyOn( embed, 'renderData' );
				spyOn( embed, 'expand' );
				done();
			});

			it('should generate a new layout', function( done ) {
				ColumnsEvent.send( 'Columns.Table.DidOpenWithSuccess', {
					table: table
				});
				
				expect( embed.generateLayout ).toHaveBeenCalledWith( {}, false );
				done();
			});

			it('should render the table data', function( done ) {
				ColumnsEvent.send( 'Columns.Table.DidOpenWithSuccess', {
					table: table
				});
					
				expect( embed.renderData ).toHaveBeenCalledWith( table );
				done();

			});

			it('should expand', function( done ) {
				ColumnsEvent.send( 'Columns.Table.DidOpenWithSuccess', {
					table: table
				});

				setTimeout(function() {
					expect( embed.expand ).toHaveBeenCalled();
					done();
				}, 0)
			});
		});

		xit('should re-render when table details are udpated', function() {
			// spyOn( this.embed, 'generateLayout' );
			// spyOn( this.embed, 'renderData' );
			ColumnsEvent.send( 'Columns.Table.DidChange', {
				table: new Table({ title: 'My Table' })
			});

			expect( embed.$$table.find('.columns-table-title') ).toHaveText('My Table');
		});
	});

	describe('Tapping on a Row', function() {

		beforeEach(function() {
			loadFixtures('embed-table-row.html');
			embed.render();
			embed.data = {
				data: [{
					"one": "data",
					"two": "datum",
					"three": "datom"
				}, {
					"one": "rata",
					"two": "ratum",
					"three": "ratom"
				}, {
					"one": "bata",
					"two": "batum",
					"three": "batom"
				}]
			};
			spyOn( ColumnsTableDetailView.prototype, "open" );
		});

		it('should select the row and deselect all others', function() {
			appendLoadFixtures('embed-table-row-selected.html');
			var $row = $('.columns-table-row');
			embed._onRowTap({
				target: $('.columns-table-row').get( 0 )
			});
			
			expect( embed.selectedRowIndex ).toBe( 0 );
			expect( $('.columns-table-row.selected').length ).toBe( 1 );
			expect( $('.columns-table-row.selected').data("index") ).toBe( 0 );
		});

		it('should deselect a row and close the detail page when the open row is tapped again', function() {
			spyOn( ColumnsTableDetailView.prototype, "close" );
			embed.detailView = new ColumnsTableDetailView();
			embed.selectedRowIndex = 1;
			appendLoadFixtures('embed-table-row-selected.html');
			embed._onRowTap({
				target: $('.columns-table-row').get( 1 )
			});

			expect( embed.selectedRowIndex ).toBeNull();
			expect( ColumnsTableDetailView.prototype.close ).toHaveBeenCalled();

		});

		it('should update an existing detail view', function() {
			spyOn( ColumnsTableDetailView.prototype, "update").and.callThrough();
			embed.detailView = new ColumnsTableDetailView( embed.data.data[0] );

			embed._onRowTap({
				target: $('.columns-table-row').get( 0 )
			});

			expect( embed.detailView.update ).toHaveBeenCalled();

		});

		it('should create a detail view with the correct data', function() {
			embed._onRowTap({
				target: $('.columns-table-row').get( 0 )
			});
			expect( embed.detailView.data ).toEqual({
				"one": "data",
				"two": "datum",
				"three": "datom"
			});
		});

		it('should append and show the detail view', function() {
			embed._onRowTap({
				target: $('.columns-table-row').get( 0 )
			});
			expect( embed.$$table.find('.columns-table-detail-view').length ).toBe( 1 );
			expect( ColumnsTableDetailView.prototype.open ).toHaveBeenCalled();
		});
	});
});