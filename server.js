'use strict';
const Composer = require('./index');
const PeriodicOntologyService = require('./server/ontologyExport/periodicOntologyUpdateWorker');
const GithubNetrc = require('./github-netrc');

Composer((err, server) => {

    if (err) {
        throw err;
    }

    server.start(() => {

        console.log('Started the plot device on port ' + server.info.port);
        PeriodicOntologyService.start();
        GithubNetrc.putLoginIntoNetrc();
    });
});
