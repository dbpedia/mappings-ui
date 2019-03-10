/**
 * Created by ismaro3 on 29/06/17.
 * This module has functions for interacting with Github and uploading the ontology file/s.
 */
'use strict';
const Git = require('./git.js');
const Mongo = require('./mongo.js');
const Moment = require('moment');
const Rimraf = require('rimraf');
const Fs = require('fs');
const Mkdirp = require('mkdirp');
const Config = require('../../config');
const REPO_URL = Config.get('/github/repositoryURL');
const REPO_FOLDER = Config.get('/github/repositoryFolder');
const REPO_MAPPINGS_FOLDER = Config.get('/github/repositoryMappingsFolder');
const Mongomodels = require('./mongomodels');
const MAPPING_PATTERN = /mappings\/(\w+)\/Mapping_\w+:(.*)\.ttl/;

const clearMappings = function (){
    return new Promise((resolve,reject) => {
        Rimraf(REPO_FOLDER + '/' + REPO_MAPPINGS_FOLDER, (err,res) => {
            if (err) {
                reject({ code: 'ERROR_CLEARING_MAPPINGS_DIR', msg: err });
            }

            Mkdirp(REPO_FOLDER + '/' + REPO_MAPPINGS_FOLDER, (err) => {
                if (err) {
                    reject({ code: 'ERROR_CLEARING_MAPPINGS_DIR', msg: err });
                }
                else {
                    resolve('Mappings directory cleared');
                }
            });
        });
    });
};

const witnessExists = function (){
    const path = REPO_FOLDER + '/' + '.importWitness';
    return Fs.existsSync(path);

};

//Returns true if file didn't exists and has been created
//Returns false if file existed, therefore having a problem.
const createWitnessFile = function (){
    const path = REPO_FOLDER + '/' + '.importWitness';
    if (Fs.existsSync(path)){
        return false;
    }
    Fs.closeSync(Fs.openSync(path, 'w'));
    return true;

};

const deleteWitnessFile = function () {
    Fs.unlinkSync(REPO_FOLDER + '/' + '.importWitness');
};

/**
 * SYNC FUNCTION
 */
const createMappingFile = function (dbItem){
    const templateName = dbItem._id.template;
    const templateLang = dbItem._id.lang;
    const rml = dbItem.rml;
    const langDirectory = REPO_FOLDER + '/' + REPO_MAPPINGS_FOLDER + '/' + templateLang;
    const fileName = 'Mapping_' + templateLang + ':' + templateName + '.ttl';
    if (!Fs.existsSync(langDirectory)){
        Mkdirp.sync(langDirectory);
    }
    Fs.writeFileSync(langDirectory  + '/' + fileName,rml);
};

let repo;
let updateDate;
let recordId;

/**
 * Input: diff
 * Updates in the database according to the diff
 */
const processDiff = function (diff){
    const fileName = diff.path;
    const mappingPattern = /mappings\/(\w+)\/Mapping_\w+:(.*)\.ttl/;

    if ( mappingPattern.test(fileName) ){ //Change refers to mapping
        const ext = fileName.match(mappingPattern);
        const lang = ext[1];
        const template = ext[2];

        //Name change triggers deletion and creation

        if (diff.status === 'deleted') {
            //console.log('\t\t* Deleted ' + template + '/' + lang);
            return Mongomodels.deleteMapping(template,lang);
        }

        if (diff.status === 'added') {
            //Read
            //console.log('\t\t* Created ' + template + '/' + lang);
            const rml = Fs.readFileSync(REPO_FOLDER + '/' + fileName,'UTF8');
            return Mongomodels.updateOrCreate(template,lang,rml);
        }

        //Default: modified
        //console.log('\t\t* Updated ' + template + '/' + lang);
        const rml = Fs.readFileSync(REPO_FOLDER + '/' + fileName,'UTF8');
        return Mongomodels.updateMapping(template,lang,rml);
    }
    return Promise.resolve(); //If no mapping file, resolve



};
/**
 * Pulls from github repository. in case of merge, uses remote mappings instead of local, overwritting it.
 * Then, each change of mappings is reflected into the DB (update, create, delete, rename).
 */
const getChangesFromGithub = function () {
    return Git.startRepository(REPO_URL,REPO_FOLDER)
        .then((res) => {
            repo = res.repository;
            return Git.discardUnstashedChanges(repo); //Discard unstaged changes

        })
        .then((res) => {
            console.log('\t[INFO] Discarded unstaged changes');
            return Git.updateFromRemoteAndGetDiffs(repo);
        })
        .then((diffs) => {
            console.log('\t[INFO] Pulled changes from remote');
            let sequence = Promise.resolve();
            diffs.forEach((diff) => {
                sequence = sequence.then(() => {
                    return processDiff(diff);
                });
            });
            return sequence;
        })
        .then(() => { //Database has been updated with last changes
            console.log('\t[INFO] Database updated with remote changes');
        })
        .catch((err) => {
            throw { code: 'ERROR_UPDATING_FROM_GITHUB', msg: err };
        });
};

const preCommitCheck = function (path){
    //PUT HERE ANY PRE-COMMIT CHECKS
    return Promise.resolve({ error: false, message: 'OK' });
};

const doChecksAndCommit = function (repoObject,index,path,deleted){
    return preCommitCheck(path)
        .then((checksPassed) => {
            const mappingPattern = /mappings\/(\w+)\/Mapping_\w+:(.*)\.ttl/;
            const ext = path.match(mappingPattern);
            const lang = ext[1];
            const template = ext[2];

            if (!checksPassed.error){ //If checks pass, then I retrieve the changes info and commit
                return Mongomodels.setMappingStatus(template,lang,false, 'OK' )
                    .then(() => {
                        return Mongomodels.getChangeInfo(template,lang,deleted);
                    })
                    .then((changesInfo) => {
                        let info = changesInfo.message;
                        if (!info || info.length === 0){
                            info = 'No change info';
                        }
                        const message = changesInfo.username +  ': ' + info;
                        return Git.addAndCommit(repoObject,index,path,deleted,message);
                    });
            }
            return Mongomodels.setMappingStatus(template,lang,true,checksPassed.message);
        })
        .catch((err) => {
            throw err;
        });

};
/**
 * Two-way synchronization with Github repository.
 * Flow:
 *  1. Repository is checked. Cloned if does not exist.
 *  2. Remove non staged changes
 *  3. Update changes from github and reflect them in the database. In case of merge, external changes have priority.
 *  4. Clear the mappings folder
 *  5. Dump the mappings database in the mappings folder.
 *  6. For any file that has changed, do a commit with change message obtained from DB
 *  7. Push (*)
 *  (*) If push fails, will be retried in next iteration.
 */
const doAction = function () {
    updateDate = Moment(new Date()).format('DD/MM hh:mm:ss');
    console.log('* Starting Github mappings update at ' + updateDate);
    return Mongo.startProcess()
        .then((id) => {
            console.log('\t[INFO] Inserted progress into MongoDB,');
            recordId = id;
            return Git.startRepository(REPO_URL,REPO_FOLDER);
        })
        .then((re) => {

            repo = re;
            let promise = Promise.resolve();

            if (witnessExists()){
                promise =  new Promise((resolve, reject) => {
                    //If witness exists, panic... Remove directory
                    Rimraf(REPO_FOLDER, (err,res) => {

                        if (err) {
                            reject( { code: 'ERROR_INITIALIZING_REPO', msg: 'Mapping import from github not successfull, would retry but cant delete repo folder' });
                        }

                        reject( { code: 'ERROR_INITIALIZING_REPO', msg: 'Problem initializing repo, will retry... (Witness file not deleted)' });

                    });
                });

            }
            //Now we can create our witness
            createWitnessFile();

            return promise;

        })
        .then(() => {
            return getChangesFromGithub();
        })
        .then(() => {
            return clearMappings();
        })
        .then(() => {
            console.log('\t[INFO] Mappings cleared');
            return  Mongo.getMappings();
        })
        .then( (res) => {
            return new Promise((resolve,reject) => {
                res.each( (err,item) => {
                    if (!err && item){
                        createMappingFile(item);
                    }
                    else if (err){
                        reject(err);
                    }

                    if (item === null){ //Cursor has finished
                        resolve('OK');
                    }

                });
            });

        })
        .then(() => { //As createMappingfile is sync, for sure all files will be created at this point
            console.log('\t[INFO] Files created.');
            return Git.localChanges(repo); //todo: should also get messages from DB
        })
        .then((changes) => { //Add and commit files that have changed.
            console.log('\t[INFO] Local changes retrieved.');
            if (!changes || changes.length === 0) {
                console.log('\t[INFO] No changes detected.');
            }
            return repo.refreshIndex() //Only get it once
                .then((index) => {
                    let sequence = Promise.resolve();
                    changes.forEach((change) => {
                        const path = change.path;
                        const deleted = change.status === 'deleted';
                        if (MAPPING_PATTERN.test(path)){
                            sequence = sequence.then(() => {
                                return doChecksAndCommit(repo,index,path,deleted);
                            });
                        }
                    });

                    //All changed files have been added and committed, each in one different commit
                    return sequence;
                });
        })
        .then(() => {
            console.log('\t[INFO] Files committed.');
            return Git.push(repo);
        })
        .then(() => {
            console.log('\t[INFO] Files pushed.');
            console.log('\t[INFO] Finished successfully.');
            deleteWitnessFile(); //As long has process finishes, good
            return Mongo.endProcess(recordId,false,'OK','');
        })
        .catch((err) => {
            if ( witnessExists()){
                deleteWitnessFile(); //As long has process finishes, good
            }

            //Do not care if error, witness is used if process freezes.
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


