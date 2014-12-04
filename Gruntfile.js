module.exports = function (grunt) {
  'use strict';

    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compress');

    var config = {
        app: 'src',
        dist: 'dist',
        package: grunt.file.readJSON('package.json')
    };

   grunt.initConfig({
       config: config,
       jslint: {
           app: {
               src: [
                   '<%= config.app %>/scripts/**/*.js'
               ]
           }
       },
       jshint: {
           all: [
               '<%= config.app %>/scripts/**/*.js'
           ]
       },
       compress: {
         dist: {
            options: {
                archive: '<%= config.dist %>/<%= config.package.name %>-<%= config.package.version %>.zip'
            },
            files: [{
                expand: true,
                cwd: '<%= config.app %>/',
                src: ['**'],
                dest: ''
            }]
        }
       }
   });


// A very basic default task.
    grunt.registerTask('default', ['compress']);
};
