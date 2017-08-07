/**
 * Created by ismaro3 on 29/06/17.
 * This module has functions for interacting with Github and uploading the ontology file/s.
 */
'use strict';
const Git = require('nodegit');
const FirstUpdate = require('../firstTimeGithubImport');

const Config = require('../../config');
const Moment = require('moment');
//Get config from file
const GITHUB_REPO_URL = Config.get('/github/repositoryURL');
const NAME = Config.get('/github/name');
const EMAIL = Config.get('/github/email');
const USERNAME = Config.get('/github/username');
const PASSWORD = Config.get('/github/password');


/*
 This adds, commits and pushes the ontology to github project.
 If there is any conflict, overwrites the repository files with the local ontology files.
 */
const updateGithub = function (revision, repoFolder, ontologyFolder){

    let repoObject;


    return getRepository(GITHUB_REPO_URL, repoFolder)
        .then((res) => {


            repoObject = res.repository;
            return commitFiles(repoObject,ontologyFolder,
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
 * Pushes to Github the commited code. If error, returns error. In next iteration,
 * things will be pulled, so no problem, we don't loss anything.
 */
const push = function (repoObject){

    let loginAttempts = 0;

    return repoObject.getRemote('origin') //Get origin remote
        .then((remote) => {

            return remote.push(['refs/heads/master:refs/heads/master'], {
                callbacks: {
                    credentials: (url,userName) => {

                        console.log('\t[INFO] Authenticating to repository');
                        loginAttempts++;
                        if (loginAttempts > 10 || USERNAME === null || PASSWORD === null){
                            return Git.Cred.defaultNew();
                        }

                        return Git.Cred.userpassPlaintextNew(USERNAME,PASSWORD);

                    }
                }
            });
        })
        .catch((err) => {

            throw { code: 'ERROR_PUSHING_COMMITS', msg: err };

        });

};



/**
 * Returns the current commit.
 */
const getCurrentCommit = function (repoObject){

    return repoObject.getBranchCommit('master');

};

/**
 * Adds and commits files inside the "directory" directory
 */
const commitFiles = function (repoObject,directory,message){

    let lastCommit;
    let _index;
    return repoObject.refreshIndex()
        .then((index) => {   //Get current commit.

            _index = index;
            return _index.addAll(directory);
        })
        .then(() => {   //Get current commit.

            return getCurrentCommit(repoObject,'master');
        })
        .then((com) => {    //Write changes to index

            lastCommit = com;
            return _index.write();
        }).then(() => {

            return _index.writeTree();
        })
        .then((oid) => {    //Create commit

            const author = Git.Signature.now(NAME, EMAIL);
            return repoObject.createCommit('HEAD',author,author,message,oid,[lastCommit]);
        })

        .catch((err) => {

            throw { code: 'ERROR_COMMITTING_ONTOLOGY', msg: err };
        });



};

/**
 * Gets the repository object, accessing the already existing or cloning otherwise.
 */
const startRepository = function (repo,destFolder){

    return getRepository(repo,destFolder)
        .catch( (err) => {

            throw { code: 'ERROR_GETTING_REPOSITORY_OBJECT', msg: err };
        });
};


/**
 * Returns  a promise with a repository object. If it does not exist, the repository is cloned.
 */
const getRepository = function (repoURL,destFolder){


    return Git.Repository.open(destFolder)
        .then((repo) => {
            //Repository exists, return it immediately
            return ({ repository: repo, cloned: false });
        })
        .catch((err) => {

            //Repo does not exist, clone it
            if (err && err.message.indexOf('failed to resolve path') > -1){
                return FirstUpdate.start() //Merge DB with github files, very important
                    .then((repo) => {

                        return ({ repository: repo,cloned:true });
                    })
                    .catch( (err) => {

                        throw { code: 'ERROR_CLONING_REPOSITORY', msg: err };
                    });
            }

            throw { code: 'ERROR_CLONING_REPOSITORY', msg: err };  //Unknown error, throw it


        });




};



module.exports = {
    updateGithub,
    startRepository
};
