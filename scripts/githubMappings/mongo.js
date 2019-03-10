/**
 * Created by ismaro3 on 17/07/17.
 * Functionality for interacting with MongoDB to get all the mappings and indicate update status.
 */
'use strict';
const MongoClient = require('mongodb').MongoClient;
const Config = require('../../config');
const URI = Config.get('/hapiMongoModels/mongodb/uri');

let database;
/**
 * Returns a database db object and the webprotege dbpedia project _id.
 */
const connectToDB = function (){
    if (database){
        return Promise.resolve(database);
    }

    //Returns a promise when everything is finished
    return MongoClient.connect(URI)
        .then((db) => {
            database = db; //Store database object
            return db;
        });
};

const getMappings = function (){
    return connectToDB()
        .then((db) => {
            return db.collection('mappings').find();
        })
        .catch((err) => {
            console.log(err);
        });
};

const startProcess = function () {
    return connectToDB()
        .then((db) => {
            const updateStatusCol = db.collection('mappingUpdateStatus');
            const document =
                {
                    startDate: new Date(),
                    status: {
                        error: false,
                        message: 'RUNNING',
                        long_message: ''
                    }
                };

            return updateStatusCol.insertOne(document);
        })
        .then((res) => {

            return res.insertedId; //Return the _id to later modify it
        })
        .catch((err) => {

            throw { code: 'ERROR_INSERT_INITIAL_STATUS_MONGODB', msg: err };
        });
};

const endProcess = function (id,error,message,longMessage) {
    return connectToDB()
        .then((db) => {
            const updateStatusCol = db.collection('mappingUpdateStatus');
            const update =
                {
                    $set: {
                        endDate: new Date(),
                        status: {
                            error,
                            message,
                            longMessage
                        }
                    }

                };

            return updateStatusCol.findOneAndUpdate({ _id: id }, update);
        })
        .catch((err) => {

            throw { code: 'ERROR_INSERT_FINAL_STATUS_MONGODB', msg: err };
        });
};

module.exports = {
    getMappings,
    startProcess,
    endProcess
};

