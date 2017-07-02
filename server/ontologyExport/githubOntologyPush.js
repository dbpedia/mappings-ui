/**
 * Created by ismaro3 on 29/06/17.
 * This module has functions for interacting with Github and uploading the ontology file/s.
 */
'use strict';
const Gift = require('gift');
const Config = require('../../config');
const OntologyExport = require('./webprotegeOntologyExport');

const ONTOLOGY_DIRECTORY = Config.get('/webProtegeIntegration/githubRepositoryFolder');
const GITHUB_REPO_URL = Config.get('/webProtegeIntegration/githubRepositoryURL');
const ONTOLOGY_FILES_BASE_NAME = Config.get('/webProtegeIntegration/ontologyFileBaseName');

const GIT_ONTOLOGY_DIRECTORY = Config.get('/webProtegeIntegration/githubRepositoryFolder');
const LOCAL_ONTOLOGY_DIRECTORY = Config.get('/webProtegeIntegration/localOntologyFolder');
const LOCAL_ONTOLOGY_BASE_PATH = LOCAL_ONTOLOGY_DIRECTORY + '/' + Config.get('/webProtegeIntegration/ontologyFileBaseName');
const GIT_ONTOLOGY_BASE_PATH = GIT_ONTOLOGY_DIRECTORY + '/' + Config.get('/webProtegeIntegration/ontologyFileBaseName');

const ONTOLOGY_FORMATS = Config.get('/webProtegeIntegration/ontologyFormats');
const FORMATS = ONTOLOGY_FORMATS.split(',');


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


    return getRepository(GITHUB_REPO_URL, ONTOLOGY_DIRECTORY,'master')
        .then((repo) => {

            repoObject = repo;
            return commitFiles(repoObject,ONTOLOGY_FILES_BASE_NAME + '.*','Ontology revision ' + revision);
        })
        .then(() => {

            return push(repoObject,0,10);
        })
        .catch((err) => {

            throw err;
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
            reject('Too many tries');
            return;
        }

        repoObject.remote_push('origin', (err) => {


            if (err){
                //If there is an error, then pull latest version

                console.log('pulling last version');
                repoObject.pull( (err2) => {

                    if (err2){ //If there is an error, it is a conflict with our file (should not happen)

                        console.log('[WARNING] External modification of ontologies. Overwriting...');

                        //Copy files back from local folder to git repository, to overwrite remote changes!
                        const promises = [];
                        FORMATS.forEach( (format) => {

                            promises.push(OntologyExport.copyFile(LOCAL_ONTOLOGY_BASE_PATH + '.' + format,GIT_ONTOLOGY_BASE_PATH + '.' + format));
                        });


                        Promise.all(promises)
                            .then( () => {

                                //Commit files again
                                return commitFiles(repoObject,ONTOLOGY_FILES_BASE_NAME + '.*','Ontology revision X');

                            })
                            .then( () => {

                                return push(repoObject,tries + 1,maxTries);

                            }).then( () => {

                                resolve('Pushed');

                            });

                    }
                    else {

                        //When pull is done, we can proceed to push
                        push(repoObject,tries + 1,maxTries)
                        .then( () => {

                            console.log('pushed');

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

            if (err) {
                reject(err);
            }

            repoObject.commit(message, { author: 'Ismael <ismaro.394@gmail.com>' }, (err2) => {

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

    return getRepository(GITHUB_REPO_URL, ONTOLOGY_DIRECTORY,'master')
        .catch( (err) => {

            throw err;
        });
};
/*
 Returns  a promise with a repository object. If it does not exist, the repository is cloned.
 */
const getRepository = function (repoURL,destFolder,branch){

    return new Promise((resolve, reject)  => {
        //Check if repository already exists.
        let repo = Gift(destFolder);

        repo.current_commit((err, commit) => {

            if (err) { //Clone repository, as it does not exist


                cloneRepository(repoURL, destFolder, branch)
                    .then(() => {

                        repo = Gift(destFolder);
                        resolve(repo);
                    })
                    .catch((err) => {

                        reject(err);
                    });

            }
            else {

                resolve(repo);
            }


        });
    });


};
/*
 Clones the github repository
 */
const cloneRepository = function (repoURL,destFolder,branch){


    return new Promise((resolve, reject)  => {

        Gift.clone( repoURL, destFolder, 1, branch, (err, repo) => {

            if (err) {
                reject(err);

            }
            else {
                resolve('Cloned');
            }

        });
    });



};

module.exports = {
    updateGithub,
    startRepository
};
