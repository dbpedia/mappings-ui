/* global window */
'use strict';
const ApiActions = require('../../actions/api');
const Constants = require('./constants');
const Store = require('./store');

class Actions {
    static sendRequest(data) {
        ApiActions.post(
            '/api/signup',
            data,
            Store,
            Constants.REGISTER,
            Constants.REGISTER_RESPONSE,
            (err, response) => {
                if (!err) {
                    window.location.href = '/profile';
                }
            }
        );
    }
};
module.exports = Actions;
