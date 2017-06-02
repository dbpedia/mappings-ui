'use strict';
const Details = require('./reducers/details');
const Password = require('./reducers/password');
const Redux = require('redux');


module.exports = Redux.createStore(
    Redux.combineReducers({
        details: Details,
        password: Password
    })
);



