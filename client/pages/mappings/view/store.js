'use strict';
const Details = require('./reducers/details');
const Redux = require('redux');


module.exports = Redux.createStore(
    Redux.combineReducers({
        details: Details
    })
);
