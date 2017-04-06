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
		}

	});

	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['concat']);
};
