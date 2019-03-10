'use strict';
const Constants = require('../constants');
const ObjectAssign = require('object-assign');
const ParseValidation = require('../../../../helpers/parse-validation');

const initialState = {
    loading: false
};

const reducer = function (state = initialState, action) {

    if (action.type === Constants.GET_EXTRACTION_TRIPLES) {
        return ObjectAssign({}, initialState, {
            loading: true,
            error: undefined
        });
    }

    if (action.type === Constants.GET_EXTRACTION_TRIPLES_RESPONSE) {
        const validation = ParseValidation(action.response);

        const hasError = action.response.error ;
        const error = validation.error ? validation.error : action.response.message;
        return ObjectAssign({}, initialState, {
            loading: false,
            dump: action.response.dump,
            msg: action.response.msg,
            showModal: !hasError,
            error: hasError ? error : undefined
        });
    }
    return state;
};
module.exports = reducer;
