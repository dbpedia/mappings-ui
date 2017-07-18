/**
 * Created by ismaro3 on 30/06/17.
 * Periodic process that launches the update of ontology in local and github repository.
 */
'use strict';
const Moment = require('moment');

const GithubPush = require('./githubOntologyPush');
const WebprotegeExport = require('./webprotegeOntologyExport');
const WebprotegeDB = require('./webprotegeDatabase');

let pID; //ID of DBpedia project
let lastRev; //Last revision of ontology in WebProtege



/*
 * Main action. Gets last revision, downloads the ontology, pushes to github
 */
const doAction = function (){

    const updateDate = Moment(new Date()).format('DD/MM hh:mm:ss');
    console.log('* Starting Github ontology update at ' + updateDate);

    WebprotegeDB.getProjectId() //Get database connection
        .then((projectID) => {


            console.log('\t[INFO] Connected to WebProtege Database.');
            pID = projectID;
            //START REPOSITORY (EITHER CLONE OR USE EXISTING ONE)
            return GithubPush.startRepository();
        })
        .then(() => { //GET LAST ONTOLOGY REVISION NUMBER

            console.log('\t[INFO] Got repository.');
            return WebprotegeExport.getCurrentVersion(pID);
        })
        .then( (lastRevision) => {

            console.log('\t[INFO] Got last ontology version: ' + lastRevision);
            if (lastRevision === lastRev){ //No changes. Exit.
                console.log('\t[INFO] No changes since last iteration, finishing.');
                throw 'exit';
            }
            else {
                lastRev = lastRevision;

                //DOWNLOAD THE ONTOLOGY
                console.log('\t[INFO] Changes detected. Downloading ontology files...');
                return WebprotegeExport.downloadOntologyFiles(pID,lastRev);
            }


        })
        .then( () => {


            //PUSH ONTOLOGY FILES TO GITHUB
            return GithubPush.updateGithub(lastRev);
        })
        .then( () => {

            console.log('\t[INFO] Files pushed (v.' + (lastRev) + ').');
            console.log('\t[INFO] Finished successfuly.');
        })

        .catch( (err) => {

            if (err === 'exit'){
                return 'ok';
            }

            if (err.code){
                console.log('\t[ERROR] ' + err.code);
                console.log(err.msg);
            }
            else {
                console.log(err);
            }

        });

};

module.exports = {
    doAction
};



