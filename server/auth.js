'use strict';
const Async = require('async');
const Boom = require('boom');
const Config = require('../config');


const internals = {};


internals.applyStrategy = function (server, next) {

    const Session = server.plugins['hapi-mongo-models'].Session;
    const Account = server.plugins['hapi-mongo-models'].Account;


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

                    Account.findById(results.session.userId, done);
                }],
                /*roles: ['user', function (results, done) {

                    if (!results.user) {
                        return done();
                    }

                    results.user.hydrateRoles(done);
                }],*/

                //The scope of an user/account is their roles
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
