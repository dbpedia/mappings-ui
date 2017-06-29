/**
 * Created by ismaro3 on 29/06/17.
 */
'use strict';
const Gift = require('gift');
const Config = require('../../config');



const ONTOLOGY_DIRECTORY = Config.get('/webProtegeIntegration/githubRepositoryFolder');
const ONTOLOGY_FILE = Config.get('/webProtegeIntegration/ontologyFileNameOutput');
const GITHUB_REPO_URL = Config.get('/webProtegeIntegration/githubRepositoryURL');


/*
 Authentication to github has to be made using the ~/.netrc file.
 Create an entry with
 machine github.com login <username> password <password>
 */

/*
 This adds, commits and pushes the ontology to github project. Public method
 */
const updateGithub = function (){

    let repoObject;


    getRepository(GITHUB_REPO_URL, ONTOLOGY_DIRECTORY,'master')
        .then((repo) => {

            repoObject = repo;
            return commitFile(repoObject,ONTOLOGY_FILE,'Ontology revision ' + new Date());
        })
        .then(() => {

            return push(repoObject,0,10);
        });
};


/*
 * PRIVATE METHODS
 */

/**
 * Pushes the repository commits.
 * If needed, makes at most maxTries pulls.
 * If there is a conflict, this does not solve it.
 */
const push = function (repoObject,tries,maxTries){

    return new Promise((resolve, reject)  => {

        if (tries > maxTries){
            reject('Too many tries');
        }
        repoObject.remote_push('origin', (err) => {

            if (err){
                //If there is an error, then pull latest version

                repoObject.pull( (err2) => {

                    if (err2){
                        //If there is an error, it is a conflict with our file (should not happen)
                        console.log('PANIC, someone has modified our file!');


                    }

                    //When pull is done, we can proceed to push
                    push(repoObject,tries + 1);
                });
            }

            resolve('Pushed');


        });
    });
};


/**
 * Adds and commits a file
 */
const commitFile = function (repoObject,file,message){

    return new Promise((resolve, reject)  => {

        repoObject.add(file, (err) => {

            if (err) {
                reject(err);
            }

            repoObject.commit(message, { author: 'Ismael <ismaro.394@gmail.com>' }, (err2) => {

                if (err2) {

                    resolve('Nothing to commit');
                }

                resolve('Commited file ' + file);
            });
        });

    });

};

const startRepository = function (){

    return getRepository(GITHUB_REPO_URL, ONTOLOGY_DIRECTORY,'master');
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
