'use strict';
const MappingHistory = require('../../../server/models/mapping-history');
const Mapping = require('../../../server/models/mapping');
const Code = require('code');
const Config = require('../../../config');
const Lab = require('lab');


const lab = exports.lab = Lab.script();
const mongoUri = Config.get('/hapiMongoModels/mongodb/uri');
const mongoOptions = Config.get('/hapiMongoModels/mongodb/options');


lab.experiment('MappingHistory Class Methods', () => {

    lab.before((done) => {

        MappingHistory.connect(mongoUri, mongoOptions, (err, db) => {

            done(err);
        });
    });


    lab.after((done) => {

        MappingHistory.deleteMany({}, (err, count) => {

            MappingHistory.disconnect();

            done(err);
        });
    });

    lab.test('it returns a new instance when create succeeds', (done) => {

        const mappingObject = {
            _id: { template: 'Test_1', lang: 'en' },
            rml: 'RML',
            version: 3,
            status: 'PENDING',
            templateFullName: 'Test 1',
            edition: { username: 'user', date: new Date(), comment: 'Comment' }
        };

        MappingHistory.create(mappingObject, false,'username',  (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(MappingHistory);
            Code.expect(result._id.template).to.be.equal(mappingObject._id.template);
            Code.expect(result._id.lang).to.be.equal(mappingObject._id.lang);
            Code.expect(result._id.version).to.be.equal(mappingObject.version);
            Code.expect(result.rml).to.be.equal(mappingObject.rml);
            Code.expect(result.status).to.be.equal(mappingObject.status);
            Code.expect(result.edition).to.be.equal(mappingObject.edition);
            Code.expect(result.templateFullName).to.be.equal(mappingObject.templateFullName);
            Code.expect(result.deleted).to.be.equal(false);

            done();
        });
    });


    lab.test('it returns a new instance when create succeeds, with deleted status', (done) => {

        const mappingObject = {
            _id: { template: 'Test2', lang: 'en' },
            rml: 'RML',
            version: 3,
            status: 'PENDING',
            templateFullName: 'Test 2',
            edition: { username: 'user', date: new Date(), comment: 'Comment' }
        };

        MappingHistory.create(mappingObject, true,'username',   (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(MappingHistory);
            Code.expect(result._id.template).to.be.equal(mappingObject._id.template);
            Code.expect(result._id.lang).to.be.equal(mappingObject._id.lang);
            Code.expect(result._id.version).to.be.equal(mappingObject.version);
            Code.expect(result.rml).to.be.equal(mappingObject.rml);
            Code.expect(result.status).to.be.equal(mappingObject.status);
            Code.expect(result.edition).to.be.equal(mappingObject.edition);
            Code.expect(result.templateFullName).to.be.equal(mappingObject.templateFullName);
            Code.expect(result.deleted).to.be.equal(true);

            done();
        });
    });


    lab.test('it returns an error when create fails', (done) => {

        const mappingObject = {
            _id: { template: 'Test3', lang: 'en',version:3 },
            rml: 'RML',
            status: 'PENDING',
            edition: { username: 'user', date: new Date(), comment: 'Comment' }
        };

        const realInsertOne = MappingHistory.insertOne;
        MappingHistory.insertOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('insert failed'));
        };

        MappingHistory.create(mappingObject,false,'username',  (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            MappingHistory.insertOne = realInsertOne;

            done();
        });
    });

    lab.test('it correctly restores a historic version when not in active',(done) => {

        const realFindOne = MappingHistory.findOne;
        MappingHistory.findOne = function (query,callback){

            const _id = query._id;
            const mockDoc = {
                _id,
                templateFullName: 'Full Name',
                rml: 'oldRml',
                status: 'OLD-STATUS'
            };
            MappingHistory.findOne = realFindOne;
            callback(null,mockDoc);
        };

        MappingHistory.findOneAndUpdate = function (query,update,callback){

            callback(null,{});
        };

        //In this case, no mapping in active mappings
        const realMappingFindOne = Mapping.findOne;
        Mapping.findOne = function (query,callback){

            Mapping.findOne = realMappingFindOne;
            callback(null,null);
        };

        const realCreateFromHistory = Mapping.createFromHistory;
        Mapping.createFromHistory = function (doc,callback){

            Code.expect(doc._id.template).to.be.equal('template');
            Code.expect(doc._id.lang).to.be.equal('en');
            Code.expect(doc._id.version).to.be.equal(1);
            Code.expect(doc.status).to.be.equal('OLD-STATUS');
            Code.expect(doc.rml).to.be.equal('oldRml');
            Mapping.createFromHistory = realCreateFromHistory;
            callback(null,{});
        };

        MappingHistory.restoreFromHistory('admin','template','en',1, (err,result) => {

            Code.expect(err).to.not.exist();
            done();
        });



    });

    lab.test('it correctly restores a historic version when is in active',(done) => {

        const realFindOne = MappingHistory.findOne;
        MappingHistory.findOne = function (query,callback){

            const _id = query._id;
            const version = query.version;
            const mockDoc = {
                _id,
                version,
                templateFullName: 'Full Name',
                rml: 'oldRml',
                status: 'OLD-STATUS',
                edition: {
                    comment: 'Fixed bug'
                }
            };
            MappingHistory.findOne = realFindOne;
            callback(null,mockDoc);
        };

        //In this case, mapping is in active mappings
        const realMappingFindOne = Mapping.findOne;
        Mapping.findOne = function (query,callback){


            Mapping.findOne = realMappingFindOne;
            callback(null,{
                archive: function (del,username,cb){

                    cb(null,{});
                },
                update: function (set,username,comment,cb2){

                    Code.expect(set.rml).to.be.equal('oldRml');
                    Code.expect(set.status).to.be.equal('OLD-STATUS');
                    Code.expect(username).to.be.equal('admin');
                    Code.expect(comment).to.be.equal('Fixed bug (Restored from version 1).');
                    cb2(null,{});
                }
            });
        };

        MappingHistory.restoreFromHistory('admin','template','en',1, (err,result) => {

            Code.expect(err).to.not.exist();
            done();
        });



    });

});

