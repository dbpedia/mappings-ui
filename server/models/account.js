'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');
const AccountGroup = require('./account-group');
const Bcrypt = require('bcrypt');
const Async = require('async');
const NoteEntry = require('./note-entry');


class Account extends MongoModels {

    static generatePasswordHash(password, callback) {

        Async.auto({
            salt: function (done) {

                Bcrypt.genSalt(10, done);
            },
            hash: ['salt', function (results, done) {

                Bcrypt.hash(password, results.salt, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(null, {
                password,
                hash: results.hash
            });
        });
    }


    //Receives the completa nem, username, password and email
    static create(completename,username, password, email, mappingsLang, callback) {

        const self = this;

        const nameParts = completename.trim().split(/\s/);

        Async.auto({
            passwordHash: this.generatePasswordHash.bind(this, password),
            newUser: ['passwordHash', function (results, done) {

                const document = {
                    isActive: true,
                    username: username.toLowerCase(),
                    name: {
                        first: nameParts.shift(),
                        middle: nameParts.length > 1 ? nameParts.shift() : '',
                        last: nameParts.join(' ')
                    },
                    password: results.passwordHash.hash,
                    email: email.toLowerCase(),
                    mappingsLang: mappingsLang.toLowerCase(),
                    groups: { '000000000000000000000000':'Account' },
                    timeCreated: new Date()
                };

                self.insertOne(document, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            //Clean out of memory
            results.newUser[0].password = results.passwordHash.password;

            callback(null, results.newUser[0]);
        });
    }


    static findByUsername(username, callback) {

        const query = { 'username': username.toLowerCase() };

        this.findOne(query, callback);
    }

    static findByEmail(email, callback) {

        const query = { 'email': email.toLowerCase() };

        this.findOne(query, callback);
    }

    static findByCredentials(username, password, callback) {

        const self = this;

        Async.auto({
            user: function (done) {

                const query = {
                    isActive: true
                };

                if (username.indexOf('@') > -1) {
                    query.email = username.toLowerCase();
                }
                else {
                    query.username = username.toLowerCase();
                }

                self.findOne(query, done);
            },
            passwordMatch: ['user', function (results, done) {

                if (!results.user) {
                    return done(null, false);
                }

                const source = results.user.password;
                Bcrypt.compare(password, source, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            if (results.passwordMatch) {
                return callback(null, results.user);
            }

            callback();
        });
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

                if (this._groups[group].hasPermissionTo && this._groups[group].hasPermissionTo(permission)) {
                    groupHasPermission = true;
                }
            });

            callback(null, groupHasPermission);
        });
    }


    populatePermissionsFromGroups(callback) {


        this.hydrateGroups((err) => {

            if (err) {
                return callback(err);
            }

            Object.keys(this._groups).forEach((group) => {

                //For each one of the permissions of said group, assign it
                for (const permissionKey in this._groups[group].permissions) {
                    if (this._groups[group].permissions.hasOwnProperty(permissionKey) && this._groups[group].permissions[permissionKey]) {
                        if (!this.permissions){
                            this.permissions = {};
                        }
                        this.permissions[permissionKey] = true;
                    }
                }

            });

            callback(null);
        });
    }


}


Account.collection = 'accounts';


Account.schema = Joi.object().keys({
    _id: Joi.object(),
    isActive: Joi.boolean().default(true),
    username: Joi.string().token().lowercase().required(),
    password: Joi.string(),
    email: Joi.string().email().lowercase().required(),
    name: Joi.object().keys({
        first: Joi.string().required(),
        middle: Joi.string().allow(''),
        last: Joi.string().required()
    }),
    groups: Joi.object().description('{ groupId: name, ... }'),
    permissions: Joi.object().description('{ permission: boolean, ... }'),
    notes: Joi.array().items(NoteEntry.schema),
    verification: Joi.object().keys({
        complete: Joi.boolean(),
        token: Joi.string()
    }),
    timeCreated: Joi.date(),
    timeLastLogin: Joi.date(),
    resetPassword: Joi.object().keys({
        token: Joi.string().required(),
        expires: Joi.date().required()
    })
});


Account.indexes = [
    { key: { _id: 1 } },
    { key: { username: 1, unique:1 } },
    { key: { email:1, unique:1 } }
];


module.exports = Account;
