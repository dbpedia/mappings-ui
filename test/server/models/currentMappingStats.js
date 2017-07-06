'use strict';
const CurrentMappingStats = require('../../../server/models/currentMappingStats');
const Code = require('code');
const Config = require('../../../config');
const Lab = require('lab');


const lab = exports.lab = Lab.script();
const mongoUri = Config.get('/hapiMongoModels/mongodb/uri');
const mongoOptions = Config.get('/hapiMongoModels/mongodb/options');


lab.experiment('CurrentMappingStats Class Methods', () => {

    lab.before((done) => {

        CurrentMappingStats.connect(mongoUri, mongoOptions, (err, db) => {

            done(err);
        });
    });


    lab.after((done) => {

        CurrentMappingStats.deleteMany({}, (err, count) => {

            CurrentMappingStats.disconnect();

            done(err);
        });
    });


    //template,lang,rml,username,comment,version
    lab.test('it returns a new instance when create succeeds', (done) => {

        CurrentMappingStats.create('Test1','en',1,2,3,4,5,6, (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(CurrentMappingStats);

            done();
        });
    });


    lab.test('it returns an error when create fails', (done) => {

        const realInsertOne = CurrentMappingStats.insertOne;
        CurrentMappingStats.insertOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('insert failed'));
        };

        CurrentMappingStats.create('Test2','en',1,2,3,4,5,6, (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            CurrentMappingStats.insertOne = realInsertOne;

            done();
        });
    });

});

