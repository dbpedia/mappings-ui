/* global window */
'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const Store = require('./store');
const Qs = require('qs');


class Actions {

    static getResults(data) {

        ApiActions.get(
            '/api/mappings-history/deleted',
            data,
            Store,
            Constants.GET_RESULTS,
            Constants.GET_RESULTS_RESPONSE
        );
    }

    static changeSearchQuery(data, history) {


        history.push({
            pathname: '/mappings/history/deleted',
            search: `?${Qs.stringify(data)}`
        });

        window.scrollTo(0, 0);
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

    static delete(template,lang,history) {

        ApiActions.delete(
            `/api/mappings-history/${template}/${lang}`,
            {},
            Store,
            Constants.DELETE,
            Constants.DELETE_RESPONSE,
            (err, response) => {

                if (!err) {
                    history.push('/mappings/history/deleted');

                    window.scrollTo(0, 0);
                }
            }
        );
    }



}


module.exports = Actions;
