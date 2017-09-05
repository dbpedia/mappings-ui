'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const Store = require('./store');


class Actions {
    static getDetails(template,lang) {

        ApiActions.get(
            `/api/mappings/${template}/${lang}`,
            undefined,
            Store,
            Constants.GET_DETAILS,
            Constants.GET_DETAILS_RESPONSE
        );
    }

    //Used to update the template object used to show the template overview
    static extractTriples(template,lang,dump,wikititle,format){

        const data = {
            mappingName: template,
            mappingLang: lang,
            mappingDump: dump,
            wikititle,
            format
        };


        ApiActions.post(
            '/api/mappings/extract',
            data,
            Store,
            Constants.GET_EXTRACTION_TRIPLES,
            Constants.GET_EXTRACTION_TRIPLES_RESPONSE
        );

    }

    //Used to update the template object used to show the template overview
    static getTemplatesFromRML(template,lang,dump){

        const data = {
            mappingName: template,
            mappingLang: lang,
            mappingDump: dump
        };

        ApiActions.post(
            '/api/mappings/templates',
            data,
            Store,
            Constants.GET_TEMPLATE_LIST,
            Constants.GET_TEMPLATE_LIST_RESPONSE
        );

    }
}


module.exports = Actions;
