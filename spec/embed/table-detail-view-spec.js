var TableDetailView = require("../../javascripts/models/ColumnsTableDetailView.js");
var ColumnsTableEvent = require("../../javascripts/models/ColumnsTableEvent.js");
var ColumnsTable = require('../../javascripts/models/ColumnsTable.js');

jasmine.getFixtures().fixturesPath = 'spec/embed/fixtures';

describe('Columns Table Detail Page', function() {
	var detailView;
	var data = {
		"one": "data",
		"two": "datum",
		"three": "datom"
	};
	var table = new ColumnsTable();

	beforeEach(function() {
		detailView = new TableDetailView( table, data );
	});

	describe('Initialization', function() {

		it('should initialize without an initialization object', function() {
			detailView = new TableDetailView();
			expect( detailView.data ).toBeUndefined();
		});

		it('should initialize with an object', function() {
			expect( detailView.table ).toEqual( table )
			expect( detailView.data ).toEqual( data )
		});
	});

	describe('Updating', function() {

		it('should reset its data', function() {
			detailView.update({
				"one": "rata",
				"two": "ratum",
				"three": "ratom"
			});
			expect( detailView.data ).toEqual({
				"one": "rata",
				"two": "ratum",
				"three": "ratom"
			});
		});

		it('should re-render with the new data', function() {
			detailView.update({
				"one": "rata",
				"two": "ratum",
				"three": "ratom"
			});
			expect( detailView.$$detailView ).toContainText("rata");
		});

		it('should maintain open state', function() {
			loadFixtures("embed-table-detail-view-open.html");
			detailView.$$detailView = $('.columns-table-detail-view');
			detailView.update();
			expect( detailView.$$detailView ).toHaveClass("open");
		});
	});

	describe('Rendering', function() {
		var $detailView;

		beforeEach(function() {
			loadFixtures("embed-table.html");
			$detailView = detailView.render();
		});

		it('should render with the correct template', function() {
			expect( $detailView ).toHaveClass("columns-table-detail-view");
		});

		it('should have a row for each data item', function() {
			expect( $detailView.find(".columns-table-detail-view-row").length ).toBe( 3 );
		});

		xit('should attach to the correct part of the table', function() {
			expect( $detailView.parent() ).toHaveClass("columns-table-widget");
		});
	});

	xdescribe('Showing', function() {

		it('should slide on screen', function() {

		});

		it('should notify the table that it is showing', function() {

		});
	});

	describe('Closing', function() {

		beforeEach(function() {
			detailView.render();
			detailView.open();
		});

		it('should slide off screen', function() {
			expect( detailView ).not.toHaveClass('open');
		});

		it('should notify the table that it is hidden', function() {
			spyOn( ColumnsTableEvent, 'send' );
			detailView.close();
			expect( ColumnsTableEvent.send ).toHaveBeenCalledWith( table, 'ColumnsTableDetailViewDidClose', {
				detailView: detailView
			});
		});
	});

	describe('Removing', function() {

		beforeEach(function() {
			$detailView = detailView.render();
			spyOn( detailView.$$detailView, 'remove' );
		});

		it('should remove itself from the DOM', function() {
			detailView.remove();
			expect( detailView.$$detailView.remove ).toHaveBeenCalled();
		});
	});

	describe('Sending Events', function() {

		it('should send an event when it shows', function() {

		});

		it('should send an event when it hides', function() {

		});
	});
});