'use strict';
const Constants = require('../constants');
const ObjectAssign = require('object-assign');
const ParseValidation = require('../../../../helpers/parse-validation');


const initialState = {
    loading: false
};

const reducer = function (state = initialState, action) {

    if (action.type === Constants.GET_RML_TEMPLATE) {
        return ObjectAssign({}, initialState, {
            loading: true
        });
    }

    if (action.type === Constants.GET_RML_TEMPLATE_RESPONSE) {
        const validation = ParseValidation(action.response);

        return ObjectAssign({}, initialState, {
            loading: false,
            errorAlert: validation.error,
            successAlert: !validation.error,
            messageAlert: validation.error ? validation.error : 'Template added successfully'
        });
    }


    return state;
};


module.exports = reducer;
