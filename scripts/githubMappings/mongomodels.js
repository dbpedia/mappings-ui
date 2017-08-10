/**
 * Created by ismaro3 on 30/07/17.
 * Stores functionality for interacting with mappings and mappings-history models on DB.
 */
'use strict';
const Config = require('../../config');
const MongoModels = require('mongo-models');
const Mapping = require('../../server/models/mapping.js');
const MappingHistory = require('../../server/models/mapping-history.js');
const URI = Config.get('/hapiMongoModels/mongodb/uri');


let dbConnection;
/**
 * Function to connect to DB. Reuses the same connection always.
 */
const connectToDB = function (){

    if (dbConnection){
        return  Promise.resolve(dbConnection);
    }

    return new Promise((resolve,reject) => {

        MongoModels.connect(URI,{}, (err,db) => {

            if (err){
                reject(err);
            }
            else {
                dbConnection = db;
                resolve(db);
            }
        });
    });

};


const setMappingStatus = function (template,lang,error,message){

    const query = { _id: { template,lang } };
    const update = { $set: { status: { error,message } } };

    return connectToDB()
        .then(() => {

            return new Promise((resolve,reject) => {

                Mapping.findOneAndUpdate(query,update,(err,res) => {

                    if (err) {
                        return reject('Error updating mapping status');
                    }


                    //Mapping may be not found, maybe it was archived in the meanwhile... OK
                    return resolve('Mapping status updated');

                });
            });
        });



};
/**
 * Deletes a mapping.
 */
const deleteMapping = function (template,lang) {

    const query = { _id: { template, lang } };
    const username = 'GithubScript';

    return connectToDB()
        .then(() => {

            return new Promise((resolve,reject) => {

                Mapping.findOne(query, (err, mapping) => {

                    if (err) {
                        return reject('Error retrieving mapping');
                    }

                    //Not an error, may be deleted in both
                    if (!mapping){
                        return resolve('Mapping not found.');
                    }

                    //Archive and mark as deleted. Automatically deleted from main collection
                    mapping.archive(true, username, (err, res) => {

                        if (err) {
                            return reject('Error archiving the old mapping.');
                        }

                        resolve('OK');
                    });


                });
            });
        });
};

/**
 * Creates a mapping. When imported from github, its status is set to OK
 */
const createMapping = function (template,lang,rml,statsToInsert) {

    const comment = 'Imported from Github';
    const username = 'GithubScript';


    return connectToDB()
        .then(() => {

            return new Promise((resolve, reject) => {

                Mapping.create(template,lang, rml, username,comment, (err, mapping) => {


                    if (err) {
                        return reject(err);
                    }

                    //Set status to OK, as external changes are seen as good
                    Mapping.findOneAndUpdate({ _id: { template,lang } }, { $set: { status: { error: false, message: 'OK' } } }, (err2,res2) => {

                        if (err2) {
                            return reject(err2);
                        }

                        if (statsToInsert) {
                            Mapping.findOneAndUpdate({ _id:{ template,lang } },{ $set: { stats:statsToInsert } },(err3,res3) => {

                                if (err3) {
                                    return reject(err3);
                                }
                                resolve('OK');
                            });
                        }
                        else {
                            resolve('OK');
                        }
                    });


                });
            });
        });

};

/**
 * Updates or creates a mapping.
 */
const updateOrCreate = function (template,lang,rml,statsToInsert) {

    return connectToDB()
        .then(() => {

            const _id = {
                template,
                lang
            };

            return new Promise((resolve,reject) => {

                Mapping.findOne({ _id }, (err,mapping) => {

                    if (err){
                        return reject('Error while finding mapping');
                    }

                    if (!mapping) {
                        return createMapping(template,lang,rml,statsToInsert)
                            .then(() => {

                                resolve();
                            });
                    }
                    return updateMapping(template,lang,rml)
                        .then(() => {

                            resolve();
                        });

                });
            });

        });
};

/**
 * Returns {username,message} object with username of last change and edition message.
 * Searchs on active mappings. If deleted, searchs on history. If not found, no info.
 */
const getChangeInfo = function (template,lang,deleted){

    return connectToDB()
        .then(() => {

            if (!deleted){
                return new Promise((resolve, reject) => {

                    Mapping.findOne({ _id: { template, lang } }, (err, mapping) => {

                        if (err) {
                            return reject({ code: 'ERROR_GETTING_CHANGE_MESSAGE', msg: err });
                        }

                        if (!mapping) {
                            return resolve({ username: 'Unknown', message: 'No commit info' });
                        }

                        resolve({ username: mapping.edition.username, message: mapping.edition.comment });
                    });
                });
            }

            return new Promise((resolve, reject) => {
                //In case mapping was deleted, search on deleted
                Mapping.getLastVersion(template, lang, (err, version) => {

                    if (err) {
                        return reject({ code: 'ERROR_GETTING_CHANGE_MESSAGE', msg: err });
                    }

                    if (version < 0){
                        return resolve({ username: 'Unknown', message: 'Permanently deleted mapping' });
                    }

                    MappingHistory.findOne({ _id: { template,lang,version } }, (err,mapping) => {

                        if (err) {
                            return reject({ code: 'ERROR_GETTING_CHANGE_MESSAGE', msg: err });
                        }

                        if (!mapping || !mapping.deletion) {
                            return resolve({ username: 'Unknown', message: 'Permanently deleted mapping' });
                        }

                        resolve({ username: mapping.deletion.username, message: 'Deleted mapping' });

                    });


                });

            });

        });


};

/**
 * Updates a mapping
 */
const updateMapping = function (template,lang,rml) {

    const comment = 'Updated from Github';
    const username = 'GithubScript';


    return connectToDB()
        .then(() => {

            return new Promise((resolve, reject) => {

                const _id = {
                    template,
                    lang
                };
                const update = { rml };



                /* First, find the document */
                Mapping.findOne({ _id }, (err,mapping) => {


                    if (err){
                        return reject('Error while finding mapping');
                    }

                    //Is not an error, is possible that deleted in DB but not in Github
                    if (!mapping){
                        return resolve('Mapping not found.');
                    }

                    /*Then, archive the document */
                    mapping.archive(false,username, (err,res) => {

                        if (err){
                            return reject('Error while archiving mapping');
                        }

                        /*Finally, document is updated */
                        mapping.update(update,username,comment, (err,updatedRes) => {

                            if (err) {
                                return reject('Error while updating mapping');
                            }

                            Mapping.findOneAndUpdate({ _id: { template,lang } }, { $set: { status: { error: false, message: 'OK' } } }, (err2,res2) => {

                                if (err2) {
                                    return reject('Error while updating mapping');
                                }

                                return resolve(res2);
                            });




                        });

                    });
                });
            });
        });

};

module.exports = {
    deleteMapping,
    createMapping,
    updateMapping,
    updateOrCreate,
    getChangeInfo,
    setMappingStatus
};
