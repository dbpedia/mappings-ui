/**
 * This script is responsible for getting the ontology from WebProtege and pushing it to a
 * Github repository.
 */
'use strict';
const PeriodicMappingService = require('./scripts/githubMappings/periodicMappingUpdateWorker');
const GithubNetrc = require('./github-netrc');


GithubNetrc.putLoginIntoNetrc();
PeriodicMappingService.start();
