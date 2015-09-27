// Utility methods
// ------------------------------

module.exports = {
	highestZIndex: function (elem) {
		var elems = document.getElementsByTagName(elem);
		var highest = 0;
		for (var i = 0; i < elems.length; i++)
		{
			var zindex=document.defaultView.getComputedStyle(elems[i],null).getPropertyValue("z-index");
			zindex = parseInt(zindex);
			if ((zindex > highest) && !isNaN(zindex))
			{
				highest = zindex;
			}
		}
		return highest;
	},

	formatTitle: function( title ) {
		// Return an uppercase version of the title
		// with spaces instead of underscores
		if ( !title ) {
			return '_';
		} else if ( title === '_' ) {
			return title;
		} else {
			return title.toLowerCase().replace( /_/g, ' ' ).replace(/\b./g, function(m){ return m.toUpperCase(); });
		}
	}
};