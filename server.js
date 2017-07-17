'use strict';
const Composer = require('./index');
const Config = require('./config');
const PeriodicMappingService = require('./scripts/githubMappings/periodicMappingUpdateWorker');
const GithubNetrc = require('./github-netrc');

//Variables that decide what should be run in this instance
const runServer = Config.get('/run/server');
const runMappingsGithubUpdater = Config.get('/run/mappingsGithubUpdater');

Composer((err, server) => {

    if (err) {
        throw err;
    }

    if (runServer){
        server.start(() => {

            console.log('Started the server on port ' + server.info.port);

        });
    }

    if (runMappingsGithubUpdater ) {

        GithubNetrc.putLoginIntoNetrc();
        PeriodicMappingService.start();

    }

});
