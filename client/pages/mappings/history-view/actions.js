'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const Store = require('./store');

class Actions {
    static getDetails(template,lang,version) {
        ApiActions.get(
            `/api/mappings-history/${template}/${lang}/${version}`,
            undefined,
            Store,
            Constants.GET_DETAILS,
            Constants.GET_DETAILS_RESPONSE
        );
    }

    static restore(template,lang, version,history) {
        ApiActions.post(
            `/api/mappings-history/${template}/${lang}/${version}`,
            {},
            Store,
            Constants.RESTORE,
            Constants.RESTORE_RESPONSE,
            (err, response) => {
                if (!err) {
                    history.push('/mappings/view/' + template + '/' + lang);

                    window.scrollTo(0, 0);
                }
            }
        );
    }
}
module.exports = Actions;
