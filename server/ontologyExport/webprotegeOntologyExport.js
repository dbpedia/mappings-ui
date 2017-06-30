/**
 * Created by ismaro3 on 29/06/17.
 * Module used for getting ontology files from the WebProtege instance, and extracting them into
 * a local folder and a github repository folder.
 */
'use strict';
const Wreck = require('wreck');
const Fs = require('fs');
const Unzip = require('unzip');
const Mkdirp = require('mkdirp');
const Config = require('../../config');


const TEMP_DIRECTORY = Config.get('/webProtegeIntegration/tempDirectory');
const GIT_ONTOLOGY_DIRECTORY = Config.get('/webProtegeIntegration/githubRepositoryFolder');
const LOCAL_ONTOLOGY_DIRECTORY = Config.get('/webProtegeIntegration/localOntologyFolder');
const LOCAL_ONTOLOGY_BASE_PATH = LOCAL_ONTOLOGY_DIRECTORY + '/' + Config.get('/webProtegeIntegration/ontologyFileBaseName');
const GIT_ONTOLOGY_BASE_PATH = GIT_ONTOLOGY_DIRECTORY + '/' + Config.get('/webProtegeIntegration/ontologyFileBaseName');

const ONTOLOGY_FILE_TO_EXTRACT = Config.get('/webProtegeIntegration/ontologyFileNameInputZip');
const ONTOLOGY_FORMATS = Config.get('/webProtegeIntegration/ontologyFormats');
const formats = ONTOLOGY_FORMATS.split(',');




/**
 * Downloads ontology files in desired formats. Returns a promise that ends when all files have been downloaded and
 * extracted in the local and repository folders.
 */
const downloadOntologyFiles = function (projectID,revision){

    const promises = [];
    formats.forEach((format) => {

        promises.push(
            downloadOntology(projectID,revision,format)
        );
    });

    return Promise.all(promises);


};

/**
 * Downloads the ontology from WebProtege in certain format.
 * Also, stores the result in LOCAL_ONTOLOGY_BASE_PATH and GIT_ONTOLOGY_BASE_PATH.
 * Returns, as promise, the path of the local ontology file when finished.
 * Async method, does not block.
 */


const downloadOntology = function (projectID,revision,format){

    //Path of the downloaded zip file
    const ZIP_FILE_PATH = TEMP_DIRECTORY + '/ontology-' + format + '.zip';

    //Path of output ontology file (local directory)
    const LOCAL_OUTPUT_FILE = LOCAL_ONTOLOGY_BASE_PATH + '.' + format;
    const GIT_OUTPUT_FILE = GIT_ONTOLOGY_BASE_PATH + '.' + format;


    //Calculate URL
    let ontologyURL = Config.get('/webProtegeIntegration/webProtegeURL') + '/download';
    ontologyURL += '?project=' + projectID;
    if (revision !== 0){ //If revision is 0, we get the HEAD
        ontologyURL += '&revision=' + revision;
    }
    ontologyURL += '&format=' + format;


    return new Promise((resolve, reject) => {
        //Get the ontology
        Wreck.get(ontologyURL, (err, res, payload) => {

            const myResolve = resolve;
            const myReject = reject;

            if (err) {
                //Report error, stop processing
                reject(err);
                return;

            }


            //Create temp directory
            createDirectory(TEMP_DIRECTORY)
                //Create directory where ontology will be saved locally
                .then(() => {

                    return createDirectory(LOCAL_ONTOLOGY_DIRECTORY);
                })
                //Save zip file to ZIP_FILE_PATH (in temp folder)
                .then(() => {

                    return saveBuffer(payload, ZIP_FILE_PATH);
                })
                //Extract ontology file (with name ONTOLOGY_FILE_TO_EXTRACT)
                .then(() => {

                    return extractFileFromZip(ZIP_FILE_PATH, LOCAL_OUTPUT_FILE , ONTOLOGY_FILE_TO_EXTRACT);
                })
                //Copy file from local to git folder
                .then(() => {

                    return copyFile(LOCAL_OUTPUT_FILE,GIT_OUTPUT_FILE);
                })
                //Remove ZIP file from Fs
                .then(() => {

                    return removeFile(ZIP_FILE_PATH);
                })
                //Finish promise, returning the path where the ontology file is
                .then(() => {

                    myResolve(LOCAL_OUTPUT_FILE);
                })
                .catch((error) => {

                    myReject(error);
                });

        });
    });


};


/**
 * Queries the webprotege instance about the last version of the project identified by projectID.
 * @param projectID
 * @returns {Promise}
 */
const getCurrentVersion = function (projectID){

    const versionURL = Config.get('/webProtegeIntegration/webProtegeURL') + '/version?project=' + projectID;

    return new Promise((resolve, reject) => {

        Wreck.get(versionURL, (err, res, payload) => {

            if (err) {
                reject(err);
                return;
            }

            const result = payload.toString('utf-8');


            resolve(JSON.parse(result).version);



        });
    });

};


/**
 * Copies a file from src to dst, asynchronously.
 */
const copyFile = function (src,dst){

    return new Promise( (resolve, reject)  => {

        const rd = Fs.createReadStream(src);
        rd.on('error', (err)  => {

            reject(err);
        });
        const wr = Fs.createWriteStream(dst);
        wr.on('error', (err)  => {

            reject(err);

        });
        wr.on('close', (ex)  => {

            resolve(true);
        });
        rd.pipe(wr);

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

/**
 * Saves a binary buffer to a certain path. Parent directories must exist.
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


/**
 * Extracts a file located inside a ZIP file, from source to dest. File must contain "file"
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


/**
 * Removes the file specified by path.
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
    downloadOntologyFiles,
    getCurrentVersion,
    copyFile
};
