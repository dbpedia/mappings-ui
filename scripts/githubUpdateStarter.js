/**
 * Created by ismaro3 on 18/07/17.
 */
'use strict';
const MappingsUpdater = require('./githubMappings/periodicMappingUpdateWorker');
const OntologyUpdater = require('./githubOntology/periodicOntologyUpdateWorker');
const Config = require('../config');
const Await = require('asyncawait/await');
const Async = require('asyncawait/async');
const UPDATE_FREQUENCY_MINUTES = Config.get('/github/updateFrequencyMinutes');
const sleep = function (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
};

let lastStartTime;
let currentTime;
let timeLeft;

const start = Async((runMappings,runOntology) => {
    if (!runMappings && !runOntology) {
        console.log('[ERROR] Please specify at least one update to run');
    }

    //Only used to update ontology, not used right now

    //noinspection InfiniteLoopJS
    for (;;){
        lastStartTime = new Date().getTime();
        if (runMappings){
            Await(MappingsUpdater.doAction());
        }

        if (runOntology){
            Await(OntologyUpdater.doAction());
        }

        currentTime = new Date().getTime();
        timeLeft = UPDATE_FREQUENCY_MINUTES * 60 * 1000 - (currentTime - lastStartTime);
        if (timeLeft < 0) {
            timeLeft = 0;
        }
        console.log('*[INFO] Waiting ' + timeLeft / 1000 + ' s. for next update');
        Await(sleep(timeLeft));
    }
});

module.exports = {
    start
};
