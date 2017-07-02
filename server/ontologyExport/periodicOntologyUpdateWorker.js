/**
 * Created by ismaro3 on 30/06/17.
 * Periodic process that launches the update of ontology in local and github repository.
 */
'use strict';
const GithubPush = require('./githubOntologyPush');
const WebprotegeExport = require('./webprotegeOntologyExport');
const WebprotegeDB = require('./webprotegeDatabase');
const Config = require('../../config');

const UPDATE_FREQUENCY_MINUTES = Config.get('/webProtegeIntegration/ontologyUpdateFrequencyMinutes');



let pID; //ID of DBpedia project
let lastRev; //Last revision of ontology in WebProtege



/*
 * Main action. Gets last revision, downloads the ontology, pushes to github
 */
const doAction = function (){

    console.log('Update cycle');
    //GET PROJECT ID
    WebprotegeDB.getProjectId() //Get projectID from db
        .then((projectID) => {


            pID = projectID;
            //START REPOSITORY (EITHER CLONE OR USE EXISTING ONE)
            return GithubPush.startRepository();
        })
        .then(() => {

            //GET LAST ONTOLOGY REVISION NUMBER
            return WebprotegeExport.getCurrentVersion(pID);
        })
        .then( (lastRevision) => {

            if (lastRevision === lastRev){ //No changes. Exit.
                throw 'exit';
            }
            else {
                lastRev = lastRevision;

                //DOWNLOAD THE ONTOLOGY
                return WebprotegeExport.downloadOntologyFiles(pID,lastRev);
            }


        })
        .then( () => {

            //PUSH ONTOLOGY FILES TO GITHUB
            return GithubPush.updateGithub(lastRev);
        })
        .then( () => {

            console.log('Pushed ontology v' + lastRev + ' to Github');

        })

        .catch( (err) => {

            if (err === 'exit'){
                return 'ok';
            }

            console.error(err);
        });

};


const start = function (){

    console.log('Github ontology update service started');

    setInterval(doAction,UPDATE_FREQUENCY_MINUTES * 60 * 1000);

};



module.exports = {
    start
};



