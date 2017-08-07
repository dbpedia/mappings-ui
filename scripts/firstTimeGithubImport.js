

'use strict';
const Git = require('nodegit');
const Fs = require('fs');
const Config = require('../config');
const Path = require('path');
const FileHound = require('filehound');
const Process = require('process');
const MongoClient = require('mongodb').MongoClient;
const MongoModels = require('./githubMappings/mongomodels');

const MONGODB_URI = Config.get('/hapiMongoModels/mongodb/uri');
const REPO_URL = Config.get('/github/repositoryURL');
const REPO_FOLDER = Config.get('/github/repositoryFolder');
const REPO_MAPPINGS_FOLDER = Config.get('/github/repositoryMappingsFolder');
/*
 Returns  a promise with a repository object. If it does not exist, the repository is cloned.
 */
const getRepository = function (repoURL,destFolder){


    return Git.Repository.open(destFolder)
        .then((repo) => {
            //Repository exists, return it immediately
            return repo;
        })
        .catch((err) => {

            //Repo does not exist, clone it
            if (err && err.message.indexOf('failed to resolve path') > -1){
                return cloneRepository(repoURL,destFolder);
            }

            throw err; //Unknown error, throw the error


        });


};

/*
 Clones the github repository
 */
const cloneRepository = function (repoURL,destFolder){

    console.log('[INFO] Cloning repository...');

    return Git.Clone(repoURL,destFolder);


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


const start = function () {

    let mappingsCollection;
    let statsCollection;
    console.log('* Running first github import');
    return MongoClient.connect(MONGODB_URI)
        .then((db) => {

            mappingsCollection = db.collection('mappings');
            statsCollection = db.collection('currentMappingStats');

            return getRepository(REPO_URL,REPO_FOLDER);

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
            Process.exit(1); //Exiting with error code, DO NOT DEPLOY

        });

};

module.exports = {
    start
};
