var Config = require('./embed-config.js');
var ColumnsTable = require('../javascripts/models/ColumnsTable.js');

(function() {

	// Basic setup operations before we start creating tables
	// ------------------------------------------------------

	// Do the following tasks only once per page
	if(!Columns.hasFinishedSetup) { Columns.hasFinishedSetup = false; };
	if (!Columns.hasFinishedSetup) {

		// Add the table stylsheet to the page
		var style = document.createElement('link');
		style.rel = 'stylesheet';
		style.type = 'text/css';
		style.href = Config.css_path;
		style.media = 'all';
		document.head.appendChild(style);

		// Create global variables to store our tables and manage the load process
		if(!Columns.scripts) { Columns.scripts = []; };
		if(!Columns.tables) { Columns.tables = []; };

		document.getElementsByTagName('head')[0].innerHTML += Columns.EmbeddableTemplates['views/embed-table/analytics.hbs']();

		// Make sure we don't do this setup again
		Columns.hasFinishedSetup = true;
	}

	var scripts = Columns.scripts;
	var tables = Columns.tables;
		
	// Find all the scripts generaged by us
	// and create a new table for each one!
	var scriptTags = document.getElementsByTagName('script');
	for (var i = 0; i < scriptTags.length ; i++) {
		var scriptTag = scriptTags[i];
		if (scriptTag.src.search( Config.embed_path ) > -1
			&& scripts.indexOf( scriptTag ) < 0
			&& scriptTag.type === 'text/javascript' /* To eliminate accidental use of cached script */ ) {

			scripts.push(scriptTag);

			// Create a new table
			var table = new ColumnsTable(scriptTag);
			// table.preview = $$(scriptTag).data('preview');
			tables.push(table);
			table.render();

			// If we're in preview mode, make sure we listen for data update events
			if ( !table.preview ) {
				// Columns.Template.setupTableEventListeners(table.$$table);
				table.fetchData();	
			}
		}
	}


})();