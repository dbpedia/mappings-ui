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

        return ObjectAssign({}, state, {
            hydrated: true,
            loading: false,
            showFetchFailure: !!action.err,
            error: validation.error,
            postId: action.response.postId,
            title: action.response.title,
            visible: action.response.visible,
            markdown: action.response.markdown

        });
    }

    if (action.type === Constants.SAVE_DETAILS) {
        return ObjectAssign({}, state, {
            loading: true,
            title: action.request.data.title,
            markdown: action.request.data.markdown,
            visible: action.request.data.visible,
            postId: action.request.data.postId
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

        if (action.response.hasOwnProperty('title')) {
            stateUpdates.title = action.response.title;
        }
        if (action.response.hasOwnProperty('markdown')) {
            stateUpdates.markdown = action.response.markdown;
        }

        if (action.response.hasOwnProperty('visible')) {
            stateUpdates.visible = action.response.visible;
        }

        if (action.response.hasOwnProperty('postId')) {
            stateUpdates.postId = action.response.postId;
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
