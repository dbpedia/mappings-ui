'use strict';
const MappingsPlugin = require('../../../server/api/mappings');
const AuthPlugin = require('../../../server/auth');
const AuthenticatedAdmin = require('../fixtures/credentials-admin');
const AuthenticatedUser = require('../fixtures/credentials-account');
//const AuthenticatedCustom = require('../fixtures/credentials-custom-account');

const Code = require('code');
const Config = require('../../../config');
const Hapi = require('hapi');
const HapiAuth = require('hapi-auth-cookie');
const Lab = require('lab');
const MakeMockModel = require('../fixtures/make-mock-model');
const Manifest = require('../../../manifest');
const Path = require('path');
const Proxyquire = require('proxyquire');


const lab = exports.lab = Lab.script();
let request;
let server;
let stub;



lab.before((done) => {

    stub = {
        Mapping: MakeMockModel(),
        MappingHistory: MakeMockModel()
    };


    const proxy = {};
    proxy[Path.join(process.cwd(), './server/models/mapping')] = stub.Mapping;
    proxy[Path.join(process.cwd(), './server/models/mapping-history')] = stub.MappingHistory;

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

    const plugins = [HapiAuth, ModelsPlugin, AuthPlugin, MappingsPlugin];
    server = new Hapi.Server();
    server.connection({ port: Config.get('/port/web') });
    server.register(plugins, (err) => {

        if (err) {
            return done(err);
        }

        server.initialize(done);
    });
});


lab.after((done) => {

    server.plugins['hapi-mongo-models'].MongoModels.disconnect();
    done();
});


lab.experiment('Mappings Plugin Result List', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'GET',
            url: '/mappings',
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when paged find fails', (done) => {

        stub.Mapping.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('paged find failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns an array of documents successfully', (done) => {

        stub.Mapping.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            const res = {
                _id: { template: 'template', lang: 'en' },
                hydrateStats: function (cb){

                    cb(null, { numOcurrences:123 } );
                }
            };

            callback(null, { data: [res,res,res] });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.data).to.be.an.array();
            Code.expect(response.result.data[0]).to.be.an.object();

            done();
        });
    });


    lab.test('it returns an array of documents successfully (using filters)', (done) => {

        stub.Mapping.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            const res = {
                _id: { template: 'template', lang: 'en' },
                hydrateStats: function (cb){

                    cb(null, { numOcurrences:123 } );
                }
            };
            callback(null, { data: [res,res,res] });
        };

        request.url += '?template=test&lang=en&status=OK&username=user';

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.data).to.be.an.array();
            Code.expect(response.result.data[0]).to.be.an.object();

            done();
        });
    });


    lab.test('it returns an error if using wrong filter', (done) => {

        stub.Mapping.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            const res = {
                _id: { template: 'template', lang: 'en' },
                hydrateStats: function (cb){

                    cb(null, { numOcurrences:123 } );
                }
            };
            callback(null, { data: [res,res,res] });
        };

        request.url += '?template=ren&wrong=wrongfilter';

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(400);

            done();
        });
    });

    lab.test('it returns an error if fail while hydrating', (done) => {

        stub.Mapping.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            const res = {
                _id: { template: 'template', lang: 'en' },
                hydrateStats: function (cb){

                    cb({}, null );
                }
            };
            callback(null, { data: [res,res,res] });
        };


        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);

            done();
        });
    });
});


lab.experiment('Mappings Plugin Read', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'GET',
            url: '/mappings/template/en',
            credentials: AuthenticatedUser
        };

        done();
    });


    lab.test('it returns an error when find by id fails', (done) => {

        stub.Mapping.findOne = function (id, callback) {

            callback(Error('find by id failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a not found when find by id misses', (done) => {

        stub.Mapping.findOne = function (id, callback) {

            callback();
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            Code.expect(response.result.message).to.match(/document not found/i);

            done();
        });
    });


    lab.test('it returns a document successfully', (done) => {

        stub.Mapping.findOne = function (id, callback) {

            const res = {
                _id: { template: 'template', lang: 'en' },
                hydrateStats: function (cb){

                    cb(null, {} );
                }
            };
            callback(null, res);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });

    lab.test('it returns error when hydrate fails', (done) => {

        stub.Mapping.findOne = function (id, callback) {

            const res = {
                _id: { template: 'template', lang: 'en' },
                hydrateStats: function (cb){

                    cb({}, null );
                }
            };
            callback(null, res);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });
});

