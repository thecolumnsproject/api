var pluralize = require('pluralize');

var Table = module.exports;

Table.formatColumnHeader = function(name) {
	return this.connection.escape(name).toLowerCase().replace(/ /g, '_');
}

Table.pluralizeTerms = function(terms) {
	var pluralTerms = [];
	for(index in terms) {
		pluralTerms.push(pluralize.plural(terms[index]));
		pluralTerms.push(pluralize.singular(terms[index]));
	}
	return pluralTerms;
}