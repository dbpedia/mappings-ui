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
            lastEdition: action.response.lastEdition,
            creation: action.response.creation,
            markdown: action.response.markdown

        });
    }


    return state;
};


module.exports = reducer;
