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
    postId: undefined,
    title: undefined,
    visible: undefined,
    markdown: undefined
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


        //oldComment will store the old comment, while edition.comment will store the new one
        const stateUpdates = {
            hydrated: true,
            loading: false,
            showFetchFailure: !!action.err,
            error: validation.error,
            _id: action.response._id,
            rml: action.response.rml,
            version: action.response.version,
            status: action.response.status,
            stats: action.response.stats,
            oldComment: action.response.edition ? action.response.edition.comment : '',
            edition: action.response.edition
        };


        stateUpdates.edition.comment = '';
        return ObjectAssign({}, state, stateUpdates);
    }

    if (action.type === Constants.RESTORE) {
        return ObjectAssign({}, state, {
            loading: true
        });
    }

    if (action.type === Constants.RESTORE_RESPONSE) {

        //TODO: Go to history of mapping
    }


    return state;
};


module.exports = reducer;
