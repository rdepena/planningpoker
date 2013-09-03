module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat : {
			options : {
				separator : ";"
			},
			dist : {
				src : ['public/js/*.js'],
				dest: 'public/js/dist/<%= pkg.name %>.js'
			}
		},
		karma: {
			unit: {
				configFile: 'config/unit.karma.conf.js',
				singleRun: true
			}
		},
		watch: {
			files: ['public/js/*.js'],
			tasks: ['jshint', 'karma']
		},
		jshint: {
			// define the files to lint
			files: ['gruntfile.js', 'test/unit/*.js', 'public/js/*.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				// more options here if you want to override JSHint defaults
				globals: {
					jQuery: true,
					console: true,
					module: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('default', ['jshint', 'karma', 'concat']);
};