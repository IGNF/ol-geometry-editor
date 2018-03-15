module.exports = function (grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },

        copy: {
            "images": {
                files: [{
                        expand: true,
                        flatten: true,
                        src: ['src/images/*.png'],
                        dest: 'dist/images'
                    }]
            }
        },

        browserify: {
            dist: {
                files: {
                    'dist/ol-geometry-editor.js': ['src/js/index.js']
                }
            }
        },

        concat: {
            options: {
                //separator: ';',
            },
            "ol-geometry-editor-bundle-js": {
                src: [
                    'node_modules/openlayers/dist/ol.js',
                    'dist/ol-geometry-editor.js'
                ],
                dest: 'dist/ol-geometry-editor-bundle.js'
            },
            "ol-geometry-editor-css": {
                src: [
                    'src/css/draw-control.css'
                ],
                dest: 'dist/ol-geometry-editor.css'
            },
            "ol-geometry-editor-bundle-css": {
                src: [
                    'node_modules/openlayers/dist/ol.css',
                    'src/css/draw-control.css'
                ],
                dest: 'dist/ol-geometry-editor-bundle.css'
            }
        },

        uglify: {
            olGeometryEditor: {
                files: {
                    'dist/ol-geometry-editor.min.js': ['dist/ol-geometry-editor.js']
                }
            },
            olGeometryEditorBundle: {
                files: {
                    'dist/ol-geometry-editor-bundle.min.js': ['dist/ol-geometry-editor-bundle.js']
                }
            }
        },

        watch: {
            scripts: {
                files: ['Gruntfile.js', 'src/js/**/*.js'],
                tasks: ['build']
            }
        }
    });


    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['jshint', 'browserify', 'concat', 'uglify', 'copy']);

    grunt.registerTask('default', ['build']);
};
