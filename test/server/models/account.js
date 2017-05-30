'use strict';
const Async = require('async');
const Code = require('code');
const Config = require('../../../config');
const Lab = require('lab');
const Proxyquire = require('proxyquire');


const lab = exports.lab = Lab.script();
const mongoUri = Config.get('/hapiMongoModels/mongodb/uri');
const mongoOptions = Config.get('/hapiMongoModels/mongodb/options');
const stub = {
    AccountGroup: {}
};

const Account = Proxyquire('../../../server/models/account', {
    './account-group': stub.AccountGroup
});
const AccountGroup = require('../../../server/models/account-group');







lab.experiment('Account Class Methods', () => {

    lab.before((done) => {

        Account.connect(mongoUri, mongoOptions, (err, db) => {

            done(err);
        });
    });


    lab.after((done) => {

        Account.deleteMany({}, (err, count) => {

            Account.disconnect();
            done(err);
        });
    });


    lab.test('it returns a new instance when create succeeds', (done) => {

        Account.create('Ren Höek', (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(Account);

            done();
        });
    });


    lab.test('it correctly sets the middle name when create is called', (done) => {

        Account.create('Stimpson J Cat', (err, account) => {

            Code.expect(err).to.not.exist();
            Code.expect(account).to.be.an.instanceOf(Account);
            Code.expect(account.name.middle).to.equal('J');

            done();
        });
    });


    lab.test('it returns an error when create fails', (done) => {

        const realInsertOne = Account.insertOne;
        Account.insertOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('insert failed'));
        };

        Account.create('Stimpy Cat', (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            Account.insertOne = realInsertOne;

            done();
        });
    });


    lab.test('it returns a result when finding by username', (done) => {

        Async.auto({
            account: function (cb) {

                Account.create('Stimpson J Cat', cb);
            },
            accountUpdated: ['account', function (results, cb) {

                const fieldsToUpdate = {
                    $set: {
                        user: {
                            id: '95EP150D35',
                            name: 'stimpy'
                        }
                    }
                };

                Account.findByIdAndUpdate(results.account._id, fieldsToUpdate, cb);
            }]
        }, (err, results) => {

            if (err) {
                return done(err);
            }

            Account.findByUsername('stimpy', (err, account) => {

                Code.expect(err).to.not.exist();
                Code.expect(account).to.be.an.instanceOf(Account);

                done();
            });
        });
    });
});


lab.experiment('Account Instance Methods', () => {

    lab.before((done) => {

        Account.connect(mongoUri, mongoOptions, (err, db) => {

            done(err);
        });
    });


    lab.after((done) => {

        Account.deleteMany({}, (err, result) => {

            Account.disconnect();

            done(err);
        });
    });


    lab.test('it returns false when groups are not found', (done) => {

        const account = new Account({
            name: {
                first: 'Ren',
                last: 'Höek'
            }
        });

        Code.expect(account.isMemberOf('sales')).to.equal(false);

        done();
    });


    lab.test('it returns boolean values for set group memberships', (done) => {

        const account = new Account({
            name: {
                first: 'Ren',
                last: 'Höek'
            },
            groups: {
                sales: 'Sales',
                support: 'Support'
            }
        });

        Code.expect(account.isMemberOf('sales')).to.equal(true);
        Code.expect(account.isMemberOf('support')).to.equal(true);
        Code.expect(account.isMemberOf('managers')).to.equal(false);
        done();
    });


    lab.test('it exits early when hydrating groups where groups are missing', (done) => {

        const account = new Account({
            name: {
                first: 'Ren',
                last: 'Höek'
            }
        });

        account.hydrateGroups((err) => {

            Code.expect(err).to.not.exist();

            done();
        });
    });


    lab.test('it exits early when hydrating groups where hydrated groups exist', (done) => {

        const account = new Account({
            name: {
                first: 'Ren',
                last: 'Höek'
            },
            groups: {
                sales: 'Sales'
            },
            _groups: {
                sales: new AccountGroup({
                    _id: 'sales',
                    name: 'Sales',
                    permissions: {
                        SPACE_MADNESS: true,
                        UNTAMED_WORLD: false
                    }
                })
            }
        });

        account.hydrateGroups((err) => {

            Code.expect(err).to.not.exist();

            done();
        });
    });


    lab.test('it returns an error when hydrating groups and find by id fails', (done) => {

        const realFindById = stub.AccountGroup.findById;
        stub.AccountGroup.findById = function (id, callback) {

            callback(Error('find by id failed'));
        };

        const account = new Account({
            name: {
                first: 'Ren',
                last: 'Höek'
            },
            groups: {
                sales: 'Sales'
            }
        });

        account.hydrateGroups((err) => {

            Code.expect(err).to.be.an.object();

            stub.AccountGroup.findById = realFindById;

            done();
        });
    });


    lab.test('it successfully hydrates groups', (done) => {

        const realFindById = stub.AccountGroup.findById;
        stub.AccountGroup.findById = function (id, callback) {

            const group = new AccountGroup({
                _id: 'sales',
                name: 'Sales',
                permissions: {
                    SPACE_MADNESS: true,
                    UNTAMED_WORLD: false
                }
            });

            callback(null, group);
        };

        const account = new Account({
            name: {
                first: 'Ren',
                last: 'Höek'
            },
            groups: {
                sales: 'Sales'
            }
        });

        account.hydrateGroups((err) => {

            Code.expect(err).to.not.exist();

            stub.AccountGroup.findById = realFindById;

            done();
        });
    });


    lab.test('it exits early when the permission exists on the account', (done) => {

        const account = new Account({
            name: {
                first: 'Ren',
                last: 'Höek'
            },
            permissions: {
                SPACE_MADNESS: true,
                UNTAMED_WORLD: false
            }
        });

        account.hasPermissionTo('SPACE_MADNESS', (err, permit) => {

            Code.expect(err).to.not.exist();
            Code.expect(permit).to.equal(true);

            done();
        });
    });


    lab.test('it returns an error when checking permission and hydrating groups fails', (done) => {

        const realHydrateGroups = Account.prototype.hydrateGroups;
        Account.prototype.hydrateGroups = function (callback) {

            callback(Error('hydrate groups failed'));
        };

        const account = new Account({
            name: {
                first: 'Ren',
                last: 'Höek'
            },
            groups: {
                sales: 'Sales'
            }
        });

        account.hasPermissionTo('SPACE_MADNESS', (err) => {

            Code.expect(err).to.be.an.object();

            Account.prototype.hydrateGroups = realHydrateGroups;

            done();
        });
    });


    lab.test('it returns correct permission from hydrated group permissions', (done) => {

        const account = new Account({
            name: {
                first: 'Ren',
                last: 'Höek'
            },
            groups: {
                sales: 'Sales',
                support: 'Support'
            }
        });

        account._groups = {
            sales: new AccountGroup({
                _id: 'sales',
                name: 'Sales',
                permissions: {
                    UNTAMED_WORLD: false,
                    WORLD_UNTAMED: true
                }
            }),
            support: new AccountGroup({
                _id: 'support',
                name: 'Support',
                permissions: {
                    SPACE_MADNESS: true,
                    MADNESS_SPACE: false
                }
            })
        };

        Async.auto({
            test1: function (cb) {

                account.hasPermissionTo('SPACE_MADNESS', cb);
            },
            test2: function (cb) {

                account.hasPermissionTo('UNTAMED_WORLD', cb);
            }
        }, (err, results) => {

            Code.expect(err).to.not.exist();
            Code.expect(results.test1).to.equal(true);
            Code.expect(results.test2).to.equal(false);

            done(err);
        });
    });
});
