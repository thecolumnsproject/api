var pluralize = require('pluralize');

var Table = module.exports;

Table.formatType = function(name) {
	return this.connection.escape(name).toLowerCase().replace(/ /g, '_').replace(/'/g, '');
}

Table.formatColumnHeader = function(name) {
	return "__" + this.connection.escape(name).toLowerCase().replace(/ /g, '_').replace(/'/g, '');
}

Table.unformatColumnHeader = function(name) {
	return name.replace('__', '');
}

Table.formatColumn = function(name) {
	return name.toLowerCase().replace(/ /g, '_').replace(/'/g, '');
}

Table.cleanEntity = function(name) {
	return name.replace(/'/g, '').replace(/,/g, ' -');
}

Table.pluralizeTerms = function(terms) {
	var pluralTerms = [];
	for(index in terms) {
		pluralTerms.push(pluralize.plural(terms[index]));
		pluralTerms.push(pluralize.singular(terms[index]));
	}
	return pluralTerms;
}

Table.sanitizeMetaData = function(meta) {
	var cleanMeta = {};

	// Remove any 'null' strings
	cleanMeta['title'] = meta.title == 'null' ? '' : meta.title;
	cleanMeta['source'] = meta.source == 'null' ? '' : meta.source;
	cleanMeta['source_url'] = meta.source_url == 'null' ? '' : meta.source_url;

	// Convert columns to an array
	cleanMeta['columns'] = meta.columns.split(",");

	cleanMeta['layout'] = meta.layout;

	return cleanMeta;
}