'use strict';
const Redux = require('redux');
const Results = require('./reducers/results');
const CreateNew = require('./reducers/create-new');

module.exports = Redux.createStore(
    Redux.combineReducers({
        results: Results,
        createNew: CreateNew
    })
);
