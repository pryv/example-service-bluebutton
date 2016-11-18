/* global module, require */

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: require('./package.json'),

    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // TODO: Only select files needed by the script
    browserify: {
      dist: {
        src: ['./src/public_html/js/*.js'],
        dest: 'dist/script-browserify.js',
        options: {
          alias: ['./src/public_html/js/script.js:script-browserify']
        }
      }
    },

    copy: {
      all: {
        files: [
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: ['src/public_html/html/index.html',
              'src/public_html/css/style.css',
              'src/public_html/assets/*.*'],
            dest: 'dist/'
          }
        ]
      }
    },

    // TODO: Only select files needed by the script
    watch: {
      all: {
        files: ['Gruntfile.js', 'src/public_html/**/*.*'],
        tasks: ['default']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // TODO: Enable JSHINT
  // grunt.registerTask('default', ['jshint', 'browserify', 'copy']);

  grunt.registerTask('default', ['browserify', 'copy']);
};