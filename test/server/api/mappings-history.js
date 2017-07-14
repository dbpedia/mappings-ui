'use strict';
const MappingsHistoryPlugin = require('../../../server/api/mappings-history');
const AuthPlugin = require('../../../server/auth');
const AuthenticatedAdmin = require('../fixtures/credentials-admin');
const AuthenticatedUser = require('../fixtures/credentials-account');
const AuthenticatedCustom = require('../fixtures/credentials-custom-account');

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
    proxy[Path.join(process.cwd(), './server/models/mapping')] = stub.MappingHistory;
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

    const plugins = [HapiAuth, ModelsPlugin, AuthPlugin, MappingsHistoryPlugin];
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


lab.experiment('Mappings History Plugin Result List', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'GET',
            url: '/mappings-history/template/lang',
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when paged find fails', (done) => {

        stub.MappingHistory.pagedFind = function () {

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

        stub.MappingHistory.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, { data: [{}, {}, {}] });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.data).to.be.an.array();
            Code.expect(response.result.data[0]).to.be.an.object();

            done();
        });
    });

});


lab.experiment('Mappings History Plugin Read', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'GET',
            url: '/mappings-history/template/lang/2',
            credentials: AuthenticatedUser
        };

        done();
    });


    lab.test('it returns an error when find by id fails', (done) => {

        stub.MappingHistory.findOne = function (id, callback) {

            callback(Error('find by id failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a not found when find by id misses', (done) => {

        stub.MappingHistory.findOne = function (id, callback) {

            callback();
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            Code.expect(response.result.message).to.match(/document not found/i);

            done();
        });
    });



    lab.test('it returns a document successfully', (done) => {

        stub.MappingHistory.findOne = function (id, callback) {

            callback(null, { });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });
});

lab.experiment('Mappings History Plugin Create', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'POST',
            url: '/mappings-history/template/lang/2',
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when restoreFromHistory fails', (done) => {

        stub.MappingHistory.restoreFromHistory = function (username,template,lang,version, callback) {

            callback(Error('create failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });



    lab.test('it restores the mapping successfully', (done) => {


        stub.MappingHistory.restoreFromHistory = function (username,template,lang,version, callback) {

            callback(null,{});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();
            done();
        });
    });

    lab.test('it returns an error restoring if not can-restore-mappings permission', (done) => {

        request = {
            method: 'POST',
            url: '/mappings-history/template/lang/2',
            credentials: AuthenticatedUser
        };


        stub.MappingHistory.restoreFromHistory = function (username,template,lang,version, callback) {

            callback(null,{});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(403);
            Code.expect(response.result).to.be.an.object();
            done();
        });
    });

    lab.test('it restores the mapping successfully when user has can-restore-mappings permission', (done) => {


        request = {
            method: 'POST',
            url: '/mappings-history/template/lang/2',
            credentials: AuthenticatedCustom(['can-restore-mappings'])
        };

        stub.MappingHistory.restoreFromHistory = function (username,template,lang,version, callback) {

            callback(null,{});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();
            done();
        });
    });




});
