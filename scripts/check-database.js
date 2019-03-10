/**
 * Checks if database needs to be set-up or not. Returns 0 if already set-up, 1 if not.
 */
'use strict';

const MongoClient = require('mongodb').MongoClient;
const Config = require('../config');
const URI = Config.get('/hapiMongoModels/mongodb/uri');
let database;
/**
 * Returns a database db object and the webprotege dbpedia project _id.
 */
const maxTries = 10;
let tries = 0;
const connectToDB = function (){

    if (database){
        return Promise.resolve(database);
    }

    //Returns a promise when everything is finished
    return MongoClient.connect(URI)
        .then((db) => {
            database = db; //Store database object
            return db;
        })
        .catch((err) => {
            if (tries < maxTries){
                tries++;
                console.log('Sleeping. Retrying in 2000ms... ');
                return sleep(2000)
                    .then(() => {

                        return connectToDB();
                    });
            }
            throw err;
        });
};

const sleep = function (ms) {

    return new Promise((resolve) => setTimeout(resolve, ms));
};

const main = function (){
    return connectToDB()
        .then((db) => {
            const collection = db.collection('accounts');
            return collection.count();
        })
        .then((res) => {
            if (res === 0) {
                throw '[INFO] DB not initialized, initializing...';
            }
            console.log('[OK] DB is already initialized.');
            return process.exit(0);     //If everything is correct, we return 0
        })
        .catch((err) => {           //In case of error, we return 1
            console.log(err);
            return process.exit(1);
           //console.log(err);
        });
};
main();
