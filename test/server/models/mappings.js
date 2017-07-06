'use strict';
const stub = {
    CurrentMappingStats: {}
};
const Proxyquire = require('proxyquire');

const Mapping = Proxyquire('../../../server/models/mapping', {
    './currentMappingStats': stub.CurrentMappingStats
});

const Code = require('code');
const Config = require('../../../config');
const Lab = require('lab');


const lab = exports.lab = Lab.script();
const mongoUri = Config.get('/hapiMongoModels/mongodb/uri');
const mongoOptions = Config.get('/hapiMongoModels/mongodb/options');


lab.experiment('Mapping Class Methods', () => {

    let realFind;

    lab.before((done) => {

        Mapping.connect(mongoUri, mongoOptions, (err, db) => {

            done(err);
        });

        realFind = stub.CurrentMappingStats.findOne;
        stub.CurrentMappingStats.findOne = function (query, callback) {

            callback(null, {});
        };

    });


    lab.after((done) => {

        Mapping.deleteMany({}, (err, count) => {

            Mapping.disconnect();
            stub.CurrentMappingStats.findOne = realFind;

            done(err);
        });
    });


    //template,lang,rml,username,comment,version

    lab.test('it returns a new instance when create succeeds', (done) => {

        Mapping.create('Writer','en','RML','user','edition comment',12, (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(Mapping);

            done();
        });
    });

    lab.test('it returns RML empty when RML is undefined', (done) => {

        Mapping.create('Artist','en',undefined,'user','edition comment',12, (err, post) => {

            Code.expect(err).to.not.exist();
            Code.expect(post).to.be.an.instanceOf(Mapping);
            Code.expect(post.rml).to.equal('');
            done();
        });
    });

    lab.test('it returns comment empty when comment is undefined', (done) => {

        Mapping.create('Test','en','RML','user',undefined,12, (err, post) => {

            Code.expect(err).to.not.exist();
            Code.expect(post).to.be.an.instanceOf(Mapping);
            Code.expect(post.edition.comment).to.equal('');
            done();
        });
    });


    lab.test('it returns an error when create fails', (done) => {

        const realInsertOne = Mapping.insertOne;
        Mapping.insertOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('insert failed'));
        };

        Mapping.create('Writer','en','RML','user','edition comment',12, (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            Mapping.insertOne = realInsertOne;

            done();
        });
    });


    lab.test('it returns correct username in edition',(done) => {


        Mapping.create('Test2','en','RML','user','edition comment',12, (err, result) => {


            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(Mapping);
            Code.expect(result.edition.username).to.equal('user');


            done();
        });

    });


});


lab.experiment('Mapping Instance Methods', () => {

    lab.before((done) => {

        Mapping.connect(mongoUri, mongoOptions, (err, db) => {

            done(err);
        });
    });


    lab.after((done) => {

        Mapping.deleteMany({}, (err, result) => {

            Mapping.disconnect();

            done(err);
        });
    });


    lab.test('it correctly hydrates when information is available',(done) => {


        const realFind = stub.CurrentMappingStats.findOne;
        stub.CurrentMappingStats.findOne = function (query, callback) {

            const stats = {
                _id: { template: 'template', lang: 'en' },
                numOcurrences: 12
            };


            callback(null, stats);
        };

        const mapping = new Mapping({
            _id: { template: 'template', lang: 'en' },
            rml: 'rml',
            status: 'PENDING'
        });

        mapping.hydrateStats((err) => {

            Code.expect(err).to.not.exist();
            Code.expect(mapping.stats._id.template).to.be.equal('template');
            Code.expect(mapping.stats._id.lang).to.be.equal('en');
            Code.expect(mapping.stats.numOcurrences).to.be.equal(12);
            stub.CurrentMappingStats.findOne = realFind;

            done();
        });

    });

    lab.test('it correctly hydrates when information is not available',(done) => {


        const realFind = stub.CurrentMappingStats.findOne;
        stub.CurrentMappingStats.findOne = function (query, callback) {


            callback(null, null);
        };

        const mapping = new Mapping({
            _id: { template: 'template', lang: 'en' },
            rml: 'rml',
            status: 'PENDING'
        });

        mapping.hydrateStats((err) => {

            Code.expect(err).to.not.exist();
            Code.expect(mapping.stats).to.be.equal(null);

            stub.CurrentMappingStats.findOne = realFind;

            done();
        });

    });

    lab.test('it returns an error when hydrate fails',(done) => {


        const realFind = stub.CurrentMappingStats.findOne;
        stub.CurrentMappingStats.findOne = function (query, callback) {


            callback({}, null);
        };

        const mapping = new Mapping({
            _id: { template: 'template', lang: 'en' },
            rml: 'rml',
            status: 'PENDING'
        });

        mapping.hydrateStats((err) => {

            Code.expect(err).to.exist();
            stub.CurrentMappingStats.findOne = realFind;

            done();
        });

    });



});
