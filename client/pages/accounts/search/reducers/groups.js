'use strict';
const Constants = require('../constants');
const ObjectAssign = require('object-assign');

const initialState = {
    loading: true,
    options: []
};
const reducer = function (state = initialState, action) {
    if (action.type === Constants.GET_GROUP_OPTIONS) {
        return ObjectAssign({}, initialState, {
            loading: true
        });
    }

    if (action.type === Constants.GET_GROUP_OPTIONS_RESPONSE) {
        const stateUpdates = {};
        if (action.response.hasOwnProperty('data')) {
            stateUpdates.options = action.response.data;
            stateUpdates.loading = false;
        }
        return ObjectAssign({}, state, stateUpdates);
    }
    return state;
};
module.exports = reducer;
