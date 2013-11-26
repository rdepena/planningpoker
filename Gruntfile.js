module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat : {
			options : {
				separator : ";"
			},
			dist : {
				src : ['public/js/src/*.js'],
				dest: 'public/js/dist/planningshark.js'
			}
		},
		karma: {
			unit: {
				configFile: 'config/unit.karma.conf.js',
				singleRun: true
			}
		},
		watch: {
			files: ['public/js/src/*.js'],
			tasks: ['jshint', 'karma', 'concat']
		},
		jshint: {
			// define the files to lint
			files: ['gruntfile.js', 'test/unit/*.js', 'public/js/src/*.js', 'server.js', 'src/*.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				// more options here if you want to override JSHint defaults
				globals: {
					jQuery: true,
					console: true,
					module: true
				}
			}
		},

	});

	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['jshint', 'karma', 'concat']);
};