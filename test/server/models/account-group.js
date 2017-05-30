'use strict';
const AccountGroup = require('../../../server/models/account-group');
const Code = require('code');
const Config = require('../../../config');
const Lab = require('lab');


const lab = exports.lab = Lab.script();
const mongoUri = Config.get('/hapiMongoModels/mongodb/uri');
const mongoOptions = Config.get('/hapiMongoModels/mongodb/options');


lab.experiment('AccountGroup Class Methods', () => {

    lab.before((done) => {

        AccountGroup.connect(mongoUri, mongoOptions, (err, db) => {

            done(err);
        });
    });


    lab.after((done) => {

        AccountGroup.deleteMany({}, (err, count) => {

            AccountGroup.disconnect();

            done(err);
        });
    });


    lab.test('it returns a new instance when create succeeds', (done) => {

        AccountGroup.create('Sales', (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(AccountGroup);

            done();
        });
    });


    lab.test('it returns an error when create fails', (done) => {

        const realInsertOne = AccountGroup.insertOne;
        AccountGroup.insertOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('insert failed'));
        };

        AccountGroup.create('Support', (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            AccountGroup.insertOne = realInsertOne;

            done();
        });
    });
});


lab.experiment('AccountGroup Instance Methods', () => {

    lab.before((done) => {

        AccountGroup.connect(mongoUri, mongoOptions, (err, db) => {

            done(err);
        });
    });


    lab.after((done) => {

        AccountGroup.deleteMany({}, (err, result) => {

            AccountGroup.disconnect();

            done(err);
        });
    });


    lab.test('it returns false when permissions are not found', (done) => {

        AccountGroup.create('Sales', (err, accountGroup) => {

            Code.expect(err).to.not.exist();
            Code.expect(accountGroup).to.be.an.instanceOf(AccountGroup);
            Code.expect(accountGroup.hasPermissionTo('SPACE_MADNESS')).to.equal(false);

            done();
        });
    });


    lab.test('it returns boolean values for set permissions', (done) => {

        AccountGroup.create('Support', (err, accountGroup) => {

            Code.expect(err).to.not.exist();
            Code.expect(accountGroup).to.be.an.instanceOf(AccountGroup);

            accountGroup.permissions = {
                SPACE_MADNESS: true,
                UNTAMED_WORLD: false
            };

            Code.expect(accountGroup.hasPermissionTo('SPACE_MADNESS')).to.equal(true);
            Code.expect(accountGroup.hasPermissionTo('UNTAMED_WORLD')).to.equal(false);

            done();
        });
    });
});
