/**
 * Created by ismaro3 on 29/06/17.
 * This module has functions for updating stats from EF.
 */
'use strict';
const Moment = require('moment');
const Languages = require('../languages');
const Request = require('request');
const MongoClient = require('mongodb').MongoClient;

const Config = require('../../config');
const efURL = Config.get('/extractionFrameworkURL');
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

const retrieveUpdate = function (lang) {

    return new Promise((resolve, reject) => {

        Request.get({
            url: efURL + '/server/rml/' + lang + '/statistics/',
            json: true
        }, (err, res, payload) => {


            if (err) {
                return reject(err);
            }

            if (res && res.statusCode >= 400){
                return reject('No stats available for language ' + lang);
            }

            resolve(payload);

        });
    });


};

const updateStats = function (lang,content){

    //1. Connect to DB
    //2. For each one, update or insert, replacing
    return connectToDB()
        .then((db) => {

            const collection = db.collection('mappings');
            return collection;

        })
        .then((col) => {

            const promises = [];
            content.forEach((item) => {

                const update = {
                    $set: {
                        stats: {
                            numOcurrences: item.count,
                            numProperties: item.propertiesCount,
                            numMappedProperties: item.mappedPropertiesCount,
                            mappedPercentage: item.mappedRatio.toFixed(2)
                        }
                    }
                };

                promises.push(
                  col.update({ _id:{ template:item.name,lang } }, update)
                );
            });

            return Promise.all(promises);

        })
        .catch((err) => {

            console.log(err);
            throw err;
        });

};


const doAction = function () {

    const updateDate = Moment(new Date()).format('DD/MM hh:mm:ss');
    console.log('* Starting stats update at ' + updateDate);

    const promises = [];

    Languages.forEach((lang) => {

        const p =
            retrieveUpdate(lang.tag)        //1.- Retrieve updated stats data from EF
                .then((res) => {

                    return updateStats(lang.tag,res.statistics);
                })
                .catch(() => {

                });

        promises.push(p);
    });


    return Promise.all(promises);
};

//doAction();

module.exports = {
    doAction
};


