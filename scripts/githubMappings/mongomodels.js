/**
 * Created by ismaro3 on 30/07/17.
 */
'use strict';
const Config = require('../../config');
const MongoModels = require('mongo-models');
const Mapping = require('../../server/models/mapping.js');
const URI = Config.get('/hapiMongoModels/mongodb/uri');


let dbConnection;
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

//Delete a mapping from the DB
const deleteMapping = function (template,lang) {

    const query = { _id: { template, lang } };
    const username = 'githubSyncProcess';

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

//Create a mapping on the DB
const createMapping = function (template,lang,rml) {

    const comment = 'Imported from Github';
    const username = 'GithubScript';


    return connectToDB()
        .then(() => {

            return new Promise((resolve, reject) => {

                Mapping.create(template,lang, rml, username,comment, (err, mapping) => {


                    if (err) {
                        return reject(err);
                    }

                    resolve('OK');
                });
            });
        });

};

const updateOrCreate = function (template,lang,rml) {

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
                        return createMapping(template,lang,rml)
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

                            return resolve(updatedRes);

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
    updateOrCreate
};
