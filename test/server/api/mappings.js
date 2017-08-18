'use strict';
const MappingsPlugin = require('../../../server/api/mappings');
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

const charLimit = Config.get('/mappings/charLimit');



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

        request.url += '?template=test&lang=en&status=OK&username=user&errored=false';

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


});

lab.experiment('Mapping Plugin Create', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'POST',
            url: '/mappings',
            payload: {
                template: 'test-template',
                lang: 'en',
                rml: 'rml'
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when create fails', (done) => {

        stub.Mapping.create = function (template,lang,rml,username,comment, callback) {

            callback(Error('create failed'));
        };

        stub.Mapping.findOne = function (id, callback) {

            callback();
        };


        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns an error when rml is more than limit', (done) => {

        let moreThanLimit = '';
        for (let i = 0; i <= charLimit; i = i + 1){
            moreThanLimit += 'a';
        }
        request = {
            method: 'POST',
            url: '/mappings',
            payload: {
                template: 'test-template',
                lang: 'en',
                rml: moreThanLimit
            },
            credentials: AuthenticatedAdmin
        };


        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(409);
            done();
        });
    });



    lab.test('it returns an error when there is a template with that id already', (done) => {

        stub.Mapping.findOne = function (conditions, callback) {

            callback(null,{ _id: { template: 'test-template', lang:'en' } });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(409);
            done();
        });
    });

    lab.test('it creates a mapping successfully', (done) => {

        stub.Mapping.create = function (template,lang,rml,username,comment, callback) {

            callback(null, { _id: { template,lang }, rml, edition: { username,comment,date: new Date() }, version:1  });
        };

        stub.Mapping.findOne = function (id, callback) {

            callback();
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();
            Code.expect(response.result._id.template).to.equal('test-template');
            Code.expect(response.result._id.lang).to.equal('en');
            Code.expect(response.result.rml).to.equal('rml');
            Code.expect(response.result.version).to.equal(1);
            done();
        });
    });

    lab.test('it creates a mapping successfully when has can-create-mappings permission', (done) => {

        request = {
            method: 'POST',
            url: '/mappings',
            payload: {
                template: 'test-template',
                lang: 'en',
                rml: 'rml'
            },
            credentials:   AuthenticatedCustom(['can-create-mappings'])
        };

        stub.Mapping.create = function (template,lang,rml,username,comment, callback) {

            callback(null, { _id: { template,lang }, rml, edition: { username,comment,date: new Date() }, version:1  });
        };

        stub.Mapping.findOne = function (id, callback) {

            callback();
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();
            Code.expect(response.result._id.template).to.equal('test-template');
            Code.expect(response.result._id.lang).to.equal('en');
            Code.expect(response.result.rml).to.equal('rml');
            Code.expect(response.result.version).to.equal(1);
            done();
        });
    });

    lab.test('it returns an error when no can-create-mappings permission', (done) => {

        request = {
            method: 'POST',
            url: '/mappings',
            payload: {
                template: 'test-template',
                lang: 'en',
                rml: 'rml'
            },
            credentials: AuthenticatedUser
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(403);
            done();
        });
    });


    lab.test('it redirects when no authenticated', (done) => {

        request = {
            method: 'POST',
            url: '/mappings',
            payload: {
                template: 'test-template',
                lang: 'en',
                rml: 'rml'
            }
        };



        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(302);
            done();
        });
    });
});


lab.experiment('Mapping Plugin Update', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'PUT',
            url: '/mappings/template/en',
            payload: {
                rml: 'updated-rml',
                comment: 'changes'
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when update fails in findOne', (done) => {


        stub.Mapping.findOne = function (id, callback) {

            callback({},null);

        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });

    lab.test('it returns an error when update fails in archive', (done) => {


        stub.Mapping.findOne = function (id, callback) {


            callback(null,{
                archive: function (del, u, c2){

                    c2({},null);
                }
            });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });

    lab.test('it returns an error when update fails in update', (done) => {


        stub.Mapping.findOne = function (id, callback) {


            callback(null,{
                archive: function (del, u, c2){

                    c2(null,{});
                },
                update: function (update,username,comment,c3){

                    c3({},null);
                }
            });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns an error when rml is more than limit', (done) => {

        let moreThanLimit = '';
        for (let i = 0; i <= charLimit; i = i + 1){
            moreThanLimit += 'a';
        }
        request = {
            method: 'PUT',
            url: '/mappings/template/en',
            payload: {
                rml: moreThanLimit,
                comment: 'changes'
            },
            credentials: AuthenticatedAdmin
        };



        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(409);
            done();
        });
    });




    lab.test('it returns not found when find by id misses', (done) => {


        stub.Mapping.findOne = function (id, callback) {

            callback(null,null);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            done();
        });
    });

    lab.test('it updates a document successfully', (done) => {

        stub.Mapping.findOne = function (id, callback) {

            callback(null,{
                _id: { template:'template','lang':'en' },
                archive: function (del, u, cb){

                    cb(null,{});
                },
                update: function (update,username,comment,cb2){

                    Code.expect(update.rml).to.equal('updated-rml');
                    Code.expect(username).to.equal('admin');
                    Code.expect(comment).to.equal('changes');

                    cb2(null,{});
                }

            });
        };

        server.inject(request, (response) => {

            done();
        });
    });

    lab.test('it updates a document successfully with can-edit-mappings permission', (done) => {

        request = {
            method: 'PUT',
            url: '/mappings/template/en',
            payload: {
                rml: 'updated-rml',
                comment: 'changes'
            },
            credentials: AuthenticatedCustom(['can-edit-mappings'])
        };

        stub.Mapping.findOne = function (id, callback) {

            callback(null,{
                _id: { template:'template','lang':'en' },
                archive: function (del, u, cb){

                    cb(null,{});
                },
                update: function (update,username,comment,cb2){

                    Code.expect(update.rml).to.equal('updated-rml');
                    Code.expect(username).to.equal('account');
                    Code.expect(comment).to.equal('changes');

                    cb2(null,{});
                }

            });
        };

        server.inject(request, (response) => {

            done();
        });
    });

    lab.test('it returns error with no can-edit-mappings permission', (done) => {

        request = {
            method: 'PUT',
            url: '/mappings/template/en',
            payload: {
                rml: 'updated-rml',
                comment: 'changes'
            },
            credentials: AuthenticatedUser
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(403);
            done();
        });
    });



});


lab.experiment('Mapping Plugin Delete', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'DELETE',
            url: '/mappings/template/en',
            credentials: AuthenticatedAdmin
        };

        done();
    });

    lab.test('it returns an error when delete by id fails', (done) => {

        stub.Mapping.findOne = function (id, callback) {

            callback({},null);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });



    lab.test('it returns a not found when delete by id misses', (done) => {

        stub.Mapping.findOne = function (id, callback) {

            callback(null,null);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            done();
        });
    });


    lab.test('it deletes (archives) a document successfully', (done) => {

        stub.Mapping.findOne = function (id, callback) {

            callback(null,{
                _id: { template:'template','lang':'en' },
                archive: function (del,u, cb){

                    Code.expect(del).to.be.true();
                    cb(null,{});
                }

            });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.success).to.be.true();

            done();
        });
    });

    lab.test('it deletes (archives) a document successfully with can-remove-mappings permission', (done) => {

        request = {
            method: 'DELETE',
            url: '/mappings/template/en',
            credentials: AuthenticatedCustom(['can-remove-mappings'])
        };

        stub.Mapping.findOne = function (id, callback) {

            callback(null,{
                _id: { template:'template','lang':'en' },
                archive: function (del,u,cb){

                    Code.expect(del).to.be.true();
                    cb(null,{});
                }

            });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.success).to.be.true();

            done();
        });
    });

    lab.test('it returns error with no can-remove-mappings permission', (done) => {

        request = {
            method: 'DELETE',
            url: '/mappings/template/en',
            credentials: AuthenticatedUser
        };


        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(403);
            done();
        });
    });
});



