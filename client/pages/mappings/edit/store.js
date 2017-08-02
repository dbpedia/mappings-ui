'use strict';
const Delete = require('./reducers/delete');
const Details = require('./reducers/details');
const Template = require('./reducers/template');
const Test = require('./reducers/test');
const Redux = require('redux');


module.exports = Redux.createStore(
    Redux.combineReducers({
        delete: Delete,
        details: Details,
        template: Template,
        test: Test
    })
);
