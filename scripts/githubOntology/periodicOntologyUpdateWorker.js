/**
 * Created by ismaro3 on 30/06/17.
 * Periodic process that launches the update of ontology in local and github repository.
 */
'use strict';
const Moment = require('moment');

const GithubPush = require('./githubOntologyPush');
const WebprotegeExport = require('./webprotegeOntologyExport');
const WebprotegeDB = require('./webprotegeDatabase');
const Mongo = require('./mongo');
const Config = require('../../config');
const REPO_URL = Config.get('/github/repositoryURL');
const REPO_FOLDER = Config.get('/github/repositoryFolder');
const ONTOLOGY_FOLDER = Config.get('/github/repositoryOntologyFolder');
let pID; //ID of DBpedia project
let lastRev; //Last revision of ontology in WebProtege
let recordId;


/*
 * Main action. Gets last revision, downloads the ontology, pushes to github
 */

const doAction = function (){

    const updateDate = Moment(new Date()).format('DD/MM hh:mm:ss');
    console.log('* Starting Github ontology update at ' + updateDate);

    return Mongo.startProcess()
        .then((id) => {

            console.log('\t[INFO] Inserted progress into MongoDB,');
            recordId = id;
            return WebprotegeDB.getProjectId(); //Get database connection
        })
        .then((projectID) => {


            console.log('\t[INFO] Connected to WebProtege Database.');
            pID = projectID;
            //START REPOSITORY (EITHER CLONE OR USE EXISTING ONE)
            return GithubPush.startRepository(REPO_URL,REPO_FOLDER);
        })
        .then( () => {

            //DOWNLOAD THE ONTOLOGY. Always, even when no change, to avoid possible overwrites,
            //Warning: useless, as the mappings updater removes every unstagged change.
            console.log('\t[INFO] Changes detected. Downloading ontology files...');
            return WebprotegeExport.downloadOntologyFiles(pID,lastRev);

        })
        .then(() => { //GET LAST ONTOLOGY REVISION NUMBER

            console.log('\t[INFO] Got repository.');
            return WebprotegeExport.getCurrentVersion(pID);
        })
        .then((lastRevision) => { //GET LAST ONTOLOGY REVISION NUMBER

            console.log('\t[INFO] Got last ontology version: ' + lastRevision);
            if (lastRevision === lastRev){ //No changes. Exit.
                console.log('\t[INFO] No changes since last iteration, finishing.');
                throw 'exit';
            }
            else {
                lastRev = lastRevision;
            }
        })
        .then( () => {


            //PUSH ONTOLOGY FILES TO GITHUB
            return GithubPush.updateGithub(lastRev,REPO_FOLDER,ONTOLOGY_FOLDER);
        })
        .then( () => {

            console.log('\t[INFO] Files pushed (v.' + (lastRev) + ').');
            console.log('\t[INFO] Finished successfuly.');

            return Mongo.endProcess(recordId,false,'OK','');
        })

        .catch( (err) => {

            if (err === 'exit'){
                Mongo.endProcess(recordId,false,'OK','No changes detected');
                return 'ok';
            }

            if (err.code){
                console.log('\t[ERROR] ' + err.code);
                console.log(err.msg);
                Mongo.endProcess(recordId,true,err.code,err.msg);
            }
            else {
                console.log(err);
                Mongo.endProcess(recordId,true,'UNKNOWN_ERROR',err);
            }

        });

};

//doAction();
module.exports = {
    doAction
};



