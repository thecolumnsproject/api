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
					dest: 'files/css',
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
					// namespace: false,
					// commonjs: true,
					// partialsUseNamespace: true,
					// wrapped: true,
					// node: true
				},
				files: {
					"views/embeddable-templates.js": "views/embed-table/*.hbs"
				}
			}
		},
		webfont: {
			'columns-font': {
				src: 'fonts/vectors/*.svg',
				dest: 'files/fonts',
				destCss: 'stylesheets/',
				options: {
					stylesheet: 'scss',
					font: 'columns-project',
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
			specs: {
				src: ['spec/embed/**/*.js', '!spec/embed/compiled-specs.js'],
				dest: 'spec/embed/compiled-specs.js'
			}
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
							console.log( matchedWord + ': ' + process.env.NODE_ENV );
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
							console.log( matchedWord + ': ' + process.env.NODE_ENV );
							return 'http://stg.colum.nz';
						} else {
							return 'http://127.0.0.1:8080'
						}
					}
				}]
			},
			embed_font: {
				src: ['stylesheets/_columns-project.scss'],
				dest: 'stylesheets/_columns-project.scss',
				replacements: [{
					from: '../files/fonts',
					to: '../fonts'
				}]
			}
		},
		concat: {
			embed: {
				src: [
					'javascripts/embed-table-intro.js',
					'bower_components/handlebars/handlebars.runtime.js',
					'views/embeddable-templates.js',
					'compiled-javascripts/embed-table.js',
					'javascripts/embed-table-outro.js'
				],
				dest: 'files/public/embed-table.js'
			},
		},
		jasmine:  {
			embed: {
				options: {
					specs: 'spec/embed/compiled-specs.js',
					vendor: [
						'bower_components/jquery/dist/jquery.js',
						'bower_components/handlebars/handlebars.js',
						'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
						'bower_components/jasmine-ajax/lib/mock-ajax.js'
					],
					helpers: [
						'views/embeddable-templates.js',
					]
				}
			}
		},
		// jasmine_node: {
		// 	options: {
  //     			forceExit: true,
		// 	    match: '.',
		// 	    matchall: false,
		// 	    extensions: 'js',
		// 	    specNameMatcher: 'spec'
  //   		},
  //  			all: ['spec/']
		// },
		watch: {
			spec: {
				files: ['spec/embed/**/*.js', '!spec/embed/compiled-specs.js'],
				tasks: ['browserify:specs']
			},
			handlebars: {
				files: '**/*.hbs',
				tasks: ['handlebars'/*, 'concat:embed'*/],
			},
			icons: {
				files: 'fonts/ventors/*.svg',
				tasks: ['webfont'],
			},
			sass: {
				files: '**/*.scss',
				tasks: ['sass'],
			},
			js: {
				files: [
					'*.js',
					'*.json',
					'models/**/*.js',
					'javascripts/**/*.js',
					'routes/**/*.js',
				],
				tasks: ['browserify', 'replace:embed', 'concat', 'develop'],
				options: { nospawn: true }
			},
		},
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-webfont');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	// grunt.loadNpmTasks('grunt-jasmine-node');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-develop');

	grunt.registerTask('build', [
		'replace:embed_font',
		'sass',
		'handlebars',
		'browserify',
		'replace:embed',
		'concat'
	]);

	grunt.registerTask('default', ['webfont', 'build', 'develop', 'watch']);
}