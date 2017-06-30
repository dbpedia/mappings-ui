'use strict';
const Async = require('async');
const Boom = require('boom');
const Config = require('../../config');
const Joi = require('joi');
const WebProtege = require('../ontologyExport/webprotegeDatabase');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Account = server.plugins['hapi-mongo-models'].Account;
    const Session = server.plugins['hapi-mongo-models'].Session;


    server.route({
        method: 'POST',
        path: '/signup',
        config: {
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            },
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    email: Joi.string().email().lowercase().required(),
                    username: Joi.string().token().lowercase().required(),
                    password: Joi.string().required(),
                    mappingsLang: Joi.string().lowercase().required()
                }
            },
            pre: [{
                assign: 'usernameCheck',
                method: function (request, reply) {

                    const conditions = {
                        username: request.payload.username
                    };

                    Account.findOne(conditions, (err, user) => {

                        if (err) {
                            return reply(err);
                        }

                        if (user) {
                            return reply(Boom.conflict('Username already in use.'));
                        }

                        reply(true);
                    });
                }
            }, {
                assign: 'emailCheck',
                method: function (request, reply) {

                    const conditions = {
                        email: request.payload.email
                    };

                    Account.findOne(conditions, (err, user) => {

                        if (err) {
                            return reply(err);
                        }

                        if (user) {
                            return reply(Boom.conflict('Email already in use.'));
                        }

                        reply(true);
                    });
                }
            }]
        },
        handler: function (request, reply) {

            //Username and mail are not repeated, as "pre" already checked it.

            const mailer = request.server.plugins.mailer;

            Async.auto({
                account: function (done) {

                    const name = request.payload.name;
                    const username = request.payload.username;
                    const password = request.payload.password;
                    const email = request.payload.email;
                    const mappingsLang = request.payload.mappingsLang;

                    Account.create(name, username, password, email,mappingsLang, done);
                },
                webprotege: ['account',function (results,done){

                    const account = results.account;
                    //Add user to webprotege
                    WebProtege.addUser(account.username,request.payload.name,account.email,account.password)
                        .then( (res) => {

                            done(null,res);
                        })
                        .catch( (err) => {

                            done(err,null);
                        });

                }],
                welcome: ['account', function (results, done) {

                    const emailOptions = {
                        subject: 'Your ' + Config.get('/projectName') + ' account',
                        to: {
                            name: request.payload.name,
                            address: request.payload.email
                        }
                    };
                    const template = 'welcome';

                    mailer.sendEmail(emailOptions, template, request.payload, (err) => {

                        if (err) {
                            console.warn('sending welcome email failed:', err.stack);
                        }
                    });

                    done();
                }],
                session: ['account', function (results, done) {

                    Session.create(results.account._id.toString(), done);
                }]
            }, (err, results) => {

                if (err) {
                    return reply(err);
                }

                const account = results.account;
                const credentials = account.username + ':' + results.session.key;
                const authHeader = 'Basic ' + new Buffer(credentials).toString('base64');

                //Create cookie and send it
                const result = {
                    user: {
                        _id: account._id,
                        username: account.username,
                        email: account.email,
                        groups: account.groups
                    },
                    session: results.session,
                    authHeader
                };


                request.cookieAuth.set(result);
                reply(result);
            });
        }
    });


    next();
};


exports.register = function (server, options, next) {

    server.dependency(['mailer', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'signup'
};
