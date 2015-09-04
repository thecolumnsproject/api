var ColumnsAnalytics 	= require('./ColumnsAnalytics.js');

function SharePage() {

	ColumnsAnalytics.send({
		category: 'navigation',
		action: 'arrived',
		label: 'page'
	});

	this._setupEvents();

}

SharePage.prototype._setupEvents = function() {

	$('.share-page-action-button.tweet').on( 'click', function() {
		console.log('here');
		ColumnsAnalytics.send({
			category: 'button',
			action: 'click',
			label: 'tweet'
		});
	});

	$('.share-page-action-button.email').on( 'click', function() {
		ColumnsAnalytics.send({
			category: 'button',
			action: 'click',
			label: 'email'
		});
	});

};

module.exports = SharePage;