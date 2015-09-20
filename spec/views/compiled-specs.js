(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = ColumnsAnalytics;

function ColumnsAnalytics() {}

ColumnsAnalytics.send = function( props ) {
	var props = props || {},
		mixpanelObj = {};

	// Make sure the properties are santized
	props.action = props.action || '';
	props.category = props.category || '';
	props.label = props.label || '';
	props.description = props.description || props.category + ' ' + props.action + ' ' + props.label;
	props.description = props.description == '  ' ? '' : props.description;
	if ( props.table_id ) {
		mixpanelObj['Table ID'] = props.table_id;
	}

	// Send a Google Analytics event
	if ( window.ga ) {
		ga( 'send', 'event', props.category, props.action, props.label, props.table_id );
	}

	// Send a mixpanel event
	if ( window.mixpanel ) {
		mixpanel.track( props.description, mixpanelObj );
	}

};
},{}],2:[function(require,module,exports){
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

	$('.share-page-create').on('click', function() {
		ColumnsAnalytics.send({
			category: 'button',
			action: 'click',
			label: 'create table'
		});
	});

};

module.exports = SharePage;
},{"./ColumnsAnalytics.js":1}],3:[function(require,module,exports){
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

		it('should send an event when the user taps the create table button', function() {
			$('.share-page-create').trigger('click');
			expect( ColumnsAnalytics.send ).toHaveBeenCalledWith({
				category: 'button',
				action: 'click',
				label: 'create table'
			});
		});
	});
});
},{"../../javascripts/models/ColumnsAnalytics.js":1,"../../javascripts/models/SharePage.js":2}]},{},[3]);
