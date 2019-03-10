/**
 * Created by ismaro3 on 18/07/17.
 */
'use strict';
const StatsUpdater = require('./mappingsStats/periodicStatsUpdateWorker');
const Config = require('../config');
const Await = require('asyncawait/await');
const Async = require('asyncawait/async');
const UPDATE_FREQUENCY_MINUTES = Config.get('/mappings/statsUpdateFrequencyMinutes');

const sleep = function (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
};

let lastStartTime;
let currentTime;
let timeLeft;

const start = Async(() => {
    //Only used to update ontology, not used right now
    //noinspection InfiniteLoopJS
    for (;;){
        lastStartTime = new Date().getTime();
        Await(StatsUpdater.doAction());
        currentTime = new Date().getTime();
        timeLeft = UPDATE_FREQUENCY_MINUTES * 60 * 1000 - (currentTime - lastStartTime);
        if (timeLeft < 0) {
            timeLeft = 0;
        }
        console.log('*[INFO] Waiting ' + timeLeft / 1000 + ' s. for next stats update');
        Await(sleep(timeLeft));
    }
});
module.exports = {
    start
};
