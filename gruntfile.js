module.exports = function(grunt) {
	
	grunt.initConfig({
		develop: {
			server: {
				file: 'app.js'
			}
		},
		sass: {
			dist: {
				files: [{
					expand: true,
					cwd: 'stylesheets',
					src: ['*.scss'],
					dest: 'css',
					ext: '.css',
				}],
				options: {
					loadPath: './'
				}
			}
		},
		handlebars: {
			embed: {
				options: {
					namespace: "Columns.EmbeddableTemplates",
				},
				files: {
					"views/embeddable-templates.js": "views/embed-table/*.hbs"
				}
			}
		},
		webfont: {
			'columns-font': {
				src: 'fonts/vectors/*.svg',
				dest: 'fonts',
				destCss: 'stylesheets/',
				options: {
					stylesheet: 'scss',
					font: 'columns-font',
					syntax: 'bootstrap'
				}
			}
		},
		browserify: {
			embed: {
				src: ['javascripts/embed-table.js'],
				dest: 'compiled-javascripts/embed-table.js',
				// options: {
				// 	browserifyOptions: {
				// 		debug: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ? false : true
				// 	},
				// }
			},
		},
		replace: {
			embed: {
				src: ['compiled-javascripts/embed-table.js'],
				dest: 'compiled-javascripts/embed-table.js',
				replacements: [{
					from: '{{api_host}}',
					to: function(matchedWord) {
						if (process.env.NODE_ENV == 'production') {
							return 'http://api.thecolumnsproject.com';
						} else if ( process.env.NODE_ENV == 'staging' ) {
							return 'http://apistg.thecolumnsproject.com';
						} else {
							return 'http://127.0.0.1:8080'
						}
					}
				}, {
					from: '{{root_path}}',
					to: function(matchedWord) {
						if (process.env.NODE_ENV == 'production') {
							return 'http://colum.nz';
						} else if ( process.env.NODE_ENV == 'staging' ) {
							return 'http://stg.colum.nz';
						} else {
							return 'http://127.0.0.1'
						}
					}
				}]
			},
		},
		concat: {
			embed: {
				src: [
					'javascripts/embed-table-intro.js',
					'node_modules/handlebars/runtime.js',
					'views/embeddable-templates.js',
					'compiled-javascripts/embed-table.js',
					'javascripts/embed-table-outro.js'
				],
				dest: 'public/embed-table.js'
			},
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
			},
			handlebars: {
				files: '**/*.hbs',
				tasks: ['handlebars'/*, 'concat:embed'*/],
			},
			icons: {
				files: 'fonts/ventors/*.svg',
				tasks: ['webfont'],
			},
		},
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-webfont');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-develop');

	grunt.registerTask('default', [
		'sass',
		'handlebars',
		'webfont',
		'browserify',
		'replace',
		'concat',
		'develop',
		'watch']
	);
}