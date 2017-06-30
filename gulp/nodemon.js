'use strict';
const Gulp = require('gulp');
const Nodemon = require('gulp-nodemon');
const Config = require('../config');

const LOCAL_ONTOLOGY_DIRECTORY = Config.get('/webProtegeIntegration/localOntologyFolder');
const ONTOLOGY_REPOSITORY_DIRECTORY = Config.get('/webProtegeIntegration/githubRepositoryFolder');

Gulp.task('nodemon', () => {

    const nodeArgs = ['--inspect'];

    if (process.env.DEBUGGER) {
        nodeArgs.push('--debug');
    }

    Nodemon({
        script: 'server.js',
        ext: 'js md',
        ignore: [
            'client/**/*',
            'gulp/**/*',
            'public/**/*',
            'node_modules/**/*',
            LOCAL_ONTOLOGY_DIRECTORY + '/*',
            ONTOLOGY_REPOSITORY_DIRECTORY + '/*'
        ],
        nodeArgs
    })
    .on('restart', (files) => {

        console.log('change detected:', files);
    });
});
