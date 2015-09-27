var $$ = require('../../bower_components/jquery/dist/jquery.js');

var Config = require('../embed-config.js'),
	Velocity = require('../../bower_components/velocity/velocity.js'),
	Hammer = require('../../vendor/javascripts/hammer.custom.js'),
	PreventGhostClick = require('../prevent-ghost-click.js'),
	ColumnsEvent = require('./ColumnsEvent.js'),
	ColumnsTableEvent = require('./ColumnsTableEvent.js'),
	ColumnsAnalytics = require('./ColumnsAnalytics.js');
	ColumnsTableDetailView = require('./ColumnsTableDetailView.js');
	ParseUri = require('../../vendor/javascripts/parseUri.js');
	// Handlebars = require('../../bower_components/handlebars/handlebars.runtime.js'),
	// Columns.EmbeddableTemplates = require('../../views/embeddable-templates.js')(Handlebars);

// Animation Constants
var ANIMATION_DURATION = 250;

// UI Constants
var ROW_OFFSET = 5,
	ROW_DELAY = ANIMATION_DURATION * 0.01;

// UI Management Classes
var TABLE_SELECTOR = '.columns-table-widget',
	TABLE_BODY_SELECTOR = '.columns-table',
	TABLE_ROW_SELECTOR = '.columns-table-row',
	TABLE_HEADER_SELECTOR = '.columns-table-header',
	TABLE_FOOTER_SELECTOR = '.columns-table-footer',
	TABLE_SHIELD_SELECTOR = '.columns-table-shield',
	TABLE_PANEL_SELECTOR = '.columns-table-panel',
	PLACEHOLDER_CLASS = 'columns-table-placeholder',
	EXPANDED_CLASS = 'columns-table-expanded',
	EXPANDING_CLASS = 'columns-table-expanding',
	COLLAPSING_CLASS = 'columns-table-collapsing',
	RELOCATED_CLASS = 'columns-table-relocated',
	LOADING_CLASS = 'loading',
	ERROR_CLASS = 'error',
	ANIMATING_CLASS = 'velocity-animating',
	HOSTED_PAGE_CLASS = 'hosted-page',
	SELECTED_ROW_CLASS = 'selected',
	$TABLE;
	// $$CONTAINER = $$(window);

var MAX_SMARTPHONE_SCREEN_WIDTH = 568;

// Utility methods
// ------------------------------

function highestZIndex(elem)
{
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
}

// Create a class for the table object
// that will allow us to easily manange multiple instances
// and control their display.
// Methods herein should allow the table to:
// 1) Render initially
// 2) Populate with data
// 3) Expand
// 4) Contract
function ColumnsTable(script) {

	// The placement of each table is dependent on the script that
	// was used to create it, so we need this to begin
	this.script = script;
	this.id = $$(script).data('table-id');

	// Determine whether or not we're in preview mode
	this.preview = $$(script).data('preview');
	this.forceMobile = $$(script).data('force-mobile');
	this.hostedPage = $$(script).data('hosted-page');
	this.sample = $$(script).data('sample');

	// Remember the table instance once it's been inserted into the DOM
	// as well as its jquery counterpart
	this.table;
	this.$$table;

	// Get a reference to the table's container.
	// On a smartphone, we'll use the window.
	// On larger form factors, we'll use the table's container.
	// Also get a reference to the table's panel if it's a large form factor
	this.$$container = $$(window);
	if ( this.isLargeFormFactor() ) {
		this.$$panel;
	}

	// Save a reference to the layout we create specifically for rows of this table
	this.row_layout;

	// Storage variables for resetting positions
	this.originalBackground = {};
	this.originalRows = [];
	// this.$$originalSibling;

	// Save a copy of the data so we can re-render the layout without going back to the server
	this.data;
	this.layout;

	this._setupEventListeners();

	// Create a unique handlebars environment
	// this.columnsbars = Handlebars.noConflict();
	this._setupHandlebars();
};

ColumnsTable.prototype._setupHandlebars = function() {

	// Handlebars.registerHelper('partial', function(name, ctx, hash) {
	//     // var ps = Handlebars.partials;
	//     // if(typeof ps[name] !== 'function')
	//     //     ps[name] = Handlebars.compile(ps[name]);
	//     // return ps[name](ctx, hash);

	//     return Columns['row-templates'][ name ](ctx, hash);
	// }.bind(this));
	// Handlebars.registerPartial({
	// 	group: Templates['templates/embed-table/row-group.hbs']
	// });
	// Handlebars.registerPartial('group', Handlebars.template( Templates['templates/embed-table/row-group.hbs']) );
	// Handlebars.registerPartial('column', Templates['templates/embed-table/row-value.hbs']);
	// Handlebars.registerPartial('footer', Templates['templates/embed-table/footer.hbs']);
	Handlebars.registerPartial('layout', Columns.EmbeddableTemplates['views/embed-table/layout.hbs']);
	Handlebars.registerPartial('style', Columns.EmbeddableTemplates['views/embed-table/style.hbs']);

	// Handlebars.registerHelper('ifIsGroup', function(type, options) {
	// 	return type == 'group' ? options.fn(this) : options.inverse(this);
	// });

	// Handlebars.registerHelper('ifIsSingle', function(type, options) {
	// 	return type == 'single' ? options.fn(this) : options.inverse(this);
	// });
};

// Render the initial table to the screen and position it correctly
ColumnsTable.prototype.render = function() {

	var _this = this;

	// Generate table skeleton
	// and insert it befor the script
	var skeleton = Columns.EmbeddableTemplates['views/embed-table/skeleton.hbs'];
	var tmpDiv = document.createElement('div'); tmpDiv.innerHTML = skeleton();
	this.table = this.script.parentNode.insertBefore(tmpDiv.firstChild, this.script);
	this.$$table = $$(this.table);

	// Generate table structure
	// var loading = createLoading();
	// var body = createBody();
	var loading = Columns.EmbeddableTemplates['views/embed-table/loading.hbs'];
	var error = Columns.EmbeddableTemplates['views/embed-table/error.hbs'];
	var body = Columns.EmbeddableTemplates['views/embed-table/body.hbs'];
	this.$$table.append(loading({img_path: Config.img_path}));
	this.$$table.append(error());
	this.$$table.append(body());

	// // Make the table bounce on scroll
	// // $TABLE.find('.columns-table-container').fancy_scroll({
	// // 	animation: "bounce"
	// // });

	// Determine whether we're on a small or large form factor
	// and use this to determine how to expand and contract
	// as well as initially place the table
	if (this.isLargeFormFactor()) {
		this.$$container = this.$$table.parent();
		this.$$table.addClass('large-form-factor');
		this.$$panel = $$( this.renderLargeFormFactorExpandedTable() );
		this.$$panel.css({
			"z-index": (highestZIndex('*') + 1)
		});
		$$('body').append( this.$$panel );
	} else if( this.shouldForceMobile() ) {
		this.$$container = this.$$table.parent();
	} else {
		this.$$container = $$(window);
		this.$$table.addClass('small-form-factor');
	}

	// Add a special class if we're inside a columns hosted page
	if ( this.hostedPage ) {
		this.$$table.addClass( HOSTED_PAGE_CLASS );
	}

	// Position table correctly given the size of the screen
	// and reposition on resize events
	$$(window).resize(function() {
		_this.position();
	});
	this.position();

	// // Prevent ghost clicks while the table is open
	PreventGhostClick(document, function() {
		return _this.$$table.hasClass(EXPANDING_CLASS) || _this.$$table.hasClass(EXPANDED_CLASS)
	});

	// Track the table render
	this.send({
		category: 'table',
		action: 'render'
	});
};

ColumnsTable.prototype.renderLargeFormFactorExpandedTable = function() {
	var panel = Columns.EmbeddableTemplates['views/embed-table/panel-skeleton.hbs'];
	return panel();
};

ColumnsTable.prototype.isInsideFrame = function() {
	try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

ColumnsTable.prototype.isLargeFormFactor = function() {
	if ( this.isInsideFrame() || this.shouldForceMobile() ) {
		return false;
	} else {
		return $$(window).width() > MAX_SMARTPHONE_SCREEN_WIDTH;
	}
};

ColumnsTable.prototype.shouldForceMobile = function() {
	return this.preview || ( this.sample && $$(window).width() > MAX_SMARTPHONE_SCREEN_WIDTH );
};

ColumnsTable.prototype.getOffsetTop = function() {
	if ( this.isLargeFormFactor() || this.shouldForceMobile() ) {
		return this.$$table.position().top; 
		// return this.$$container.scrollTop();
	} else {
		// return this.$$table.offset().top;
		// return this.$$table.get(0).offsetTop;
		return this.$$table.get(0).getBoundingClientRect().top + window.pageYOffset;
	}
};

ColumnsTable.prototype.getOffsetLeft = function() {
	if (this.isLargeFormFactor()) {
		return 0;
	} else if ( this.shouldForceMobile() ) {
		return this.$$table.position().left;
	} else {
		return this.$$table.offset().left;
	}
};

// Ensure that the table is positioned correctly on the screen
// Smartphones: it should be the full width of the screen and left-aligned
ColumnsTable.prototype.position = function() {
	var properties = {
		'width': this.shouldForceMobile() ? this.$$container.outerWidth() : this.$$container.width()
	}

	// Only move the table if it's not aligned with the left side of the screen
	var offset = this.getOffsetLeft();
	if (offset != 0) {
		properties['margin-left'] = -offset 
	}

	// Make the table the width of the window
	// and left align it with the window 
	this.$$table.css(properties);
};

// Download the appropriate data from the api
ColumnsTable.prototype.fetchData = function() {
	var _this = this;

	// First turn on loading
	this.setLoading(true);
	$$.get(Config.api_host + '/columns/table/' + this.id + '?page=0', function(data) {
		if (data.status == 'success') {
			_this.generateLayout($$.parseJSON(data.data.layout));
			_this.renderData(data.data);
			_this.setError(false);

			// Track the table population
			this.send({
				category: 'table',
				action: 'populate'
			});

		} else {
			_this.setLoading(false);
			_this.setError(true);
		}
	}.bind( this ));

	// var _this = this;
	// setTimeout(function() {
	// 	_this.generateLayout(DUMMY_DATA.layout);
	// 	_this.renderData(DUMMY_DATA);
	// }, 100);
};

ColumnsTable.prototype.templateName = function() {
	// return 'row_layout_' + Columns.scripts.indexOf(this.script); 
	return 'row_layout';
};

ColumnsTable.prototype.generateLayout = function(layout, reload) {
	// Set up the row layout as a handlebars partial
	// dynamically based on the row layout object
	this.layout = layout;
	// var row_layout = Columns.EmbeddableTemplates['Columns.Embeddabletemplates/embed-table/row-layout.hbs']({layout: layout});
	// var row_template = Handlebars.compile(row_layout);
	// var templateName = this.templateName();
	// // Handlebars.registerPartial('row_layout', row_template);

	// if ( !Columns['row-templates'] ) Columns['row-templates'] = [];
	// Columns['row-templates'][ Columns.scripts.indexOf( this.script ) ] = row_template;

	if (reload) {
		this.renderData();
	}
};

ColumnsTable.prototype.formatSourceUrl = function( url ) {
	var parsedUrl = ParseUri( url );

	// Check whether the url has a valid protocol
	if ( !parsedUrl.protocol ) {
		return 'http://' + url;
	} else {
		return url;
	}
};

ColumnsTable.prototype.renderData = function(data) {
	var _this = this;

	// If no data was passed in, re-render with the old data
	if (!data) {
		if (!this.data) {
			return;
		} else {
			data = this.data;
		}
	} else {
		this.data = data;
	}

	console.log( this.data );

	// var numRows = data.data.length;

	// Generate table layouts with data
	var header = Columns.EmbeddableTemplates['views/embed-table/header.hbs'];
	var rowsTemplate = Columns.EmbeddableTemplates['views/embed-table/rows.hbs'];
	var footer = Columns.EmbeddableTemplates['views/embed-table/footer.hbs'];

	// Render table components with data
	var $$tableBody = this.$$table.find(TABLE_BODY_SELECTOR);
	var $$header = this.$$table.find(TABLE_HEADER_SELECTOR);
	var $$footer = this.$$table.find(TABLE_FOOTER_SELECTOR);
	var $$rows = this.$$table.find(TABLE_ROW_SELECTOR);

	if ($$header.length > 0) {
		this.updateComponent($$header, {
			title: data.title,
			sort_by_column: data.sort_by_column
		}, header);
	} else {
		$$tableBody.before(header({
			title: data.title,
			sort_by_column: data.sort_by_column
		}));
	}

	if ($$footer.length > 0) {
		this.updateComponent($$footer, {
			source: data.source,
			source_url: this.formatSourceUrl( data.source_url ),
			item_count: data.num_rows || data.data.length,
			home_path: Config.home_path
		}, footer);
	} else {
		$$tableBody.after(footer({
			source: data.source,
			source_url: this.formatSourceUrl( data.source_url ),
			item_count: data.num_rows || data.data.length,
			home_path: Config.home_path
		}));
	}

	var shouldRunRowIntroAnimation = false;
	if ($$rows.length == 0 && !this.preview ) {
		shouldRunRowIntroAnimation = true;
	}

	// For now, only render the first 20 rows
	$$rows.remove();
	// $$tableBody.prepend(rowsTemplate({
	// 	row_layout: Columns.scripts.indexOf( this.script ),
	// 	rows: data.data.slice(0, 20)
	// }));
	
	// data.data.slice( 0, 20 ).forEach(function( rowData, i) {
	// 	$$tableBody.append( this.renderRow( rowData, i, this.layout ) );
	// }.bind( this ));

	data.data.forEach(function( rowData, i) {
		$$tableBody.append( this.renderRow( rowData, i, this.layout ) );
	}.bind( this ));

	// If we're in preview and the table is expanded,
	// refresh the amount of padding we add to the top
	// to account for the template
	if (this.preview && this.$$table.hasClass(EXPANDED_CLASS)) {
		$$tableBody.css({
			paddingTop: this.tallestRowHeight()
		});
	}

	// Reset rows to equal the new rows we just added
	// And move down to the correct position
	$$rows = this.$$table.find(TABLE_ROW_SELECTOR);
	$$rows.css({
		height: this.tallestRowHeight()
	});

	// Set any dynamic sizing or positioning values
	// and animate the various components in
	var introSequence = [];
	var tableHeight = this.backgroundHeight();
	var duration = 0;
	if (shouldRunRowIntroAnimation) {
		duration = ANIMATION_DURATION;
		var delay = ANIMATION_DURATION / 3;
		Velocity($$tableBody.get(0), {
		// $$tableBody.velocity({
			height: tableHeight
		}, {
			duration: duration
		});
		$$.each($$rows, function(index, row) {

			// Only animate the two drooping rows
			if (index >= 0 && index <= 2) {
				var $$row = $$(row);
				Velocity($$row.get(0), {
				// $$row.velocity({
					translateY: 5
				}, {duration: ANIMATION_DURATION / 6,
					delay: delay * index
				});
				Velocity($$row.get(0), {
				// $$row.velocity({
					translateY: 0
				}, {
					duration: ANIMATION_DURATION / 6
				});
			}
		});
	} else {
		Velocity($$tableBody.get(0), {
		// $$tableBody.velocity({
			height: tableHeight
		}, {
			duration: duration
		});
	}

	// Set up DOM events on the table
	this.setupEvents();

	// Announce that the table has rendered data
	if ( this.preview || this.sample ) {
		// $(document).trigger('ColumnsTableDidRenderData', {table: this});
		ColumnsEvent.send('ColumnsTableDidRenderData', {table: this});
	}

	// Remove the loading class after the screen repaints
	setTimeout(function() {
		_this.setLoading(false);
	}, 100);
};

ColumnsTable.prototype.renderRow = function( data, index, layout ) {
	var $$rowLayout = $$( Columns.EmbeddableTemplates['views/embed-table/row-layout.hbs']({
		index: index
	}) );

	// Make sure the row is properly z-indexed
	// Lower rows should be z-indexed below higher rows
	$$rowLayout.css( { "z-index": -index } );

	// Activate row tap events
	var detailMc = new Hammer( $$rowLayout.get( 0 ) );
	detailMc.on('tap', this._onRowTap.bind( this ) );

	return $$rowLayout.append( this.renderRowComponent( data, layout ) );
};

ColumnsTable.prototype.renderRowComponent = function( data, component ) {
	var $$component,
		groupTemplate = Columns.EmbeddableTemplates['views/embed-table/row-group.hbs'],
		valueTemplate = Columns.EmbeddableTemplates['views/embed-table/row-value.hbs'];

	// Render the top level component
	// as a group if it's a group
	// or a value if it's a value
	if ( component.type === 'group' ) {
		$$component = $$( groupTemplate({
			style: component.style,
			layout: component.layout
		}));

		component.values.forEach(function( value, i) {
			$$component.append( this.renderRowComponent( data, value ) );
		}.bind( this ));

		return $$component;
	} else if ( component.type === 'single' ) {
		$$component = $$( valueTemplate({
			data: data[ component.data ],
			style: component.style
		}));

		return $$component;
	}

};

ColumnsTable.prototype.tallestRowHeight = function() {
	return Math.max.apply(null, this.$$table.find(TABLE_ROW_SELECTOR).map(function () {
		return $$(this).outerHeight();
	}).get());
};

ColumnsTable.prototype.backgroundHeight = function() {
	var numRows = this.$$table.find(TABLE_ROW_SELECTOR).length;
	// var offsetHeight = numRows > 3 ? ROW_OFFSET * 2 : ROW_OFFSET * (numRows - 1);
	// return offsetHeight + this.tallestRowHeight();

	return numRows > 1 ? this.tallestRowHeight() * 2 : this.tallestRowHeight() * (numRows);
};

ColumnsTable.prototype.headerHeight = function() {
	return this.$$table.find( TABLE_HEADER_SELECTOR ).outerHeight();
}

ColumnsTable.prototype.footerHeight = function() {
	return this.$$table.find( TABLE_FOOTER_SELECTOR ).outerHeight();
}

ColumnsTable.prototype.updateComponent = function($$component, data, template) {
	// If there is alread a component, just update it with the new data
	var oldStyle = $$component.attr('style');
	var oldClasses = $$component.attr('class');
	var $$template = $(template(data)).attr('style', oldStyle).attr('class', oldClasses);
	$$component.replaceWith($$template);
};

ColumnsTable.prototype.setupEvents = function() {
	var _this = this;

	var tableMc = new Hammer(this.$$table.find(".columns-table").get(0));
	tableMc.on('tap', function(e) {
		var $$table = $$(this);
		if (!_this.$$table.hasClass(EXPANDED_CLASS) && !$$table.hasClass(ANIMATING_CLASS)) {
			_this.expand();

			// Track this tap
			if ( _this.preview ) {
				ColumnsAnalytics.send({
					category: 'table',
					action: 'expand',
					label: 'body'
				});
			} else {
				this.send({
					category: 'table',
					action: 'expand',
					label: 'body'
				});
			}
		}
	}.bind( this ));

	var expandMc = new Hammer(this.$$table.find(".columns-table-expand-button").get(0));
	expandMc.on('tap', function(e) {
		var $$table = $$(this);
		if (!_this.$$table.hasClass(EXPANDED_CLASS) && !$$table.hasClass(ANIMATING_CLASS)) {
			_this.expand();

			// Track this tap
			if ( _this.preview ) {
				ColumnsAnalytics.send({
					category: 'table',
					action: 'expand',
					label: 'expand button'
				});
			} else {
				this.send({
					category: 'table',
					action: 'expand',
					label: 'expand button'
				});
			}
		}
	}.bind( this ));

	var errorMc = new Hammer(this.$$table.find(".columns-table-error").get(0));
	errorMc.on('tap', function(e) {
		var $$table = $$(this);
		if (_this.$$table.hasClass(ERROR_CLASS)) {
			_this.fetchData();

			// Track this tap
			if ( _this.preview ) {
				ColumnsAnalytics.send({
					category: 'table',
					action: 'retry',
					label: 'error message'
				});
			} else {
				this.send({
					category: 'table',
					action: 'retry',
					label: 'error message'
				});
			}
		}
	}.bind( this ));

	var closeMc = new Hammer(this.$$table.find(".columns-table-close-button").get(0));
	closeMc.on('tap', function(e) {
		var $$table = _this.$$table.find('.columns-table');
		if (_this.$$table.hasClass(EXPANDED_CLASS) && !$$table.hasClass(ANIMATING_CLASS)) {
			_this.collapse();

			// Track this tap
			if ( _this.preview ) {
				ColumnsAnalytics.send({
					category: 'table',
					action: 'collapse',
					label: 'close button'
				});
			} else {
				this.send({
					category: 'table',
					action: 'collapse',
					label: 'close button'
				});
			}

			// Prevent the dom from doing any other conflicting stuff
			// e.stopPropagation();
			// e.preventDefault();
		}
	}.bind( this ));

	// Respond to taps on individual rows
	// var detailMc = new Hammer( this.$$table.find('.columns-table-row').get( 0 ) );
	// detailMc.on('tap', this._onRowTap.bind( this ) );

	// this.$$table.find('.columns-table-row').on('touchend', this._onRowTap.bind( this ));

	// Notify the preview template when the table scrolls
	if ( this.preview || this.sample ) {
		this.$$table.find('.columns-table-container').on('scroll', function(e) {
			// $(document).trigger('ColumnsTableDidScroll', {table: _this, originalEvent: e});
			ColumnsEvent.send('ColumnsTableDidScroll', {table: _this, originalEvent: e});
		})
	}

	// Listen to scroll events on the table
	// this.$$table.find('.columns-table-container').on('scroll', function(e) {

		// Have we scrolled to the bottom and met all other conditions for rendering more rows?

		// Check whether we already have the data to render more rows

		// If not, download more rows first
		
	// });

	// Track taps on source link
	$$( TABLE_FOOTER_SELECTOR ).find('.columns-table-source a').on('click', function() {
		this.send({
			category: 'link',
			action: 'click',
			label: 'source'
		});
	}.bind( this ));

	// Track taps on columns project link
	$$( TABLE_FOOTER_SELECTOR ).find('.columns-table-footer-credit a').on('click', function() {
		this.send({
			category: 'link',
			action: 'click',
			label: 'columns project'
		});
	}.bind( this ));
};

ColumnsTable.prototype._onRowTap = function( event ) {
	var index,
		data,
		$$row = $$( event.target ).hasClass( TABLE_ROW_SELECTOR ) ?
				$$( event.target ) :
				$$( event.target ).parents( TABLE_ROW_SELECTOR );

	// Deselect any selected rows
	// and select this one
	$$( TABLE_ROW_SELECTOR ).removeClass( SELECTED_ROW_CLASS );
	$$row.addClass( SELECTED_ROW_CLASS );

	// Figure out which row index was tapped
	index = $$row.data('index');	

	// Get the data corresponding to that row
	data = this.data.data[ index ];

	// Create or update a detail view with that data
	if ( this.detailView ) {
		this.detailView.update( data );
	} else {
		this.detailView = new ColumnsTableDetailView( data );

		// Append the detail view to the table
		this.$$table.append( this.detailView.render() );
	}

	// Make sure it's the top-most view in the table
	this.detailView.$$detailView.css({
		"z-index": (highestZIndex('*') + 1),
		"height": $$(window).height()
	});

	// Show the detail view
	this.detailView.open();
};

ColumnsTable.prototype._onDetailViewClose = function( event ) {

	// Deselect any selected rows after a delay for the close animation
	setTimeout(function() {
		$$( TABLE_ROW_SELECTOR ).removeClass( SELECTED_ROW_CLASS );	
	}, ANIMATION_DURATION );
};

ColumnsTable.prototype.setLoading = function(loading) {
	if (loading) {
		this.$$table.addClass(LOADING_CLASS);
	} else {
		this.$$table.removeClass(LOADING_CLASS);
	}
};

ColumnsTable.prototype.setError = function(error) {
	if (error) {
		this.$$table.addClass(ERROR_CLASS);
	} else {
		this.$$table.removeClass(ERROR_CLASS);
	}
}

// Methods to expand a table
// from to its original position
// to full-screen
// ------------------------------

ColumnsTable.prototype.expand = function() {
	
	var _this = this;

	if ( this.preview || this.sample ) {
		ColumnsEvent.send('ColumnsTableWillExpand', {table: this});
	}

	this.originalSizes = {
		footer: {
			height: this.footerHeight()
		},
		header: {
			height: this.headerHeight()
		}
	};

	var $$table = this.$$table;
	$$bg = $$table.find('.columns-table-container'),
	$$body = $$table.find(TABLE_BODY_SELECTOR);
	$$rows = $$table.find('.columns-table-row'),
	$$header = $$table.find('.columns-table-header');
	$$footer = $$table.find('.columns-table-footer');

	// First move the table to the outermost part of the DOM
	// while maintaining its visual position
	// add a placeholder
	// and make sure we're the highest z-index in the land
	var offsetTop;
	if ( this.shouldForceMobile() ) {
		offsetTop = this.getOffsetTop() + this.$$container.scrollTop();
	} else {
		// offsetTop = parseInt($$.Velocity.hook($$table, "translateY"));
		if ( this.isLargeFormFactor() ) {
			offsetTop = 0;
		} else {
			offsetTop = this.getOffsetTop();
		}
	}
	var offsets = {
		top: offsetTop,
		'margin-left': 0,
		position: 'absolute',
		'z-index': (highestZIndex('*') + 1)
	};

	// Replace the table with a same-height placeholder
	var placeholder = document.createElement('div');
	placeholder.className = PLACEHOLDER_CLASS;
	placeholder.style.height = $$table.outerHeight( true ) + 'px';
	placeholder.style.width = $$table.outerWidth() + 'px';
	$$( this.script ).before(placeholder);
	
	if ( this.isLargeFormFactor() ) {

		$$bg.css({ "height": this.$$panel.find( TABLE_PANEL_SELECTOR ).height() });
		Velocity( $$('html'), {
			width: "-=" + this.$$panel.find( TABLE_PANEL_SELECTOR ).width() + "px"
		}, {
			duration: ANIMATION_DURATION
		});

	} else {
		
		if ( this.shouldForceMobile() ) {
			$$table.appendTo( this.$$container );
			this.$$container.addClass( EXPANDED_CLASS );
		} else {
			$$table.appendTo('body');
		}

		$$table.addClass(RELOCATED_CLASS);
		$$table.css(offsets);

		this.expandBackground($$bg, $$rows, $$header, $$footer);
		// this.expandRows($$rows);
		this.expandBody($$body);
	}

	this.expandHeader($$header);

	$$('body').addClass( EXPANDING_CLASS );
	$$table.addClass(EXPANDING_CLASS);

	// Initiate with a meaningless property
	// because we can't pass Velocity an empty properties object
	var props = {};

	if ( this.isLargeFormFactor() ) {
		props["width"] = this.$$panel.find( TABLE_PANEL_SELECTOR ).width();
	}

	if ( this.shouldForceMobile() ) {
		props["translateY"] = -this.getOffsetTop();
	}

	var onExpanded = function() {
		$$table.addClass(EXPANDED_CLASS);
		$$table.removeClass(EXPANDING_CLASS);

		// On large for factor,
		// move the table into the container only after the animation
		if ( this.isLargeFormFactor() ) {
			$$table.css(offsets);
			$$table.appendTo( this.$$panel.find( TABLE_PANEL_SELECTOR ) );
			$$table.addClass(RELOCATED_CLASS);
		}

		setTimeout(function() {
			$$('body').removeClass( EXPANDING_CLASS );
			$$('body').addClass( EXPANDED_CLASS );
		}.bind( this ), 0);

		if ( this.preview || this.sample ) {
			ColumnsEvent.send('ColumnsTableDidExpand', {table: _this});
		}

	}.bind( this );

	if ( Object.keys(props).length ) {
		Velocity( $$table.get(0), props, { 
			duration: ANIMATION_DURATION,
			complete: onExpanded
		});
	} else {
		setTimeout( onExpanded, ANIMATION_DURATION );
	}

	this.position();
};

ColumnsTable.prototype.expandHeader = function($$header) {

	// Move header out of the table body
	// so that it locks atop the screen
	setTimeout(function() {
		this.$$table.prepend( $$header );
	}.bind( this ), ANIMATION_DURATION * 2 );
};

ColumnsTable.prototype.expandBackground = function($$bg, $$rows, $$header, $$footer) {
	var bgOffsetTop,
		bgOffsetLeft,
		bgHeight;

	if ( this.isLargeFormFactor() ) {

		this.originalBackground['positionY'] = $$bg.position().top;
		bgOffsetTop = 0;
		// bgOffsetLeft = $$(window).width() - this.$$panel.find( TABLE_PANEL_SELECTOR ).width();
		bgHeight = this.$$panel.find( TABLE_PANEL_SELECTOR ).height();

	} else if ( this.shouldForceMobile() ) {

		this.originalBackground['positionY'] = $$bg.position().top;
		bgOffsetTop = 0;
		bgHeight = this.$$container.get(0).innerHeight || this.$$container.outerHeight();

	} else {
		
		this.originalBackground['positionY'] = $$bg.offset().top;
		bgOffsetTop = -$$bg.offset().top + this.$$container.scrollTop();
		// bgOffsetLeft = 0;

		// The background should be the height of the container
		// Use javascript height method because of a bug with jQuery and the iOS safari toolbar
		bgHeight = this.$$container.get(0).innerHeight || this.$$container.outerHeight();
	}

	Velocity($$bg.get(0), {
		height: bgHeight, 			/* Fill the entire screen */
		translateY: bgOffsetTop, 	/* Move to the top of the screen */
		// translateX: bgOffsetLeft 	/* Move to the right if large form factor */
	},{
		duration: ANIMATION_DURATION,
	});
};

ColumnsTable.prototype.expandBody = function($$body) {

	var _this = this;
	// Calculate the new table size and position
	var tableOffsetTop = 12;

	// Move the table down a few extra pixels to account for the template if we're in preview mode
	var paddingTop = 0;
	if (this.preview) {
		paddingTop = this.tallestRowHeight();
	}
	// var tableHeight = rowHeight * $$rows.length - 40;

	Velocity($$body.get(0), {
	// $$body.velocity({
		// height: tableHeight, /* Grow to encompass all of the rows */
		translateY: tableOffsetTop + paddingTop, /* Move down a few pixels to account for the header */
		height: this.$$table.find('.columns-table-row').length * this.tallestRowHeight(), /* Grow to the height of all of the rows */
		'padding-top': paddingTop /* Move down a few more pixels to account for the template row in preview mode */
	}, {
		duration: ANIMATION_DURATION,
	});
}

ColumnsTable.prototype.expandRows = function($$rows) {

	var _this = this;

	// Calculate the new position for each row
	var duration = ANIMATION_DURATION/* - ( ($$rows.length - 1) * ROW_DELAY )*/;
	$$rows.each(function(index, row) {
		var $$row = $$(row);

		// Save original row data
		_this.originalRows[index] = {
			positionY: $$row.offset().top
		}

		// Animate the rows
		_this.expandRowAtIndex($$row, index, duration);
	});
}

ColumnsTable.prototype.expandRowAtIndex = function($$row, index, duration) {
	
	// If we're past the 10th row, just change the opacity
	// since the user can't see it anyway
	if ( index >= 10 ) {
		
	} else {
		var rowHeight = $$row.outerHeight();
		var offsetY = (index * rowHeight)/* - this.headerHeight()*/;
		// switch (index) {
		// 	case 0:
		// 	break;
		// 	case 1:
		// 	offsetY -= ROW_OFFSET;
		// 	break;
		// 	case 2:
		// 	offsetY -= ROW_OFFSET * 2;
		// 	break;
		// 	default:
		// 	offsetY -= ROW_OFFSET * 2;
		// }

		Velocity($$row.get(0), {
			translateY: offsetY /* Move each row down into its natural position */
		}, {
			duration: duration,
			delay: ROW_DELAY,
		});
	}
}

// Define table animation sequences
// var expandTableSequence = [
// 	{
// 		// Background
// 		elements: $$parent.find('.columns-table-container'),
// 		properties: {
// 			height: bgHeight, 			/* Fill the entire screen */
// 			translateY: bgOffsetTop 	/* Move to the top of the screen */
// 		}
// 	}
// ]

// Methods to collapse a table
// back to its original position
// ------------------------------

ColumnsTable.prototype.collapse = function() {
	var _this = this;
	var $$table = this.$$table;
	$$body = $$table.find(TABLE_BODY_SELECTOR);
	$$bg = $$table.find('.columns-table-container'),
	$$rows = $$table.find('.columns-table-row'),
	$$header = $$table.find('.columns-table-header');

	if ( this.preview || this.sample ) {
		ColumnsEvent.send('ColumnsTableWillCollapse', {table: this});
	}

	// Deselect any selected rows
	$$( TABLE_ROW_SELECTOR ).removeClass( SELECTED_ROW_CLASS );

	if ( !this.isLargeFormFactor() ) {
		this.collapseBackground($$bg);
		this.collapseBody($$body);
		this.collapseRows($$rows);
	} else {
		$$bg.css({ "height": this.backgroundHeight() + 60 + this.originalSizes.header.height + this.originalSizes.footer.height });
		Velocity( $$('html'), {
			width: "+=" + this.$$panel.find( TABLE_PANEL_SELECTOR ).width() + "px"
		}, {
			duration: ANIMATION_DURATION
		});
	}

	this.collapseHeader($$header);

	var onCollapsed = function() {
		$$table.insertBefore( $$( this.script ) );
		this.$$container.removeClass( EXPANDED_CLASS );
		$$table.removeClass(EXPANDED_CLASS);
		$$table.removeClass(RELOCATED_CLASS);
		$$table.removeClass(COLLAPSING_CLASS);
		// Move the table back to its original DOM position
		$$table.css({
			top: 0,
			position: 'relative',
			'z-index': 0
		});
		$$( this.script ).siblings('.' + PLACEHOLDER_CLASS).remove();

		setTimeout(function() {
			$$('body').removeClass( COLLAPSING_CLASS );	
		}.bind( this ), 0);

		if ( this.preview || this.sample ) {
			// $(document).trigger('ColumnsTableDidCollapse', {table: _this});
			ColumnsEvent.send('ColumnsTableDidCollapse', {table: _this});
		}

		this.position();
	}.bind( this );

	$$table.addClass(COLLAPSING_CLASS);
	$$table.removeClass(EXPANDED_CLASS);
	$$('body').addClass( COLLAPSING_CLASS );
	$$('body').removeClass( EXPANDED_CLASS );

	// var props = {};
	if ( this.shouldForceMobile() ) {
		// props["translateY"] = 0;
		Velocity($$table.get(0), {
			translateY: 0
		}, {
			duration: ANIMATION_DURATION,
			complete: onCollapsed
		});
	} else {
		setTimeout( onCollapsed, ANIMATION_DURATION );
		// props["opacity"] = 1;
	}
}

ColumnsTable.prototype.collapseHeader = function($$header) {

	// Remove header from view
	// Velocity($$header.get(0), {
	// // $$header.velocity({
	// 	opacity: 0 /* Fade the header out of view */
	// }, {
	// 	duration: ANIMATION_DURATION * 0.2,
	// 	complete: function(elements) {
	// 		$$header.removeClass(EXPANDED_CLASS);
	// 	}
	// });

	// Move header back into the table body
	// so that it sits nicely atop the table
	// setTimeout(function() {
		this.$$table.find( TABLE_BODY_SELECTOR ).before( $$header );
	// }.bind( this ), ANIMATION_DURATION );
}

ColumnsTable.prototype.collapseBackground = function($$bg) {

	var _this = this;

	// Calculate new background position
	Velocity($$bg.get(0), {
	// $$bg.velocity({

		// Return to small state
		// height: _this.originalBackground.height,
		height: _this.backgroundHeight() + 60 + _this.originalSizes.header.height + _this.originalSizes.footer.height,
		// height: 'auto',

		// Move back to original position
		translateY: 0

	},{
		duration: ANIMATION_DURATION,
		begin: function(elements) {
			$$bg.addClass(COLLAPSING_CLASS);
			// $$bg.removeClass('translateY-reset');
			$$bg.removeClass(EXPANDED_CLASS);
		},
		complete: function(elements) {
			$$bg.removeClass(COLLAPSING_CLASS);
			// $$bg.addClass('translateY-reset');
		}
	});
}

ColumnsTable.prototype.collapseBody = function($$body) {

	var _this = this;
	// Calculate the old table size and position
	Velocity($$body.get(0), {
	// $$body.velocity({

		// Move to top of container
		translateY: 0,
		// Remove any padding we added for the template row in preview mode
		'padding-top': 0,
		// Adjust height in case any rows have changed
		height: _this.backgroundHeight()

	}, {
		duration: ANIMATION_DURATION,
		begin: function(elements) {
			// $$body.removeClass('translateY-reset');
			// $$body.removeClass(EXPANDED_CLASS);
			// _this.$$table.removeClass(EXPANDED_CLASS);
			// _this.$$table.addClass(EXPANDING_CLASS);
		},
		complete: function(elements) {
			// $$table.removeClass(EXPANDED_CLASS);
			// $$body.addClass('translateY-reset');
			// $$body.css( { "margin-top": "0px" } );
			// _this.$$table.removeClass(RELOCATED_CLASS);
			// _this.$$table.removeClass(EXPANDING_CLASS);
			// _this.$$table.css({
			// 	top: 0,
			// 	position: 'relative',
			// 	'z-index': 0
			// });
		}
	});
}

ColumnsTable.prototype.collapseRows = function($$rows) {

	var _this = this;
	var duration = ANIMATION_DURATION/* - ( ($$rows.length - 1) * ROW_DELAY )*/;
	$$rows.each(function(index, row) {
		_this.collapseRowAtIndex($$(row), index, duration);
	});
}

ColumnsTable.prototype.collapseRowAtIndex = function($$row, index, duration) {

	// If we're past the 10th row, just hide the card rather than moving it
	if ( index >= 10 ) {
		// Velocity( $$row.get( 0 ), {
		// 	opacity: 0
		// }, {
		// 	duration: duration,
		// 	begin: function( elements ) {
				$$row.removeClass( EXPANDED_CLASS );
		// 	}
		// })
	} else {
		Velocity($$row.get(0), {

			// Move each row to its collapsed position
			translateY: 0
		}, {
			duration: duration,
			delay: ROW_DELAY,
			begin: function(elements) {
				$$row.removeClass(EXPANDED_CLASS);
			}
		});
	}

}

ColumnsTable.prototype._setupEventListeners = function() {

	if ( this.preview ) {
		ColumnsEvent.on( 'Columns.Table.DidUploadWithSuccess', this._onTableDidUpload.bind( this ) );
		ColumnsEvent.on( 'Columns.Table.DidOpenWithSuccess', this._onTableDidUpload.bind( this ) );
		// ColumnsEvent.on( 'Columns.Layout.DidChange', table._onLayoutDidChange.bind( table ) );
		// ColumnsEvent.on( 'Columns.EmbedDetailsView.DidUpdatePropertyWithValue', table._onDetailsDidChange.bind( table ) );
		ColumnsEvent.on( 'Columns.Table.DidChange', this._onTableDidChange.bind( this ) );
	}

	ColumnsTableEvent.on('ColumnsTableDetailViewDidClose', this._onDetailViewClose.bind( this ));
};

ColumnsTable.prototype._onTableDidUpload = function( event, data ) {
	var table = data.table;

	console.log( data );

	// Generate a layout
	this.generateLayout( table.layout.model, false );

	// Render Data
	this.renderData( table );

	// Expand yourself
	this.expand();
};

// ColumnsTable.prototype._onTableDidChange = function( event, data ) {

// 	// Generate a new layout and reload
// 	this.generateLayout( data.layout.model, true );

// };

ColumnsTable.prototype._onTableDidChange = function( event, data ) {
	var table = data.table;

	// Generate a layout
	this.generateLayout( table.layout.model, false );

	// Render Data
	this.renderData( table );

};

ColumnsTable.prototype.send = function( props ) {
	var props = props || {},
		mixpanelObj = {};

	// Don't send events if this is a preview
	// or a sample table
	if ( this.preview || this.sample ) {
		return;
	}

	// Make sure the properties are santized
	props.action = props.action || '';
	props.category = props.category || '';
	props.label = props.label || '';
	props.description = props.description || props.category + ' ' + props.action + ' ' + props.label;
	props.description = props.description == '  ' ? '' : props.description;
	props.table_id = this.id;
	mixpanelObj['Table ID'] = props.table_id;

	// Send a Google Analytics event
	if ( window.gaColumnz ) {
		gaColumnz( 'send', 'event', props.category, props.action, props.label, props.table_id );
	}

	// Send a mixpanel event
	if ( window.mixpanel && window.mixpanel.the_columns_project ) {
		window.mixpanel.the_columns_project.track( props.description, mixpanelObj );
	}

};

module.exports = ColumnsTable;