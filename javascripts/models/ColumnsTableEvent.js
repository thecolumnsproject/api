var $$ = require('../../bower_components/jquery/dist/jquery.js').noConflict();

function ColumnsTableEvent () {

}

ColumnsTableEvent.send = function( object, type, data ) {
	$$(object).trigger( type, data );
};

ColumnsTableEvent.on = function( object, type, callback ) {
	$$(object).on( type, callback );
};

ColumnsTableEvent.off = function( $$table, type, callback ) {
	$$(document).off( type, callback );
};

ColumnsTableEvent.offAll = function() {
	$$(document).off();
};

module.exports = ColumnsTableEvent;