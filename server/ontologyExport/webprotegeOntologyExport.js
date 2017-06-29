/**
 * Created by ismaro3 on 29/06/17.
 */
'use strict';
const Wreck = require('wreck');
const Fs = require('fs');
const Unzip = require('unzip');
const Mkdirp = require('mkdirp');
const Config = require('../../config');

//Todo: webprotege URL according to project
const TEMP_DIRECTORY = Config.get('/webProtegeIntegration/tempDirectory');
const ONTOLOGY_DIRECTORY = Config.get('/webProtegeIntegration/githubRepositoryFolder');
const ZIP_FILE_PATH = TEMP_DIRECTORY + '/ontology.zip';
const ONTOLOGY_PATH = ONTOLOGY_DIRECTORY + '/' + Config.get('/webProtegeIntegration/ontologyFileNameOutput');
const ONTOLOGY_FILE_TO_EXTRACT = Config.get('/webProtegeIntegration/ontologyFileNameInputZip');
const ONTOLOGY_URL = Config.get('/webProtegeIntegration/webProtegeURL') + '/download?project=93919fae-e264-4a52-811b-36c52355329c&format=owx';



//Downloads the ontology from WebProtege, storing the file in ONTOLOGY_PATH.
//Returns, as a promise, the path of the ontology file when finished.
//Method is asynchronous, does not block the server
const downloadOntology = function (){


    return new Promise((resolve, reject)  => {


        //Get the ontology
        Wreck.get(ONTOLOGY_URL, (err, res, payload) => {

            const myResolve = resolve;
            const myReject = reject;
            if (err) {
                //Report error, stop processing
                reject(err);
            }


            //Create temp directory
            createDirectory(TEMP_DIRECTORY)
            //Create directory where ontology will be saved
                .then(() => {

                    return createDirectory(ONTOLOGY_DIRECTORY);
                })
                //Save zip file to ZIP_FILE_PATH
                .then(() => {

                    return saveBuffer(payload, ZIP_FILE_PATH);
                })
                //Extract ontology file (with name ONTOLOGY_FILE_TO_EXTRACT)
                .then(() => {

                    return extractFileFromZip(ZIP_FILE_PATH, ONTOLOGY_PATH, ONTOLOGY_FILE_TO_EXTRACT);
                })
                //Remove ZIP file from Fs
                .then(() => {

                    return removeFile(ZIP_FILE_PATH);
                })
                //Finish promise, returning the path where the ontology file is
                .then(() => {

                    myResolve(ONTOLOGY_PATH);
                })
                .catch((error) => {

                    myReject(error);
                });

        });
    });

};





/*
 Creates a directory and all the needed parents in path.
 */
const createDirectory = function (path){

    return new Promise((resolve, reject)  => {

        Mkdirp(path, (err) => {

            if (err) {
                reject(err);
            }
            else {
                resolve('Directory created');
            }
        });
    });


};

/*
    Saves a binary buffer to a certain path. Parent directories must exist.
 */
const saveBuffer = function (buffer,path){

    return new Promise((resolve, reject)  => {

        Fs.writeFile(path, buffer,  'binary', (err)  => {

            if (err) {
                reject(err);
            }
            else {
                resolve('File created');
            }
        });
    });
};


/*
    Extracts a file located inside a ZIP file, from source to dest. File must contain "file"
 */
const extractFileFromZip = function (source,dest,file){

    return new Promise( (resolve, reject)  => {

        Fs.createReadStream(source)
            .pipe(Unzip.Parse())
            .on('entry', (entry) => {

                const fileName = entry.path;
                if (fileName.includes(file)) {
                    //Resolve the promise when file's been written.
                    entry.pipe(Fs.createWriteStream(dest).on('finish',() => resolve(true)));

                }
                else {
                    entry.autodrain();
                }
            });


    });

};


/*
 Removes the file specified by path.
 */
const removeFile = function (path){

    return new Promise((resolve, reject)  => {

        Fs.unlink(path, (err) => {

            if (err) {
                reject(err);
            }
            else {
                resolve('File removed');
            }

        });
    });


};

module.exports = {
    downloadOntology
};
