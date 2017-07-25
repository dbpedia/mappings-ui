'use strict';
const Constants = require('../constants');
const ObjectAssign = require('object-assign');


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


        return ObjectAssign({}, initialState, {
            loading: false
        });
    }


    return state;
};


module.exports = reducer;
