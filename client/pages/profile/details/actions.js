'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const Store = require('./store');

class Actions {
    static getDetails() {
        ApiActions.get(
            '/api/accounts/my',
            undefined,
            Store,
            Constants.GET_DETAILS,
            Constants.GET_DETAILS_RESPONSE
        );
    }

    static getGroupOptions() {
        ApiActions.get(
            '/api/account-groups',
            undefined,
            Store,
            Constants.GET_GROUP_OPTIONS,
            Constants.GET_GROUP_OPTIONS_RESPONSE
        );
    }

    static saveDetails(data) {
        ApiActions.put(
            '/api/accounts/my',
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

    static savePassword(data) {
        if (data.password !== data.passwordConfirm) {
            return Store.dispatch({
                type: Constants.SAVE_PASSWORD_RESPONSE,
                err: new Error('password mismatch'),
                response: {
                    message: 'Passwords do not match.'
                }
            });
        }
        delete data.passwordConfirm;
        ApiActions.put(
            '/api/accounts/my/password',
            data,
            Store,
            Constants.SAVE_PASSWORD,
            Constants.SAVE_PASSWORD_RESPONSE
        );
    }

    static hidePasswordSaveSuccess() {

        Store.dispatch({
            type: Constants.HIDE_PASSWORD_SAVE_SUCCESS
        });
    }
}
module.exports = Actions;
