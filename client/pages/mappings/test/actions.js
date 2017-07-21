/* global window */
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

    static saveDetails(template,lang, data,history) {

        ApiActions.put(
            `/api/mappings/${template}/${lang}`,
            data,
            Store,
            Constants.SAVE_DETAILS,
            Constants.SAVE_DETAILS_RESPONSE
        );
    }

    static hideDetailsSaveSuccess() {

        Store.dispatch({
            type: Constants.HIDE_DETAILS_SAVE_SUCCESS
        });
    }




    static delete(template,lang, history) {

        ApiActions.delete(
            `/api/mappings/${template}/${lang}`,
            undefined,
            Store,
            Constants.DELETE,
            Constants.DELETE_RESPONSE,
            (err, response) => {

                if (!err) {
                    history.push('/mappings');

                    window.scrollTo(0, 0);
                }
            }
        );
    }
}


module.exports = Actions;
