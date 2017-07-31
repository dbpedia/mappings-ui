/**
 * Created by ismaro3 on 29/06/17.
 * This module has functions for interacting with Github and uploading the ontology file/s.
 */
'use strict';
const Gift = require('gift');
const Config = require('../../config');
const Moment = require('moment');
//Get config from file
const GITHUB_REPOSITORY_FOLDER = Config.get('/github/repositoryFolder');
const GITHUB_REPO_URL = Config.get('/github/repositoryURL');
const GITHUB_ONTOLOGY_DIRECTORY = GITHUB_REPOSITORY_FOLDER + '/' +  Config.get('/github/repositoryOntologyFolder');
const ONTOLOGY_FILES_BASE_NAME = Config.get('/webProtegeIntegration/ontologyFileBaseName');


/*
 Authentication to github has to be made using the ~/.netrc file.
 Create an entry with
 machine github.com login <username> password <password>
 */

/*
 This adds, commits and pushes the ontology to github project.
 If there is any conflict, overwrites the repository files with the local ontology files.
 */
const updateGithub = function (revision){

    let repoObject;


    return getRepository(GITHUB_REPO_URL, GITHUB_REPOSITORY_FOLDER,'master')
        .then((repo) => {


            repoObject = repo;
            return commitFiles(repoObject,GITHUB_ONTOLOGY_DIRECTORY + '/' + ONTOLOGY_FILES_BASE_NAME + '.*',
                'Ontology revision ' + revision + ' (Changes as ' + Moment(new Date()).format('DD/MM hh:mm:ss') + ')');
        })
        .then(() => {

            return push(repoObject,0,10);
        })
        .catch((err) => {

            throw { code: 'ERROR_UPDATING_ONTOLOGY', msg: err };
        });
};


/*
 * PRIVATE METHODS
 */

/**
 * Pushes the repository commits.
 * If needed, makes at most maxTries pulls.
 * If there is a conflict, solves it overwriting the ontology files with the local ones.
 */
const push = function (repoObject,tries,maxTries){

    return new Promise((resolve, reject)  => {

        if (tries > maxTries){
            reject({ code: 'ERROR_GIT_PUSH_FILES', msg: 'Too many tries pushing the files.' });
            return;
        }

        repoObject.remote_push('origin', (err) => {


            if (err){
                //If there is an error, then pull latest version

                repoObject.pull( (err2) => {

                    if (err2){ //If there is an error, it is a conflict with our file (should not happen)

                        console.log('\t[WARNING] External modification of ontology files. Overwriting in next iteration.');

                        reject({ code: 'ERROR_GIT_PUSH_FILES', msg: err2 });

                    }
                    else {

                        //When pull is done, we can proceed to push
                        push(repoObject,tries + 1,maxTries)
                            .then( () => {


                                resolve('Pushed');

                            });
                    }

                });
            }
            else  {

                resolve('Pushed');
            }


        });
    });
};


/**
 * Adds and commits files that follow the pattern "filePattern"
 */
const commitFiles = function (repoObject,filePattern,message){

    return new Promise((resolve, reject)  => {

        repoObject.add(filePattern, (err) => {

            console.log('\t[INFO] Files added to stage: ' + filePattern);
            if (err) {
                reject({ code: 'ERROR_ADDING_FILES', msg: err });
            }

            repoObject.commit(message, { author: 'Ismael <ismaro.394@gmail.com>' }, (err2) => {

                console.log('\t[INFO] Files commited.');

                if (err2) {

                    resolve('Nothing to commit');
                }

                resolve('Commited files');
            });
        });

    });

};

/*
 Gets the repository object, accessing the already existing or cloning otherwise.
 */
const startRepository = function (){

    return getRepository(GITHUB_REPO_URL, GITHUB_REPOSITORY_FOLDER,'master')
        .catch( (err) => {

            reject({ code: 'ERROR_GETTING_REPOSITORY', msg: err });
        });
};
/*
 Returns  a promise with a repository object. If it does not exist, the repository is cloned.
 */
const getRepository = function (repoURL,destFolder,branch){

    return new Promise((resolve, reject)  => {
        //Check if repository already exists.
        const repo = Gift(destFolder);

        repo.current_commit((err, commit) => {

            if (err) { //If repository does not exist, do not clone. Send error to run 'firstTimeGithubImport.js'

                reject({ code: 'REPOSITORY_IS_NOT_CLONED',msg: 'Please, run scripts/firstTimeGithubImport.js to set-up connection to Github repository. ' });

            }
            else {

                resolve(repo);
            }


        });
    });


};


module.exports = {
    updateGithub,
    startRepository
};
