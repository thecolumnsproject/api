module.exports = function(grunt) {
	
	grunt.initConfig({
		develop: {
			server: {
				file: 'app.js'
			}
		},
		watch: {
			js: {
				files: [
					'*.js',
					'*.json',
					'models/**/*.js',
					'routes/**/*.js',
				],
				tasks: ['develop'],
				options: { nospawn: true }
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-develop');

	grunt.registerTask('default', ['develop', 'watch']);
}