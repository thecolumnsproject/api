var common 	   			= require('../common');
var config 	   			= common.config();

function ShareMessage( data ) {
	this.data = data || {};
}

ShareMessage.prototype.twitterMessage = function() {
	var message = 'Spreading some knowledge';

	// Add the title if one exists
	if ( this.data.title && this.data.title !== '' ) {
		message += ' on ' + this.data.title;
	}

	// Add the source if one exists
	if ( this.data.source && this.data.source !== '' ) {
		message += ' via ' + this.data.source;
	}

	return message;

};

ShareMessage.prototype.emailMessage = function() {
	return {
		subject: this.twitterMessage(),
		body: this.emailBody()
	}
};

ShareMessage.prototype.emailBody = function() {
	var message = 'Nothing like a good data set to get the Internets going :-)%0A%0A';

	// Add the title if one exists
	if ( this.data.title && this.data.title !== '' ) {
		message += this.data.title;

		// Put the proper character after the title
		if ( this.data.source && this.data.source !== '' ) {
			message += ' ';
		} else {
			message += '%0A';
		}
	}

	// Add the source if one exists
	if ( this.data.source && this.data.source !== '' ) {
		message += 'via ' + this.data.source + '%0A';
	}

	// Add the url
	message += config.embed.host + '/' + this.data.id + '%0A%0A';

	// Add the ending
	return message += '--%0ASent from The Columns Project%0AUpload your own data at ' + config.app.host;

};

module.exports = ShareMessage;