/* eslint-disable no-shadow */
/**
 * Created by ismaro3 on 10/08/17.
 * Script that removes old archived mappings from the database.
 * This script should be called from the terminal using 'node cleanMappingsHistory.js'.
 * npm install has to be executed beforehand, so all the dependencies are met.
 */
'use strict';

const MongoClient = require('mongodb').MongoClient;
const Config = require('../config');
const Promptly = require('promptly');
const Moment = require('moment');
const URI = Config.get('/hapiMongoModels/mongodb/uri');

let database;
MongoClient.connect(URI)
    .then((db) => {
        database = db;
        return Promptly.prompt('Do you want to permanently erase deleted mappings? [y/N]: ');
    })
    .then((value) => {
        const response = value.toLowerCase();
        if (response === 'y'){
            return Promptly.prompt('\tDate from which delete mappings [Type * to delete ALL, leave empty to skip]: ')
                .then((value) => {
                    const response = value.toLowerCase();
                    if (response === '*'){
                        return database.collection('mappingsHistory').deleteMany({ deleted:true });
                    }
                    if (response.trim().length === 0){
                        return Promise.resolve();
                    }
                    const date = Moment(response,'DD/MM/YYYY');
                    return database.collection('mappingsHistory').deleteMany({ 'edition.date': { $lte: date } });
                });
        }

        return Promise.resolve();
    })
    .then(() => {
        return Promptly.prompt('Do you want to permanently erase archived mappings? [y/N]: ');
    })
    .then((value) => {
        const response = value.toLowerCase();
        if (response === 'y'){
            return Promptly.prompt('\tDate from which delete mappings [Type * to delete ALL, leave empty to skip]: ')
                .then((value) => {
                    const response = value.toLowerCase();
                    if (response === '*'){
                        return database.collection('mappingsHistory').deleteMany({ deleted:true });
                    }
                    if (response.trim().length === 0){
                        return Promise.resolve();
                    }
                    const date = Moment(response,'DD/MM/YYYY').toDate();
                    return database.collection('mappingsHistory').deleteMany({ 'edition.date': { $lte: date } });
                });

        }

        return Promise.resolve();
    })
    .then(() => {
        console.log('Done!');
    });
