'use strict';
const Delete = require('./reducers/delete');
const Details = require('./reducers/details');
const Note = require('./reducers/note');
const Redux = require('redux');
const Status = require('./reducers/status');
const User = require('./reducers/user');
const Groups = require('./reducers/groups');
const Permissions = require('./reducers/permissions');
const Password = require('./reducers/password');

module.exports = Redux.createStore(
    Redux.combineReducers({
        delete: Delete,
        details: Details,
        note: Note,
        groups: Groups,
        permissions: Permissions,
        status: Status,
        user: User,
        password: Password
    })
);
