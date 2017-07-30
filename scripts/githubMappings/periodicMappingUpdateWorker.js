/**
 * Created by ismaro3 on 29/06/17.
 * This module has functions for interacting with Github and uploading the ontology file/s.
 */
'use strict';
const Git = require('./git.js');
const Mongo = require('./mongo.js');
const Moment = require('moment');
const Rimraf = require('rimraf');
const Path = require('path');
const Fs = require('fs');
const Mkdirp = require('mkdirp');
const FileHound = require('filehound');
const Await = require('asyncawait/await');

const Config = require('../../config');
const REPO_URL = Config.get('/github/repositoryURL');
const REPO_BRANCH = Config.get('/github/repositoryBranch');
const REPO_FOLDER = Config.get('/github/repositoryFolder');
const REPO_MAPPINGS_FOLDER = Config.get('/github/repositoryMappingsFolder');
const Mongomodels = require('./mongomodels');
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

const getDirectories = function (srcpath) {

    console.log(srcpath);

    return Fs.readdirSync(srcpath)
        .filter( (file) => Fs.lstatSync(Path.join(srcpath, file)).isDirectory());
};

//Used when cloning, inserts mapping file of language lang into database, or updates it.
//Returns a promise
const insertMapping = function (lang,file){


    const colonIndex = file.indexOf(':');
    const extensionIndex = file.lastIndexOf('.');
    const templateName = file.substring(colonIndex + 1,extensionIndex);
    const data = Fs.readFileSync(file ,'UTF8');

    return Mongomodels.updateOrCreate(templateName,lang,data);



};

/**
 * Inserts a language dir into database. Used when cloning.
 * Returns a promise, resolved when all templates have been introduced.
 */
const processLanguageDir = function (lang,dir){


    FileHound.create()
        .ext('ttl')
        .paths(dir)
        .find((err, rmlFiles) => {

            if (err) {
                return Promise.reject(err);
            }

            // Create a new empty promise (don't do that with real people ;)
            let sequence = Promise.resolve();

            // Loop over each file, and add on a promise to the
            // end of the 'sequence' promise.
            rmlFiles.forEach((file) =>  {


                // Chain one computation onto the sequence
                sequence = sequence.then(()  => {
                    console.log('inserting ' + file);
                    return insertMapping(lang,file);
                });

            });

            return sequence;

        });

};

const mergeClonedRepository = function (repo){

    const languageDirs = getDirectories(REPO_FOLDER + '/' + REPO_MAPPINGS_FOLDER);

    const promises = [];
    languageDirs.forEach((langDir) => {

        const lang = langDir;
        const completeDir = REPO_FOLDER + '/' + REPO_MAPPINGS_FOLDER + langDir;
        promises.push(processLanguageDir(lang,completeDir));

    });
    return Promise.all(promises);

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

    const fileName = diff.a_path;
    const mappingPattern = /mappings\/(\w+)\/Mapping_.*:(.*)\.ttl/;


    if ( mappingPattern.test(fileName) ){ //Change refers to mapping

        const ext = fileName.match(mappingPattern);
        const lang = ext[1];
        const template = ext[2];

        //Name change triggers deletion and creation

        if (diff.deleted_file) {
            console.log('\t\t* Deleted ' + template + '/' + lang);
            return Mongomodels.deleteMapping(template,lang);
        }

        if (diff.new_file) {
            //Read
            console.log('\t\t* Created ' + template + '/' + lang);
            const rml = Fs.readFileSync(REPO_FOLDER + '/' + fileName,'UTF8');
            return Mongomodels.updateOrCreate(template,lang,rml);
        }

        //Default: updated
        console.log('\t\t* Updated ' + template + '/' + lang);
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

    return Git.startRepository(REPO_URL,REPO_BRANCH,REPO_FOLDER)
        .then((res) => {
            repo = res.repository;
            return Git.updateFromRemoteAndGetDiffs(repo);
        })
        .then((diffs) => {

            console.log('\t[INFO] Pulled changes from remote');
            const promises = [];
            diffs.forEach((diff) => {

                promises.push(processDiff(diff));
            });

            return Promise.all(promises);
        })
        .then(() => { //Database has been updated with last changes

            console.log('\t[INFO] Database updated with remote changes');
        })
        .catch((err) => {

            throw { code: 'ERROR_UPDATING_FROM_GITHUB', msg: err };
        });


};

/**
 * Two-way synchronization with Github repository.
 * Flow:
 *  1. Repository is checked. Cloned if does not exist.
 *  2. Update changes from github and reflect them in the database. In case of merge, external changes have priority.
 *  3. Clear the mappings folder
 *  4. Dump the mappings database in the mappings folder.
 *  5. Push (*)
 *  (*) If push fails, will be retried in next iteration.
 */
const doAction = function () {

    updateDate = Moment(new Date()).format('DD/MM hh:mm:ss');
    console.log('* Starting Github mappings update at ' + updateDate);
    return Mongo.startProcess()
        .then((id) => {


            console.log('\t[INFO] Inserted progress into MongoDB,');
            recordId = id;
            return Git.startRepository(REPO_URL,REPO_BRANCH,REPO_FOLDER);
        })
        .then((res) => {

            repo = res.repository;
            if (res.cloned){
                return mergeClonedRepository(repo);
            }
            return Promise.resolve();
        })
        .then((re) => {

            repo = re;
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
            return Git.add(repo,REPO_FOLDER + '/' +  REPO_MAPPINGS_FOLDER);

        })
        .then(() => {

            console.log('\t[INFO] Files added to stage.');
            return Git.commit(repo,'Mappings changes as ' + updateDate);

        })
        .then(() => {

            console.log('\t[INFO] Files commited.');
            return Git.push(repo,0,10);

        })
        .then(() => {

            console.log('\t[INFO] Files pushed.');
            console.log('\t[INFO] Finished successfully.');

            return Mongo.endProcess(recordId,false,'OK','');
        })
        .catch((err) => {

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

doAction();

module.exports = {
    doAction
};


