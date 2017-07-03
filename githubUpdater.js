/**
 * This script is responsible for getting the ontology from WebProtege and pushing it to a
 * Github repository.
 */
'use strict';
const PeriodicOntologyService = require('./server/ontologyExport/periodicOntologyUpdateWorker');
const GithubNetrc = require('./github-netrc');


GithubNetrc.putLoginIntoNetrc();
PeriodicOntologyService.start();
