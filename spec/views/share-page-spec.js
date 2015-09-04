var SharePage = require('../../javascripts/models/SharePage.js');
var ColumnsAnalytics = require('../../javascripts/models/ColumnsAnalytics.js');

jasmine.getFixtures().fixturesPath = 'spec/views/fixtures';

describe('Share Page', function() {
	var sharePage;

	beforeEach(function() {
		loadFixtures('share-page.html');
		sharePage = new SharePage();
	});

	describe('Sending Analytics Events', function() {

		beforeEach(function() {
			spyOn( ColumnsAnalytics, 'send' );
			sharePage = new SharePage();
		});

		it('should send an event when the user arrives', function() {
			expect( ColumnsAnalytics.send ).toHaveBeenCalledWith({
				category: 'navigation',
				action: 'arrived',
				label: 'page'
			});
		});

		it('should send an event when the user taps the tweet button', function() {
			$('.share-page-action-button.tweet').trigger('click');
			expect( ColumnsAnalytics.send ).toHaveBeenCalledWith({
				category: 'button',
				action: 'click',
				label: 'tweet'
			});
		});

		it('should send an event when the user taps the email button', function() {
			$('.share-page-action-button.email').trigger('click');
			expect( ColumnsAnalytics.send ).toHaveBeenCalledWith({
				category: 'button',
				action: 'click',
				label: 'email'
			});
		});
	});
});