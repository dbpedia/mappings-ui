/**
 * Created by ismaro3 on 18/08/17.
 * Contains functions to interact with the Extraction Framework API.
 */
'use strict';
const Request = require('request');
const Config = require('../../config');
const efURL = Config.get('/extractionFrameworkURL');

/**
 * Validates the syntax of a template.
 * Uses /rml/validate endpoint.
 */
const validateSyntax = function (template,lang,dump){

    const apiRequest = {
        mapping: {
            name: template,
            language: lang,
            dump
        }
    };

    return new Promise((resolve,reject) => {

        Request.post({
            url: efURL + '/server/rml/validate/',
            body: apiRequest,
            json: true
        }, (err, res, payload) => {


            if (err){
                return resolve({ valid: true, msg: 'Validation server not available.' });
            }

            if (res.statusCode >= 500){
                return resolve({ valid: true, msg: 'Validation server not available.' });
            }

            if (res.statusCode >= 400){
                return reject('Bad Request');
            }
            resolve(payload);

        });
    });


};

/**
 * Extracts a dump from a mapping and wikipedia page title
 * Uses /rml/extract endpoint.
 */
const extractDump = function (template,language,dump,wikititle,format){

    const apiRequest = {
        mapping: {
            name: 'Mapping_' + language + ':' + template,
            language,
            dump
        },
        parameters: {
            wikititle,
            format
        }
    };

    return new Promise((resolve,reject) => {

        Request.post({
            url: efURL + '/server/rml/extract',
            body: apiRequest,
            json: true
        }, (err, res, payload) => {


            if (err){
                return reject(err);
            }

            if (res.statusCode >= 400){
                return reject(payload);
            }

            resolve({ dump:payload.dump,msg:payload.msg });

        });
    });



};


/**
 * Gets a list of templates from RML code.
 * Uses /rml/templates endpoint
 */
const templatesFromRML = function (name,language,dump){

    const apiRequest = {
        mapping: {
            name,
            language,
            dump
        }
    };

    return new Promise((resolve,reject) => {

        Request.post({
            url: efURL + '/server/rml/templates',
            body: apiRequest,
            json: true
        }, (err, res, payload) => {


            if (err){
                return reject(err);
            }

            if (res.statusCode >= 400){
                return reject(payload);
            }

            resolve(payload);

        });
    });
};

/**
 * Gets RML from a template
 * Uses /rml/templates/TYPE endpoints
 */
const RMLFromTemplate = function (name,language,dump,templateContent,templateType){

    const apiRequest = {
        template: templateContent,
        mapping: {
            name,
            language,
            dump
        }
    };


    let path = '';
    switch (templateType) {
        case 'SimplePropertyTemplate':
            path = 'simpleproperty';
            break;
        case 'StartDateTemplate':
            path = 'startdate';
            break;
        case 'EndDateTemplate':
            path = 'enddate';
            break;
        case 'ConstantTemplate':
            path = 'constant';
            break;
        case 'GeocoordinateTemplate':
            path = 'geocoordinate';
            break;
        case 'IntermediateTemplate':
            path = 'intermediate';
            break;
        case 'ConditionalTemplate':
            path = 'conditional';
            break;
        default:
            break;
    }

    return new Promise((resolve,reject) => {

        Request.post({
            url: efURL + '/server/rml/templates/' + path,
            body: apiRequest,
            json: true
        }, (err, res, payload) => {


            if (err){
                return reject(err);
            }

            if (res.statusCode >= 400){
                return reject(payload.msg);
            }

            resolve(payload);

        });
    });

};

/**
 * Gets new RML code for new mapping
 * Uses /rml/mappings endpoint
 */
const getNewRML = function (template,language){

    const apiRequest = {
        parameters: {
            template,
            language
        }
    };

    return new Promise((resolve,reject) => {

        Request.post({
            url: efURL + '/server/rml/mappings/',
            body: apiRequest,
            json: true
        }, (err, res, payload) => {

            if (err){
                return resolve('');
            }

            if (res && res.statusCode >= 400){
                return resolve('');
            }

            if (payload && !payload.mapping && !payload.mapping.dump) {
                return resolve('');
            }

            resolve(payload.mapping.dump);

        });
    });


};

/**
 * Gets all datatypes
 * Uses /rml/ontology/datatypes endpoint
 */
const getDatatypes = function (){

    return new Promise((resolve,reject) => {

        Request.get({
            url: efURL + '/server/rml/ontology/datatypes',
            json: true
        }, (err, res2, payload) => {


            if (err){
                return reject(err);
            }

            if (res2 && res2.statusCode >= 400){
                return reject(payload);
            }

            resolve(payload.datatypes);


        });
    });
};

/**
 * Gets all classes
 * Uses /rml/ontology/classes endpoint
 */
const getClasses = function (){

    return new Promise((resolve,reject) => {

        Request.get({
            url: efURL + '/server/rml/ontology/classes',
            json: true
        }, (err, res2, payload) => {


            if (err){
                return reject(err);
            }

            if (res2 && res2.statusCode >= 400){
                return reject(payload);
            }

            resolve(payload.classes);


        });
    });
};

/**
 * Gets all properties
 * Uses /rml/ontology/properties endpoint
 */
const getProperties = function (){

    return new Promise((resolve,reject) => {

        Request.get({
            url: efURL + '/server/rml/ontology/properties',
            json: true
        }, (err, res2, payload) => {


            if (err){
                return reject(err);
            }

            if (res2 && res2.statusCode >= 400){
                return reject(payload);
            }

            resolve(payload.properties);


        });
    });
};


const getStatistics = function (lang){

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


const getInfoboxesOfPage = function (lang,title){

    return new Promise((resolve, reject) => {

        Request.get({
            url: efURL + '/server/rml/' + lang + '/wiki/' + title + '/templates',
            json: true
        }, (err, res, payload) => {


            if (err) {
                return reject(err);
            }

            if (res && res.statusCode >= 400){
                return reject('"' + title + '" page does not have any infoboxes.');
            }

            resolve(payload.templates);

        });
    });

};


module.exports = {
    validateSyntax,
    extractDump,
    templatesFromRML,
    RMLFromTemplate,
    getNewRML,
    getDatatypes,
    getClasses,
    getProperties,
    getStatistics,
    getInfoboxesOfPage
};
