'use strict';
const PeriodicOntologyService = require('./server/ontologyExport/periodicOntologyUpdateWorker');
const GithubNetrc = require('./github-netrc');


GithubNetrc.putLoginIntoNetrc();
PeriodicOntologyService.start();
