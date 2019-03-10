/**
 * Created by ismaro3 on 17/07/17.
 * Contains functionality for interacting with Github repository.
 */

'use strict';
const Git = require('nodegit');
const Gitkit = require('nodegit-kit');
const Config = require('../../config');
const Spawn = require('child_process').spawn;
const FirstUpdate = require('../firstTimeGithubImport');
const NAME = Config.get('/github/name');
const EMAIL = Config.get('/github/email');
const USERNAME = Config.get('/github/username');
const PASSWORD = Config.get('/github/password');

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
                return FirstUpdate.start()
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

/**
 * Executes a custom git command using spawn. Used when nodegit does not provide enough flexibility.
 */
const customGitCommand = (parameters,directory) => (
    new Promise((resolve, reject) => {
        const thread = Spawn('git', parameters,{ cwd:directory });
        const stdOut = [];
        const stdErr = [];

        thread.stdout.on('data', (data) => {

            stdOut.push(data.toString('utf8'));
        });

        thread.stderr.on('data', (data) => {

            stdErr.push(data.toString('utf8'));
        });

        thread.on('close', () => {

            if (stdErr.length) {
                reject({ code: 'ERROR_CUSTOM_GIT_COMMAND', msg: stdErr.join('') });
                return;
            }
            resolve(stdOut.join());
        });
    })
);

/**
 * Returns a list of local changes in repository.
 */
const localChanges = function (repo) {

    return Gitkit.status(repo);
};

/**
 * Returns the current commit.
 */
const getCurrentCommit = function (repoObject){

    return repoObject.getBranchCommit('master');

};

/**
 * Pulls from remote, but keeping their changes.
 */
const pullKeepTheirs = function (repoObject) {
    return repoObject.fetch('origin') //Fetch data
        .then((res) => {

            return customGitCommand(['merge','--strategy-option','theirs'],repoObject.workdir());
        })
        .catch((err) => {

            throw err; //Error is wrapped in updateFromRemoteAndGetDiffs
        });
};

/**
 * Returns diffs between two commits.
 */
const diff = function (repoObject,commitA,commitB) {
    return Gitkit.diff(repoObject,commitA,commitB);

};

/**
 * Discards unstaged changes, by stashing them and dropping the stash if any.
 */
const discardUnstashedChanges = function (repoObject){
    return customGitCommand(['stash','save','--keep-index'],repoObject.workdir())
        .then(() => {
            return customGitCommand(['stash','drop'],repoObject.workdir());
        })
        .catch((err) => {
            if (err && err.msg.indexOf('No stash found') > -1) {
                return 'OK';
            }
            throw err;
        });
};

/**
 * Updates repository from remote, keeping their changes, and returns the diffs.
 */
const updateFromRemoteAndGetDiffs = function (repoObject){
    let startCommit;
    let endCommit;
    return getCurrentCommit(repoObject) //1.- Get commit before anything
    .then((commit1) => {
        startCommit = commit1;
        return pullKeepTheirs(repoObject); //2.- Sync with remote, keeping their changes in case of merge. We do not lost anything as it is saved on history.
    })
    .then(() => {
        return getCurrentCommit(repoObject); //3.- Get commit after update
    })
    .then((commit2) => {
        endCommit = commit2;
        return diff(repoObject, startCommit, endCommit); //4.- Get differences
    })
    .catch((err) => {
        throw err;
    });
};

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
 * Adds a file to staged files and commits that single file with a certain message.
 * Distinguishes between deleted and modified/created files.
 */
const addAndCommit = function (repo,index,path,deleted,message){
    let res;
    let lastCommit;

    if (deleted){
        res =  index.removeByPath(path);
    }
    else {
        res = index.addByPath(path);
    }

    return res
        .then(() => {   //Get current commit.
            return getCurrentCommit(repo,'master');
        })
        .then((com) => {    //Write changes to index
            lastCommit = com;
            return index.write();
        }).then(() => {
            return index.writeTree();
        })
        .then((oid) => {    //Create commit
            const author = Git.Signature.now(NAME, EMAIL);
            return repo.createCommit('HEAD',author,author,message,oid,[lastCommit]);
        })
        .catch((err) => {
            throw { code: 'ERROR_COMMITTING_FILE', msg: err };
        });
};

module.exports = {
    startRepository,
    addAndCommit,
    push,
    localChanges,
    updateFromRemoteAndGetDiffs,
    discardUnstashedChanges
};
