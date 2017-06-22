/* global window */
'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const Store = require('./store');
const Qs = require('qs');


class Actions {


    static getResults(data) {

        ApiActions.get(
            '/api/posts/public',
            data,
            Store,
            Constants.GET_RESULTS,
            Constants.GET_RESULTS_RESPONSE
        );
    }

    static changeSearchQuery(data, history) {

        history.push({
            pathname: '/posts',
            search: `?${Qs.stringify(data)}`
        });

        window.scrollTo(0, 0);
    }


}


module.exports = Actions;
