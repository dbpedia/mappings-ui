/**
 * Created by ismaro3 on 17/07/17.
 */
'use strict';
const Gift = require('gift');
const Config = require('../../config');
const FirstTimeImport = require('../firstTimeGithubImport');
const NAME = Config.get('/githubMappings/name');
const EMAIL = Config.get('/githubMappings/email');

/*
 Gets the repository object, accessing the already existing or cloning otherwise.
 */
const startRepository = function (repo,branch,destFolder){

    return getRepository(repo,destFolder,branch)
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

            if (err) {

                //If repo does not exist, then clone it and import mappings.
                FirstTimeImport.start()
                    .then(() => {

                        repo = Gift(destFolder);
                        resolve({ repository: repo,cloned:true });
                    })
                    .catch( (err) => {

                        reject({ code: 'ERROR_CLONING_REPOSITORY', msg: err });
                    });

            }
            else {

                resolve({ repository: repo,cloned:false });
            }


        });
    });


};
/*
 Clones the github repository
 */
const cloneRepository = function (repoURL,destFolder,branch){


    return new Promise((resolve, reject)  => {

        console.log('\t[INFO] Cloning repository...');
        Gift.clone( repoURL, destFolder, 1, branch, (err, repo) => {

            if (err) {
                reject({ code: 'ERROR_CLONING_REPOSITORY', msg: err });

            }
            else {
                console.log('\t[INFO] Repository cloned.');
                resolve('Cloned');
            }

        });
    });



};


const add = function (repo,folder){

    return new Promise((resolve,reject) => {

        repo.add(folder, (err) => {

            if (err) {
                reject({ code: 'ERROR_GIT_ADD_FILES', msg: err });
            }
            else {
                resolve('Added');
            }
        });
    });

};

const commit = function (repo,message){

    return new Promise((resolve,reject) => {

        repo.commit(message, { author: NAME + ' <' + EMAIL + '>' }, (err2) => {

            if (err2) {

                resolve('Nothing to commit');
            }

            resolve('Commited files');
        });
    });

};

const getCurrentCommit = function (repoObject){

    return new Promise((resolve,reject) => {

        repoObject.commits('master',1,(err,commits) => {

            if (err) {
                reject(err);
            }
            else {
                resolve(commits[0]);
            }
        });

    });
};


const pullKeepTheirs = function (repoObject) {

    return new Promise((resolve,reject) => {

        repoObject.remote_fetch('origin', (err) => {

            if (err) {
                reject(err);
            }
            else {

                repoObject.merge('origin',{ 'strategy-option':'theirs' }, (err2) => {

                    if (err2) {
                        reject(err2);
                    }
                    else {
                        resolve('merged with keep theirs');
                    }
                });

            }
        });

    });

};

const diff = function (repoObject,commitA,commitB) {

    return new Promise((resolve,reject) => {

        repoObject.diff(commitA, commitB, (err,diffs) => {

            if (err) {
                reject(err);
            }
            else {
                resolve(diffs);
            }
        });

    });

};

const updateFromRemoteAndGetDiffs = function (repoObject){

    let startCommit;
    let endCommit;
    return getCurrentCommit(repoObject) //1.- Get commit before anything
    .then((commit) => {

        startCommit = commit;
        return pullKeepTheirs(repoObject); //2.- Sync with remote, keeping their changes in case of merge. We do not lost anything as it is saved on history.
    })
    .then(() => {

        return getCurrentCommit(repoObject); //3.- Get commit after update
    })
    .then((commit) => {

        endCommit = commit;
        return diff(repoObject, startCommit, endCommit); //4.- Get differences
    })
    .catch((err) => {

        throw { code: 'ERROR_UPDATING_FROM_GITHUB', msg: err };
    });
};


const push = function (repoObject,tries,maxTries){

    return new Promise((resolve, reject)  => {

        if (tries > maxTries){
            reject({ code: 'ERROR_GIT_PUSH_FILES', msg: 'Too many tries pushing the files.' });
            return;
        }

        repoObject.remote_push('origin', (err) => {


            if (err){

                //If there is an error, then pull latest version
                console.log('\t[INFO] Pulling last version.');
                repoObject.pull( (err2) => {

                    if (err2){ //If there is an error, it is a conflict with our file (should not happen)

                        console.log('\t[WARNING] External modification of mapping files. Overwriting...');

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

module.exports = {
    startRepository,
    add,
    commit,
    push,
    updateFromRemoteAndGetDiffs
};
