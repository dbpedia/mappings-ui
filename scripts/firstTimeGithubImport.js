/**
 * First-time repository import tool.
 * This script SHOULD ONLY BE RUN the first time a new github repository is connected,
 * and should be run BEFORE running the main server.
 * It merges the contents of the repository and the UI, with priority on the repository.
 * All the mappings of the repository will be included in the UI either as new or as an update
 * to existing ones, preserving the already existing ones.
 * WARNING: If not run before connection to Github repository first time, Github repository contents
 * will be overwritten with those contents of the mappings UI. If UI is empty, github mappings will be cleared!
 */

'use strict';
const Gift = require('gift');
const Fs = require('fs');
const Config = require('../config');
const Path = require('path');
const FileHound = require('filehound');
const Process = require('process');
const MongoClient = require('mongodb').MongoClient;
const MongoModels = require('./githubMappings/mongomodels');

const MONGODB_URI = 'mongodb://heroku_07m9xl4r:cc620dn44mi81rvc3ae92hcpga@ds147052.mlab.com:47052/heroku_07m9xl4r';
const REPO_URL = Config.get('/github/repositoryURL');
const REPO_BRANCH = Config.get('/github/repositoryBranch');
const REPO_FOLDER = Config.get('/github/repositoryFolder');
const REPO_MAPPINGS_FOLDER = Config.get('/github/repositoryMappingsFolder');
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

    console.log('[INFO] Cloning repository...');

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

const getDirectories = function (srcpath) {

    return Fs.readdirSync(srcpath)
        .filter( (file) => Fs.lstatSync(Path.join(srcpath, file)).isDirectory());
};


const insertMapping = function (lang,file,mappingsCollection, statsCollection){


    const colonIndex = file.indexOf(':');
    const extensionIndex = file.lastIndexOf('.');
    const templateName = file.substring(colonIndex + 1,extensionIndex);
    return new Promise((resolve, reject)  => {

        Fs.readFile(file, 'UTF8', (err, data) => {

            if (err) {
                reject(err);
            }

            const errorRate = Math.floor((Math.random() * 100)); //0-100
            const hasError = errorRate < 20;
            let statusMessage = 'OK';
            if (hasError) {
                statusMessage = 'ERROR';
            }
            const mappingToInsert = {
                _id: {
                    template: templateName,
                    lang
                },
                templateFullName: templateName,
                rml: data,
                version: 1,
                status: {
                    error: hasError,
                    message: statusMessage
                },
                edition: {
                    username: 'admin',
                    comment: 'Imported from Github',
                    date: new Date()
                }
            };

            //Random construction of stats

            const numOcurrences = Math.floor((Math.random() * 5000) + 1); //1-5000
            const numProperties = Math.floor((Math.random() * 300) + 1); //1-300
            const numMappedProperties = Math.floor((Math.random() * numProperties)); //0-numProperties
            const numPropertyOcurrences = Math.floor((Math.random() * 500) + 1); //1-500
            const numMappedPropertyOcurrences = Math.floor((Math.random() * numProperties)); //0-numPropertyOcurrences
            const numPropertiesNotFound = Math.floor((Math.random() * 10)); //0-10
            const mappedPercentage = (numMappedProperties * 100 / numProperties).toFixed(2);
            const statsToInsert = {
                numOcurrences,
                numProperties,
                numMappedProperties,
                numPropertyOcurrences,
                numMappedPropertyOcurrences,
                numPropertiesNotFound,
                mappedPercentage

            };
            mappingToInsert.stats = statsToInsert;


            MongoModels.updateOrCreate(templateName, lang, data,statsToInsert)
                .then( () => {

                    resolve();
                })
                .catch((err) => {

                    reject(err);
                });


        });
    });

};

const process = function (lang,dir,mappingsCollection,statsCollection){

    return new Promise((resolve, reject)  => {

        FileHound.create()
            .ext('ttl')
            .paths(dir)
            .find((err, rmlFiles) => {

                if (err) {
                    return reject(err);
                }

                let sequence = Promise.resolve();

                // Loop over each file, and add on a promise to the
                // end of the 'sequence' promise.
                rmlFiles.forEach((file) => {


                    // Chain one computation onto the sequence
                    sequence = sequence.then(() => {

                        return insertMapping(lang, file, mappingsCollection, statsCollection);
                    });

                });

                return sequence
                    .then(() => {

                        console.log('[INFO] Lang ' + lang + ' imported.');
                        resolve();
                    })
                    .catch((err) => {

                        reject(err);
                    });

            });
    });

};



let mappingsCollection;
let statsCollection;
console.log('* Running first github import');
MongoClient.connect(MONGODB_URI)
    .then((db) => {

        mappingsCollection = db.collection('mappings');
        statsCollection = db.collection('currentMappingStats');

        return getRepository(REPO_URL,REPO_FOLDER,REPO_BRANCH);

    })
    .then(() => {

        const basePath = REPO_FOLDER + '/' +  REPO_MAPPINGS_FOLDER;
        const languageDirs = getDirectories(basePath);
        console.log('[INFO] Importing into DB');
        console.log('');
        let sequence = Promise.resolve();

        languageDirs.forEach((langDir) => {

            const lang = langDir;
            const completeDir = basePath + langDir;
            sequence = sequence.then(() => {

                return process(lang,completeDir,mappingsCollection,statsCollection);
            });

        });


        return sequence;
    })
    .then(() => {

        console.log('');
        console.log('[INFO] Imported successfully.');
        return 'OK';
    })
    .catch((error) => {

        console.log(error);
    });

module.exports = {
    start
};
