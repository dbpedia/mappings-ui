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
}


module.exports = Actions;
