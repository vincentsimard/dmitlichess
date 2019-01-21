/* jshint node: true */

(function () {
    // Generated on 2014-07-31 using generator-chrome-extension 0.2.9
    'use strict';

    // # Globbing
    // for performance reasons we're only matching one level down:
    // 'test/spec/{,*/}*.js'
    // use this if you want to recursively match all subfolders:
    // 'test/spec/**/*.js'

    module.exports = function (grunt) {

        // Load grunt tasks automatically
        require('load-grunt-tasks')(grunt);

        // Time how long tasks take. Can help when optimizing build times
        require('time-grunt')(grunt);

        // Configurable paths
        const config = {
            app: 'app',
            dist: 'dist'
        };

        grunt.initConfig({

            // Project settings
            config: config,

            // Watches files for changes and runs tasks based on the changed files
            watch: {
                bower: {
                    files: ['bower.json'],
                    tasks: ['bowerInstall']
                },
                js: {
                    files: ['<%= config.app %>/scripts/{,*/}*.js'],
                    tasks: ['jshint'],
                    options: {
                        livereload: true
                    }
                },
                gruntfile: {
                    files: ['Gruntfile.js']
                },
                styles: {
                    files: ['<%= config.app %>/styles/{,*/}*.css'],
                    tasks: [],
                    options: {
                        livereload: true
                    }
                },
                livereload: {
                    options: {
                        livereload: '<%= connect.options.livereload %>'
                    },
                    files: [
                        '<%= config.app %>/*.html',
                        '<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= config.app %>/manifest.json',
                        '<%= config.app %>/_locales/{,*/}*.json'
                    ]
                }
            },

            // Grunt server and debug server setting
            connect: {
                options: {
                    port: 9000,
                    livereload: 35729,
                    // change this to '0.0.0.0' to access the server from outside
                    hostname: 'localhost'
                },
                chrome: {
                    options: {
                        open: false,
                        base: [
                            '<%= config.app %>'
                        ]
                    }
                },
                test: {
                    options: {
                        open: false,
                        base: [
                            'test',
                            '<%= config.app %>'
                        ]
                    }
                }
            },

            // Empties folders to start fresh
            clean: {
                chrome: {
                },
                dist: {
                    files: [{
                        dot: true,
                        src: [
                            '<%= config.dist %>/*',
                            '!<%= config.dist %>/.git*'
                        ]
                    }]
                }
            },

            // Make sure code styles are up to par and there are no obvious mistakes
            jshint: {
                options: {
                    jshintrc: '.jshintrc',
                    reporter: require('jshint-stylish')
                },
                all: [
                    'Gruntfile.js',
                    '<%= config.app %>/scripts/{,*/}*.js',
                    '!<%= config.app %>/scripts/vendor/*',
                    'test/spec/{,*/}*.js'
                ]
            },
            mocha: {
                all: {
                    options: {
                        run: true,
                        urls: ['http://localhost:<%= connect.options.port %>/index.html']
                    }
                }
            },

            // Automatically inject Bower components into the HTML file
            bowerInstall: {
                app: {
                    src: [
                        '<%= config.app %>/*.html'
                    ]
                }
            },

            // Reads HTML for usemin blocks to enable smart builds that automatically
            // concat, minify and revision files. Creates configurations in memory so
            // additional tasks can operate on them
            useminPrepare: {
                options: {
                    dest: '<%= config.dist %>'
                },
                html: [
                    '<%= config.app %>/popup.html',
                    '<%= config.app %>/options.html'
                ]
            },

            // Performs rewrites based on rev and the useminPrepare configuration
            usemin: {
                options: {
                    assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images']
                },
                html: ['<%= config.dist %>/{,*/}*.html'],
                css: ['<%= config.dist %>/styles/{,*/}*.css']
            },

            // The following *-min tasks produce minifies files in the dist folder
            imagemin: {
                dist: {
                    files: [{
                        expand: true,
                        cwd: '<%= config.app %>/images',
                        src: '{,*/}*.{gif,jpeg,jpg,png}',
                        dest: '<%= config.dist %>/images'
                    }]
                }
            },

            svgmin: {
                dist: {
                    files: [{
                        expand: true,
                        cwd: '<%= config.app %>/images',
                        src: '{,*/}*.svg',
                        dest: '<%= config.dist %>/images'
                    }]
                }
            },

            htmlmin: {
                dist: {
                    options: {
                        // removeCommentsFromCDATA: true,
                        // collapseWhitespace: true,
                        // collapseBooleanAttributes: true,
                        // removeAttributeQuotes: true,
                        // removeRedundantAttributes: true,
                        // useShortDoctype: true,
                        // removeEmptyAttributes: true,
                        // removeOptionalTags: true
                    },
                    files: [{
                        expand: true,
                        cwd: '<%= config.app %>',
                        src: '*.html',
                        dest: '<%= config.dist %>'
                    }]
                }
            },

            // Copies remaining files to places other tasks can use
            copy: {
                dist: {
                    files: [{
                        expand: true,
                        dot: true,
                        cwd: '<%= config.app %>',
                        dest: '<%= config.dist %>',
                        src: [
                            '*.{ico,png,txt}',
                            'images/{,*/}*.{webp,gif}',
                            '{,*/}*.html',
                            'ogg/{,*/}*.*',
                            'scripts/**',
                            'styles/{,*/}*.css',
                            'styles/fonts/{,*/}*.*',
                            '_locales/{,*/}*.json',
                            'vendor/**',
                        ]
                    }]
                }
            },

            // Run some tasks in parallel to speed up build process
            concurrent: {
                chrome: [
                ],
                dist: [
                    'imagemin',
                    'svgmin'
                ],
                test: [
                ]
            },

            // Auto buildnumber, exclude debug files. smart builds that event pages
            chromeManifest: {
                dist: {
                    options: {
                        buildnumber: true,
                        background: {
                            target: 'scripts/background.js',
                            exclude: [
                                'scripts/chromereload.js'
                            ]
                        }
                    },
                    src: '<%= config.app %>',
                    dest: '<%= config.dist %>'
                }
            },

            // Compres dist files to package
            compress: {
                dist: {
                    options: {
                        archive: function() {
                            const manifest = grunt.file.readJSON('app/manifest.json');
                            return 'package/dmitlichess-' + manifest.version + '.zip';
                        }
                    },
                    files: [{
                        expand: true,
                        cwd: 'dist/',
                        src: ['**'],
                        dest: ''
                    }]
                }
            }
        });

        grunt.registerTask('createSoundList', 'Lists all sound files and saves them in ogg/filelist', function() {
            const list = {};
            let content;

            grunt.file.expand(config.app + '/ogg/**/*.ogg').forEach(function(path) {
                const fileName = path.replace('app/ogg/', '');
                const commentator = fileName.split('/')[0];
                const trimmedFileName = fileName.replace(commentator + '/', '');
                const key = trimmedFileName.split('_')[0].replace('.ogg', '');

                if (!list[commentator]) { list[commentator] = {}; }
                if (!list[commentator][key]) { list[commentator][key] = []; }
                list[commentator][key].push(trimmedFileName);
            });

            content = 'const sounds = ' + JSON.stringify(list) + ';';

            grunt.file.write(config.app + '/scripts/sounds.js', content);
        });

        grunt.registerTask('debug', function () {
            grunt.task.run([
                'jshint',
                'concurrent:chrome',
                'connect:chrome',
                'watch'
            ]);
        });

        grunt.registerTask('test', [
            'connect:test',
            'mocha'
        ]);

        grunt.registerTask('build', [
            'clean:dist',
            'chromeManifest:dist',
            'useminPrepare',
            'concurrent:dist',
            'copy',
            'usemin',
            'createSoundList',
            'compress'
        ]);

        grunt.registerTask('default', [
            'jshint',
            'test',
            'build'
        ]);
    };
}());