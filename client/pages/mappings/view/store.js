'use strict';
const Details = require('./reducers/details');
const Test = require('./reducers/test');
const Redux = require('redux');


module.exports = Redux.createStore(
    Redux.combineReducers({
        details: Details,
        test: Test
    })
);
