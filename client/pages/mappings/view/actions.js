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
    static extractTriples(template,lang,dump,wikititle){

        const data = {
            mappingName: template,
            mappingLang: lang,
            mappingDump: dump,
            wikititle
        };

        ApiActions.post(
            '/api/mappings/extract',
            data,
            Store,
            Constants.GET_EXTRACTION_TRIPLES,
            Constants.GET_EXTRACTION_TRIPLES_RESPONSE
        );

    }
}


module.exports = Actions;
