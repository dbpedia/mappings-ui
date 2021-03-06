'use strict';
const Constants = require('../constants');
const ObjectAssign = require('object-assign');
const ParseValidation = require('../../../../helpers/parse-validation');


const initialState = {
    hydrated: false,
    loading: false,
    showFetchFailure: false,
    showSaveSuccess: false,
    error: undefined,
    hasError: {},
    help: {},
    _id: undefined,
    name: {},
    username: undefined,
    email: {},
    isActive: false,
    activeChangeloading: false
};
const reducer = function (state = initialState, action) {

    if (action.type === Constants.GET_DETAILS) {
        return ObjectAssign({}, initialState, {
            hydrated: false,
            loading: true
        });
    }

    if (action.type === Constants.GET_DETAILS_RESPONSE) {
        const validation = ParseValidation(action.response);

        return ObjectAssign({}, state, {
            hydrated: true,
            loading: false,
            showFetchFailure: !!action.err,
            error: validation.error,
            _id: action.response._id,
            name: action.response.name,
            username: action.response.username,
            email: action.response.email,
            isActive: action.response.isActive,
            timeLastLogin: action.response.timeLastLogin,
            timeCreated: action.response.timeCreated,
            mappingsLang: action.response.mappingsLang
        });
    }

    if (action.type === Constants.SAVE_DETAILS) {
        return ObjectAssign({}, state, {
            loading: true,
            name: action.request.data.name,
            email: action.request.data.email,
            username: action.request.data.username,
            mappingsLang: action.request.data.mappingsLang
        });
    }

    if (action.type === Constants.CHANGE_ACTIVE) {
        return ObjectAssign({}, state, {
            activeChangeLoading: true,
            isActive: action.request.data.isActive
        });
    }

    if (action.type === Constants.CHANGE_ACTIVE_RESPONSE) {
        const stateUpdates = {
            activeChangeLoading: false
        };

        if (action.response.hasOwnProperty('isActive')) {
            stateUpdates.isActive = action.response.isActive;
        }

        return ObjectAssign({}, state, stateUpdates);
    }



    if (action.type === Constants.SAVE_DETAILS_RESPONSE) {
        const validation = ParseValidation(action.response);
        const stateUpdates = {
            loading: false,
            showSaveSuccess: !action.err,
            error: validation.error,
            hasError: validation.hasError,
            help: validation.help
        };

        if (action.response.hasOwnProperty('name')) {
            stateUpdates.name = action.response.name;
        }
        if (action.response.hasOwnProperty('username')) {
            stateUpdates.username = action.response.username;
        }
        if (action.response.hasOwnProperty('email')) {
            stateUpdates.email = action.response.email;
        }


        if (action.response.hasOwnProperty('mappingsLang')) {
            stateUpdates.mappingsLang = action.response.mappingsLang;
        }

        return ObjectAssign({}, state, stateUpdates);
    }

    if (action.type === Constants.HIDE_DETAILS_SAVE_SUCCESS) {
        return ObjectAssign({}, state, {
            showSaveSuccess: false
        });
    }

    return state;
};


module.exports = reducer;
