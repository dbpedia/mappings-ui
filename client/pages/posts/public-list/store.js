'use strict';
const Redux = require('redux');
const Results = require('./reducers/results');

module.exports = Redux.createStore(
    Redux.combineReducers({
        results: Results
    })
);
