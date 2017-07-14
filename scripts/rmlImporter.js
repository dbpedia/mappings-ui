/**
 * Created by ismaro3 on 11/07/17.
 */
'use strict';
const Gift = require('gift');
const Fs = require('fs');
const Path = require('path');
const FileHound = require('filehound');
const MongoClient = require('mongodb').MongoClient;


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

const getDirectories = function (srcpath) {

    return Fs.readdirSync(srcpath)
        .filter( (file) => Fs.lstatSync(Path.join(srcpath, file)).isDirectory());
};


const insertMapping = function (lang,file,mappingsCollection, statsCollection){


    const colonIndex = file.indexOf(':');
    const extensionIndex = file.lastIndexOf('.');
    const templateName = file.substring(colonIndex + 1,extensionIndex);
    console.log('>' + templateName);
    Fs.readFile(file ,'UTF8', (err, data) => {

        if (err) {
            throw err;
        }

        const errorRate = Math.floor((Math.random() * 100)); //0-100
        const hasError = errorRate < 20;
        let statusMessage = 'OK';
        if (hasError){
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
            edition:{
                username: 'admin',
                comment: 'Imported from Github',
                date: new Date()
            }
        };

        //Random construction of stats

        const numOcurrences = Math.floor((Math.random() * 5000) + 1); //1-5000
        const numProperties = Math.floor((Math.random() * 300) + 1); //1-300
        const numMappedProperties = Math.floor((Math.random() * numProperties) ); //0-numProperties
        const numPropertyOcurrences = Math.floor((Math.random() * 500) + 1); //1-500
        const numMappedPropertyOcurrences = Math.floor((Math.random() * numProperties) ); //0-numPropertyOcurrences
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



        mappingsCollection.insertOne(mappingToInsert)
            .catch((c) => {

                console.log(c);
            });




    });

};

const process = function (lang,dir,mappingsCollection,statsCollection){

    console.log('>' + lang);

    FileHound.create()
        .ext('ttl')
        .paths(dir)
        .find((err, rmlFiles) => {

            if (err) {
                return console.error('handle err', err);
            }

            //rmlFiles contains an array with the rmlFiles on the directory of lang 'lang'
            rmlFiles.forEach((file) => {

                insertMapping(lang,file,mappingsCollection, statsCollection);
            });


            //console.log(rmlFiles);
        });

};


let mappingsCollection;
let statsCollection;
const URI = 'mongodb://localhost:27017/aqua';
const REPO = 'https://github.com/dbpedia/mappings-tracker.git';
const BRANCH = 'master';
const DESTINATION = 'ef';
MongoClient.connect(URI)
    .then((db) => {

        mappingsCollection = db.collection('mappings');
        statsCollection = db.collection('currentMappingStats');

        return getRepository(REPO,DESTINATION,BRANCH);

    })
    .then((repo) => {
        //console.log('ok');
        const basePath = './' + DESTINATION + '/mappings/';
        const languageDirs = getDirectories(basePath);

        languageDirs.forEach((langDir) => {

            const lang = langDir;
            const completeDir = basePath + langDir;
            process(lang,completeDir,mappingsCollection,statsCollection);

        });
        //console.log(getDirectories(basePath));
    })
    .catch((error) => {

        console.log(error);
    });

