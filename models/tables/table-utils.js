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