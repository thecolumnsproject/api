var common 	   			= require('../../common');
var config 	   			= common.config();
var ShareMessage 		= require('../../models/share-message.js');

describe('Share Message', function() {
	var shareMessage;

	beforeEach(function() {
		shareMessage = new ShareMessage()	
	});

	describe('Twitter Message', function() {
		
		it('should do the right thing when there is no title and no source', function() {
			shareMessage.data = {
				title: '',
				source: ''
			};
			expect( shareMessage.twitterMessage() ).toBe('Spreading some knowledge');
		});

		it('should do the right thing when there is a title but no source', function() {
			shareMessage.data = {
				title: 'Billion Dollar Startups',
				source: ''
			};
			expect( shareMessage.twitterMessage() ).toBe('Spreading some knowledge on Billion Dollar Startups');
		});

		it('should do the right there when there is a source but no title', function() {
			shareMessage.data = {
				title: '',
				source: 'Wall Street Journal'
			};
			expect( shareMessage.twitterMessage() ).toBe('Spreading some knowledge via Wall Street Journal');
		});

		it('should do the right thing when there is a source and a title', function() {
			shareMessage.data = {
				title: 'Billion Dollar Startups',
				source: 'Wall Street Journal'
			};
			expect( shareMessage.twitterMessage() ).toBe('Spreading some knowledge on Billion Dollar Startups via Wall Street Journal');
		});
	});

	describe('Email Message', function() {

		describe('Email Body', function() {

			it('should do the right thing when there is not title and no source', function() {
				shareMessage.data = {
					title: '',
					source: '',
					id: 23
				};
				expect( shareMessage.emailBody() ).toBe('Nothing like a good data set to get the Internets going :-)%0A%0A' + config.embed.host + '/' + '23%0A%0A--%0ASent from The Columns Project%0AUpload your own data at ' + config.app.host);
			});

			it('should do the right thing when there is a title but no source', function() {
				shareMessage.data = {
					title: 'Billion Dollar Startups',
					source: '',
					id: 23
				};
				expect( shareMessage.emailBody() ).toBe('Nothing like a good data set to get the Internets going :-)%0A%0ABillion Dollar Startups%0A' + config.embed.host + '/' + '23%0A%0A--%0ASent from The Columns Project%0AUpload your own data at ' + config.app.host);
			});

			it('should do the right thing when there is a source but no title', function() {
				shareMessage.data = {
					title: '',
					source: 'Wall Street Journal',
					id: 23
				};
				expect( shareMessage.emailBody() ).toBe('Nothing like a good data set to get the Internets going :-)%0A%0Avia Wall Street Journal%0A' + config.embed.host + '/' + '23%0A%0A--%0ASent from The Columns Project%0AUpload your own data at ' + config.app.host);
			});

			it('should do the right thing when there is a title and a source', function() {
				shareMessage.data = {
					title: 'Billion Dollar Startups',
					source: 'Wall Street Journal',
					id: 23
				};
				expect( shareMessage.emailBody() ).toBe('Nothing like a good data set to get the Internets going :-)%0A%0ABillion Dollar Startups via Wall Street Journal%0A' + config.embed.host + '/' + '23%0A%0A--%0ASent from The Columns Project%0AUpload your own data at ' + config.app.host);
			});
		});
	});

});