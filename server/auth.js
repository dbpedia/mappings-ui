'use strict';
const Async = require('async');
const Boom = require('boom');
const Config = require('../config');

const internals = {};

internals.applyStrategy = function (server, next) {
    const Session = server.plugins['hapi-mongo-models'].Session;
    const Account = server.plugins['hapi-mongo-models'].Account;

    //This strategy redirects to login if no user
    server.auth.strategy('session', 'cookie', {
        password: Config.get('/cookieSecret'),
        cookie: 'sid-aqua',
        isSecure: false,
        redirectTo: '/login',
        appendNext: 'returnUrl',
        validateFunc: function (request, data, callback) {
            Async.auto({
                session: function (done) {
                    const id = data.session._id;
                    const key = data.session.key;
                    Session.findByCredentials(id, key, done);
                },
                user: ['session', function (results, done) {

                    if (!results.session) {
                        return done();
                    }

                    Account.findById(results.session.userId, (err,resultAccount) => {

                        if (err){
                            return callback(err);
                        }

                        if (!resultAccount){
                            return callback(err);
                        }

                        //Get permissions also from groups of user
                        resultAccount.populatePermissionsFromGroups((err) => {

                            done(err,resultAccount);
                        });
                        //done(err,resultAccount);
                    });
                }],

                //The scope of an user/account is their groups
                scope: ['user', function (results, done) {

                    if (!results.user || !results.user.groups) {
                        return done();
                    }

                    done(null, Object.keys(results.user.groups));
                }]
            }, (err, results) => {

                if (err) {
                    return callback(err);
                }

                if (!results.session) {
                    return callback(null, false);
                }

                callback(null, Boolean(results.user), results);
            });
        }
    });
    next();
};

internals.preware = {
    ensureNotRoot: {
        assign: 'ensureNotRoot',
        method: function (request, reply) {
            if (request.auth.credentials.user.username === 'root') {
                const message = 'Not permitted for root user.';
                return reply(Boom.badRequest(message));
            }
            reply();
        }
    },
    //Check if the user has any of the passed permissions (OR function) or is admin. If admin, no permissions are checked
    ensureHasPermissions: function (permissions){

        return {
            assign: 'ensureHasPermissions',
            method: function (request,reply){

                //Check if admin
                if (request.auth.credentials.user.isMemberOf('111111111111111111111111')){
                    reply();
                    return;
                }

                if (Object.prototype.toString.call(permissions) !== '[object Array]') {
                    permissions = [permissions];
                }

                let permissionsToCheck = permissions.length;
                let permissionExists = false;
                let errorExists = false;
                permissions.forEach( (permission) => {

                    request.auth.credentials.user.hasPermissionTo(permission, (err,hasPermission) => {

                        if (err){
                            errorExists = true;
                        }

                        if (hasPermission){
                            permissionExists = true;
                        }

                        permissionsToCheck--;
                        if (permissionsToCheck === 0){
                            if (errorExists){
                                reply(Boom.internal('Internal error'));
                            }
                            if (permissionExists){
                                reply();
                            }
                            else {
                                return reply(Boom.forbidden('You don\'t have the rights to perform this action'));
                            }
                        }

                    });
                });

            }
        };
    }
    /*,
    ensureAdminGroup: function (groups) {

        return {
            assign: 'ensureAdminGroup',
            method: function (request, reply) {

                if (Object.prototype.toString.call(groups) !== '[object Array]') {
                    groups = [groups];
                }

                const groupFound = groups.some((group) => {
                    console.log(request.auth.credentials);

                    return request.auth.credentials.user.isMemberOf(group);
                });

                if (!groupFound) {
                    const message = `Missing admin group membership to [${groups.join(' or ')}].`;

                    return reply(Boom.badRequest(message));
                }

                reply();
            }
        };
    }*/
};

exports.register = function (server, options, next) {

    server.dependency('hapi-mongo-models', internals.applyStrategy);

    next();
};

exports.preware = internals.preware;

exports.register.attributes = {
    name: 'auth'
};
