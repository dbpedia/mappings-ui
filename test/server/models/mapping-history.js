'use strict';
const MappingHistory = require('../../../server/models/mapping-history');
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


    //template,lang,rml,username,comment,version





    lab.test('it returns a new instance when create succeeds', (done) => {

        const mappingObject = {
            _id: { template: 'Test1', lang: 'en' },
            rml: 'RML',
            status: 'PENDING',
            edition: { username: 'user', date: new Date(), comment: 'Comment' }
        };

        MappingHistory.create(mappingObject, false,  (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(MappingHistory);
            Code.expect(result._id).to.be.equal(mappingObject._id);
            Code.expect(result.rml).to.be.equal(mappingObject.rml);
            Code.expect(result.status).to.be.equal(mappingObject.status);
            Code.expect(result.edition).to.be.equal(mappingObject.edition);
            Code.expect(result.deleted).to.be.equal(false);

            done();
        });
    });


    lab.test('it returns a new instance when create succeeds, with deleted status', (done) => {

        const mappingObject = {
            _id: { template: 'Test2', lang: 'en' },
            rml: 'RML',
            status: 'PENDING',
            edition: { username: 'user', date: new Date(), comment: 'Comment' }
        };

        MappingHistory.create(mappingObject, true,  (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(MappingHistory);
            Code.expect(result._id).to.be.equal(mappingObject._id);
            Code.expect(result.rml).to.be.equal(mappingObject.rml);
            Code.expect(result.status).to.be.equal(mappingObject.status);
            Code.expect(result.edition).to.be.equal(mappingObject.edition);
            Code.expect(result.deleted).to.be.equal(true);

            done();
        });
    });


    lab.test('it returns an error when create fails', (done) => {

        const mappingObject = {
            _id: { template: 'Test3', lang: 'en' },
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

        MappingHistory.create(mappingObject,false, (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            MappingHistory.insertOne = realInsertOne;

            done();
        });
    });

});

