var $$ = require('../../bower_components/jquery/dist/jquery.js');

function ColumnsTableEvent () {

}

ColumnsTableEvent.send = function( type, data ) {
	$$(document).trigger( type, data );
};

ColumnsTableEvent.on = function( type, callback ) {
	$$(document).on( type, callback );
};

ColumnsTableEvent.off = function( type, callback ) {
	$$(document).off( type, callback );
};

ColumnsTableEvent.offAll = function() {
	$$(document).off();
};

module.exports = ColumnsTableEvent;