var $$			 		= require('../../bower_components/jquery/dist/jquery.js');
var Utils		 		= require('./Utils.js');
var ColumnsTableEvent 	= require("./ColumnsTableEvent.js");
var Hammer 				= require('../../vendor/javascripts/hammer.custom.js');
var TEMPLATE 	 		= Columns.EmbeddableTemplates['views/embed-table/detail-view.hbs'];

var CLOSE_BUTTON_SELECTOR = '.columns-table-detail-view-close-button',
	OPEN_CLASS = 'open';

function ColumnsTableDetailView( table, data ) {

	this.table = table;

	// Check if this is an object,
	// according to the method here:
	// http://stackoverflow.com/a/14706877
	this.data;
	if( data === Object( data ) ) {
		this.data = data;
	}

	this._setupHandlebars();

}

ColumnsTableDetailView.prototype.render = function() {

	this.$$detailView = $$( TEMPLATE({
		data: this.data
	}));

	this._setupEvents();

	return this.$$detailView;

};

ColumnsTableDetailView.prototype.update = function( data ) {
	var $$oldView, $$newView, oldClass;

	// Check if this is an object,
	// according to the method here:
	// http://stackoverflow.com/a/14706877
	if( data !== Object( data ) ) {
		return;
	}
	
	this.data = data;

	// Update the view with the new data
	// or just render it for the first time
	if ( this.$$detailView ) {

		// Make a copy of the current view
		$$oldView = $$( this.$$detailView.get( 0 ) );
		oldClass = this.$$detailView.attr('class');

		// Update the content
		$$newView = this.render();
		$$newView.addClass( oldClass );
		$$oldView.replaceWith( $$newView );

	} else {
		this.render();
	}

	return this.$$detailView;
};

ColumnsTableDetailView.prototype.open = function() {
	this.$$detailView.addClass( OPEN_CLASS );
};

ColumnsTableDetailView.prototype.close = function() {
	this.$$detailView.removeClass( OPEN_CLASS );

	ColumnsTableEvent.send( this.table, 'ColumnsTableDetailViewDidClose', {
		detailView: this
	});
};

ColumnsTableDetailView.prototype.remove = function() {
	this.$$detailView.remove();
};

ColumnsTableDetailView.prototype._setupEvents = function() {
	var closeMc = new Hammer( this.$$detailView.find( CLOSE_BUTTON_SELECTOR ).get( 0 ) );
	closeMc.on('tap', this.close.bind( this ) );
};

ColumnsTableDetailView.prototype._setupHandlebars = function() {
	Handlebars.registerHelper('formatTitle', function(title, options) {
		return Utils.formatTitle( title );
	}.bind( this ));
};

module.exports = ColumnsTableDetailView;