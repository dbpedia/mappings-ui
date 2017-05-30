'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');
const AccountGroup = require('./account-group');

const Async = require('async');
const NoteEntry = require('./note-entry');
const StatusEntry = require('./status-entry');


class Account extends MongoModels {
    static create(name, callback) {

        const nameParts = name.trim().split(/\s/);

        const document = {
            name: {
                first: nameParts.shift(),
                middle: nameParts.length > 1 ? nameParts.shift() : '',
                last: nameParts.join(' ')
            },
            timeCreated: new Date()
        };

        this.insertOne(document, (err, docs) => {

            if (err) {
                return callback(err);
            }

            callback(null, docs[0]);
        });
    }

    static findByUsername(username, callback) {

        const query = { 'user.name': username.toLowerCase() };

        this.findOne(query, callback);
    }


    constructor(attrs) {

        super(attrs);

        Object.defineProperty(this, '_groups', {
            writable: true,
            enumerable: false
        });
    }


    isMemberOf(group) {

        if (!this.groups) {
            return false;
        }

        return this.groups.hasOwnProperty(group);
    }


    //Retrieves the group objects from the database and returns them
    //Only if not cached
    hydrateGroups(callback) {

        if (!this.groups) {
            this._groups = {};
            return callback(null, this._groups);
        }

        if (this._groups) {
            return callback(null, this._groups);
        }

        const tasks = {};

        Object.keys(this.groups).forEach((group) => {

            tasks[group] = function (done) {

                AccountGroup.findById(group, done);
            };
        });


        Async.auto(tasks, (err, results) => {

            if (err) {
                return callback(err);
            }

            this._groups = results;

            callback(null, this._groups);
        });
    }

    //Returns whether the account has 'permission', either individual or because of a group
    hasPermissionTo(permission, callback) {

        if (this.permissions && this.permissions.hasOwnProperty(permission)) {
            return callback(null, this.permissions[permission]);
        }

        this.hydrateGroups((err) => {

            if (err) {
                return callback(err);
            }

            let groupHasPermission = false;

            Object.keys(this._groups).forEach((group) => {

                if (this._groups[group].hasPermissionTo(permission)) {
                    groupHasPermission = true;
                }
            });

            callback(null, groupHasPermission);
        });
    }


}


Account.collection = 'accounts';


Account.schema = Joi.object().keys({
    _id: Joi.object(),
    user: Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().lowercase().required()
    }),
    name: Joi.object().keys({
        first: Joi.string().required(),
        middle: Joi.string().allow(''),
        last: Joi.string().required()
    }),
    groups: Joi.object().description('{ groupId: name, ... }'),
    permissions: Joi.object().description('{ permission: boolean, ... }'),
    status: Joi.object().keys({
        current: StatusEntry.schema,
        log: Joi.array().items(StatusEntry.schema)
    }),
    notes: Joi.array().items(NoteEntry.schema),
    verification: Joi.object().keys({
        complete: Joi.boolean(),
        token: Joi.string()
    }),
    timeCreated: Joi.date()
});


Account.indexes = [
    { key: { 'user.id': 1 } },
    { key: { 'user.name': 1 } }
];


module.exports = Account;
