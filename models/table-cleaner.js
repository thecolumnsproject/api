// var Table 		= require('./tables/table.js');
var mysql 	   	= require('mysql');
var Transform	= require('stream').Transform;
var Baby		= require('babyparse');
var util 		= require('util');
util.inherits(Cleaner, Transform);

// console.log(Table);
// var table = new Table();
// var cleaner = new Transform({objectMode: true});

function Cleaner(options) {
	if (!(this instanceof Cleaner))
    	return new Cleaner(options);

	Transform.call(this, options);
} 

Cleaner.prototype._transform = function(chunk, encoding, callback) {
	var _cleaner = this;
	// Turn the chunk into a string
	var chunkString = chunk.toString();
	// If there's a partial line hanging around from the last chunk, prepend this chunk to it
	if (this._lastLineData) chunkString = this._lastLineData + chunkString;
	// Split the new string into lines, in case there's a new partial line
	var lines = this.splitLines( chunkString );
	// Remember the last line so we can use it next time around, in case it's a partial
	this._lastLineData = lines.splice(lines.length-1,1)[0];
	// Clean each line
	var cleanLines = lines.map(function(line) {
		return _cleaner.cleanLine(line);
	});
	// Turn the lines array back into strings terminated by a newline charachter
	var escapedString = cleanLines.join('\n');
	// Pipe the escaped values back out
	this.push(escapedString);
 	callback();
}

Cleaner.prototype._flush = function(callback) {
	if (this._lastLineData) this.push('\n' + this.cleanLine(this._lastLineData));
	this._lastLineData = null;
	callback();
}

Cleaner.prototype.splitLines = function( lines ) {
	return lines.split( /\r\n|\n|\r/ );
}

Cleaner.prototype.cleanLine = function(line) {
	// Break out individual data values
	var values = Baby.parse(line);
	// Escape each value
	var cleanValues = values.data[0].map(function(value) {
		var cleanValue;

		// Remove any training periods or whitespace
		cleanValue = value.replace(/^[.\s]+|[.\s]+$/g, "");

		// Escape the string and remove any quotes around it
		// TODO use the node-mysql escape function directly
		cleanValue = mysql.escape( cleanValue );

		return cleanValue;
	});
	// Turn the escaped values back into a string
	return cleanValues.join();
}

module.exports = Cleaner;