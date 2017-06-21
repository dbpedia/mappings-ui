'use strict';
const AuthPlugin = require('../../server/auth');
const Code = require('code');
const Config = require('../../config');
const CookieAdmin = require('./fixtures/cookie-admin');
const Hapi = require('hapi');
const HapiAuth = require('hapi-auth-cookie');
const Lab = require('lab');
const MakeMockModel = require('./fixtures/make-mock-model');
const Manifest = require('../../manifest');
const Path = require('path');
const Proxyquire = require('proxyquire');
const Session = require('../../server/models/session');
const Account = require('../../server/models/account');

const lab = exports.lab = Lab.script();
let server;
let stub;


lab.beforeEach((done) => {

    stub = {
        Session: MakeMockModel(),
        Account: MakeMockModel()
    };

    const proxy = {};
    proxy[Path.join(process.cwd(), './server/models/session')] = stub.Session;
    proxy[Path.join(process.cwd(), './server/models/account')] = stub.Account;

    const ModelsPlugin = {
        register: Proxyquire('hapi-mongo-models', proxy),
        options: Manifest.get('/registrations').filter((reg) => {

            if (reg.plugin &&
                reg.plugin.register &&
                reg.plugin.register === 'hapi-mongo-models') {

                return true;
            }

            return false;
        })[0].plugin.options
    };

    const plugins = [HapiAuth, ModelsPlugin, AuthPlugin];
    server = new Hapi.Server();
    server.connection({ port: Config.get('/port/web') });
    server.register(plugins, (err) => {

        if (err) {
            return done(err);
        }

        server.initialize(done);
    });
});


lab.afterEach((done) => {

    server.plugins['hapi-mongo-models'].MongoModels.disconnect();

    done();
});


lab.experiment('Auth Plugin', () => {

    lab.test('it returns authentication credentials', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback(null, new Session({ _id: '2D', userId: '1D', key: 'baddog' }));
        };

        stub.Account.findById = function (username, callback) {

            callback(null, new Account({ _id: '1D', username: 'ren' }));
        };

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                server.auth.test('session', request, (err, credentials) => {

                    Code.expect(err).to.not.exist();
                    Code.expect(credentials).to.be.an.object();

                    reply('ok');
                });
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            done();
        });
    });


    lab.test('it returns an error when the session is not found', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback();
        };

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                server.auth.test('session', request, (err, credentials) => {

                    Code.expect(err).to.be.an.object();
                    // Code.expect(credentials).to.not.exist();

                    reply('ok');
                });
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            done();
        });
    });


    lab.test('it returns an error when the user is not found', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback(null, new Session({ username: 'ren', key: 'baddog' }));
        };

        stub.Account.findByUsername = function (username, callback) {

            callback();
        };

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                server.auth.test('session', request, (err, credentials) => {

                    Code.expect(err).to.be.an.object();
                    reply('ok');
                });
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            done();
        });
    });


    lab.test('it returns an error when a model error occurs', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback(Error('session fail'));
        };

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                server.auth.test('session', request, (err, credentials) => {

                    Code.expect(err).to.be.an.object();
                    // Code.expect(credentials).to.not.exist();

                    reply('ok');
                });
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            done();
        });
    });


    lab.test('it takes over when the required group is missing', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback(null, new Session({ _id: '2D', userId: '1D', key: 'baddog' }));
        };

        stub.Account.findById = function (id, callback) {

            callback(null, new Account({ _id: '1D', username: 'ren' }));
        };

        server.route({
            method: 'GET',
            path: '/',
            config: {
                auth: {
                    strategy: 'session',
                    scope: 'admin'
                }
            },
            handler: function (request, reply) {

                Code.expect(request.auth.credentials).to.be.an.object();

                reply('ok');
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.result.message).to.match(/insufficient scope/i);

            done();
        });
    });


    lab.test('it continues through pre handler when group is present', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback(null, new Session({ _id: '2D', userId: '1D', key: 'baddog' }));
        };

        stub.Account.findById = function (id, callback) {

            const user = new Account({
                username: 'ren',
                groups: { admin: 'Admin' }
            });

            user._groups =  {
                admin: {
                    _id: 'admin',
                    name: 'Admin',
                    permissions: {
                        SPACE_MADNESS: true,
                        UNTAMED_WORLD: false
                    }
                }
            };

            callback(null, user);
        };

        server.route({
            method: 'GET',
            path: '/',
            config: {
                auth: {
                    strategy: 'session',
                    scope: ['account', 'admin']
                }
            },
            handler: function (request, reply) {

                Code.expect(request.auth.credentials).to.be.an.object();

                reply('ok');
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.result).to.match(/ok/i);

            done();
        });
    });






    lab.test('it continues through pre handler when not acting the root user', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback(null, new Session({ _id: '2D', userId: '1D', key: 'baddog' }));
        };

        stub.Account.findById = function (id, callback) {

            const user = new Account({
                username: 'admin',
                groups: { admin: 'Admin' }
            });

            user._groups =  {
                admin: {
                    _id: 'admin',
                    name: 'Admin',
                    permissions: {
                        SPACE_MADNESS: true,
                        UNTAMED_WORLD: false
                    }
                }
            };

            callback(null, user);
        };

        server.route({
            method: 'GET',
            path: '/',
            config: {
                auth: {
                    strategy: 'session',
                    scope: 'admin'
                },
                pre: [
                    AuthPlugin.preware.ensureNotRoot
                ]
            },
            handler: function (request, reply) {

                Code.expect(request.auth.credentials).to.be.an.object();

                reply('ok');
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.result).to.match(/ok/i);

            done();
        });
    });


    lab.test('it takes over when acting as the root user', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback(null, new Session({ _id: '2D', userId: '1D', key: 'baddog' }));
        };

        stub.Account.findById = function (id, callback) {

            const user = new Account({
                username: 'root',
                groups: { admin: 'Admin' }
            });

            user._groups =  {
                admin: {
                    _id: 'admin',
                    name: 'Admin',
                    permissions: {
                        SPACE_MADNESS: true,
                        UNTAMED_WORLD: false
                    }
                }
            };


            callback(null, user);
        };

        server.route({
            method: 'GET',
            path: '/',
            config: {
                auth: {
                    strategy: 'session',
                    scope: 'admin'
                },
                pre: [
                    AuthPlugin.preware.ensureNotRoot
                ]
            },
            handler: function (request, reply) {

                Code.expect(request.auth.credentials).to.be.an.object();

                reply('ok');
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.result.message).to.match(/not permitted for root user/i);

            done();
        });
    });


    lab.test('it continues through pre handler when has needed permissions', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback(null, new Session({ _id: '2D', userId: '1D', key: 'baddog' }));
        };

        stub.Account.findById = function (id, callback) {

            const user = new Account({
                username: 'myAccount',
                groups: { 'exampleGroup': 'Example Group' }
            });

            user._groups =  {
                exampleGroup: {
                    _id: 'exampleGroup',
                    name: 'Example Group',
                    permissions: {
                        'can-edit-posts':true
                    }
                }
            };

            callback(null, user);
        };

        server.route({
            method: 'GET',
            path: '/',
            config: {
                auth: {
                    strategy: 'session'
                },
                pre: [
                    AuthPlugin.preware.ensureHasPermissions('can-edit-posts')
                ]
            },
            handler: function (request, reply) {

                Code.expect(request.auth.credentials).to.be.an.object();

                reply('ok');
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.result).to.match(/ok/i);

            done();
        });
    });

    lab.test('it continues through pre handler when is admin', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback(null, new Session({ _id: '2D', userId: '1D', key: 'baddog' }));
        };

        stub.Account.findById = function (id, callback) {

            const user = new Account({
                username: 'admin',
                groups: { '111111111111111111111111': 'Admin Group' }
            });

            user._groups =  {
                '111111111111111111111111': {
                    _id: '111111111111111111111111',
                    name: 'Admin Group'
                }
            };

            callback(null, user);
        };

        server.route({
            method: 'GET',
            path: '/',
            config: {
                auth: {
                    strategy: 'session'
                },
                pre: [
                    AuthPlugin.preware.ensureHasPermissions('can-edit-posts')
                ]
            },
            handler: function (request, reply) {

                Code.expect(request.auth.credentials).to.be.an.object();

                reply('ok');
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.result).to.match(/ok/i);

            done();
        });
    });


    lab.test('it takes over when account does not have needed permissions', (done) => {

        stub.Session.findByCredentials = function (username, key, callback) {

            callback(null, new Session({ _id: '2D', userId: '1D', key: 'baddog' }));
        };

        stub.Account.findById = function (id, callback) {

            const user = new Account({
                username: 'myAccount',
                groups: { 'exampleGroup': 'Example Group' }
            });

            user._groups =  {
                exampleGroup: {
                    _id: 'exampleGroup',
                    name: 'Example Group',
                    permissions: {
                        'can-edit-posts':false
                    }
                }
            };

            callback(null, user);
        };

        server.route({
            method: 'GET',
            path: '/',
            config: {
                auth: {
                    strategy: 'session'
                },
                pre: [
                    AuthPlugin.preware.ensureHasPermissions('can-edit-posts')
                ]
            },
            handler: function (request, reply) {

                Code.expect(request.auth.credentials).to.be.an.object();

                reply('ok');
            }
        });

        const request = {
            method: 'GET',
            url: '/',
            headers: {
                cookie: CookieAdmin
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(403);

            done();
        });
    });

});
