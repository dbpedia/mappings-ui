'use strict';
const Composer = require('./index');
const GithubNetrc = require('./github-netrc');
const Process = require('./server/ontologyExport/periodicOntologyUpdateWorker');

Composer((err, server) => {

    if (err) {
        throw err;
    }

    server.start(() => {

        console.log('Started the plot device on port ' + server.info.port);
        GithubNetrc.putLoginIntoNetrc();
        Process.start();

    });
});
