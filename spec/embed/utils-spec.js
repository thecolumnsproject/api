var Utils = require('../../javascripts/models/Utils.js');

describe('Utilities', function() {
	describe('Title Formatting', function() {

		it('should uppercase titles and replace underscores with spaces', function() {
			expect( Utils.formatTitle("my_column") ).toBe("My Column");
		});

		it('should return a single unscore as is', function() {
			expect( Utils.formatTitle("_") ).toBe("_");
		});
	});
});