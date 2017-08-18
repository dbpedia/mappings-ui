/**
 * Created by ismaro3 on 18/08/17.
 */
'use strict';
const Request = require('request');
const Config = require('../../config');
const efURL = Config.get('/extractionFrameworkURL');

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


module.exports = {
    validateSyntax
};
