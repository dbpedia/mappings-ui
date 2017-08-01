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

    if (action.type === Constants.SAVE_DETAILS) {
        return ObjectAssign({}, state, {
            loading: true,
            title: action.request.data.title,
            rml: action.request.data.rml
        });
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

        if (action.response.hasOwnProperty('rml')) {
            stateUpdates.rml = action.response.rml;
        }
        if (action.response.hasOwnProperty('edition')) {
            stateUpdates.edition = {
                username: action.response.edition.username,
                date: action.response.edition.date,
                comment: ''
            };
            stateUpdates.oldComment = action.response.edition.comment;

        }


        return ObjectAssign({}, state, stateUpdates);
    }

    if (action.type === Constants.HIDE_DETAILS_SAVE_SUCCESS) {
        return ObjectAssign({}, state, {
            showSaveSuccess: false
        });
    }

    if (action.type === Constants.GET_TEMPLATE_LIST) {
        return ObjectAssign({}, state, {
            templateObject: {},
            templatesLoading: true
        });
    }

    if (action.type === Constants.GET_TEMPLATE_LIST_RESPONSE) {
        return ObjectAssign({}, state, {
            templateObject: action.response,
            templatesLoading: false
        });
    }

    return state;
};


module.exports = reducer;
