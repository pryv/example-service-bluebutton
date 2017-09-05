/* global module, require */

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: require('./package.json'),

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
              'src/public_html/css/*.css'],
            dest: 'dist/'
          },
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: ['src/public_html/img/*.png', 'src/public_html/img/*.jpg'],
            dest: 'dist/img'
          }
        ]
      }
    },

    watch: {
      all: {
        files: ['Gruntfile.js', 'src/public_html/**/*.*'],
        tasks: ['default']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['browserify', 'copy']);
};