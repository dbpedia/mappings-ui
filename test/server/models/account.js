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
    AccountGroup: {},
    bcrypt: {}
};

const Account = Proxyquire('../../../server/models/account', {
    './account-group': stub.AccountGroup,
    bcrypt: stub.bcrypt
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



    lab.test('it creates a password hash combination', (done) => {

        Account.generatePasswordHash('bighouseblues', (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.object();
            Code.expect(result.password).to.be.a.string();
            Code.expect(result.hash).to.be.a.string();

            done();
        });
    });


    lab.test('it returns an error when password hash fails', (done) => {

        const realGenSalt = stub.bcrypt.genSalt;
        stub.bcrypt.genSalt = function (rounds, callback) {

            callback(Error('bcrypt failed'));
        };

        Account.generatePasswordHash('bighouseblues', (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            stub.bcrypt.genSalt = realGenSalt;

            done();
        });
    });


    lab.test('it returns a new instance when create succeeds', (done) => {

        Account.create('Ren Höek','renhoek','pass','mail@mail.com','en', (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(Account);

            done();
        });
    });




    lab.test('it correctly sets the middle name when create is called', (done) => {

        Account.create('Stimpson J Cat', 'stimpson','pass','mail@mail.com','en', (err, account) => {

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

        Account.create('Stimpy Cat','stimpy','pass','mail@mail.com','en', (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            Account.insertOne = realInsertOne;

            done();
        });
    });

    lab.test('it returns a result when finding by credentials', (done) => {

        Async.auto({
            user: function (cb) {

                Account.create('Stimpy Cat','stimpy', 'thebigshot', 'stimpy@ren.show', 'en',cb);
            },
            username: ['user', function (results, cb) {

                Account.findByCredentials(results.user.username, results.user.password, cb);
            }],
            email: ['user', function (results, cb) {

                Account.findByCredentials(results.user.email, results.user.password, cb);
            }]
        }, (err, results) => {

            Code.expect(err).to.not.exist();
            Code.expect(results.user).to.be.an.instanceOf(Account);
            Code.expect(results.username).to.be.an.instanceOf(Account);
            Code.expect(results.email).to.be.an.instanceOf(Account);

            done();
        });
    });

    lab.test('it returns nothing for find by credentials when password match fails', (done) => {

        const realFindOne = Account.findOne;
        Account.findOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, { username: 'toastman', password: 'letmein' });
        };

        const realCompare = stub.bcrypt.compare;
        stub.bcrypt.compare = function (key, source, callback) {

            callback(null, false);
        };

        Account.findByCredentials('toastman', 'doorislocked', (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.not.exist();

            Account.findOne = realFindOne;
            stub.bcrypt.compare = realCompare;

            done();
        });
    });


    lab.test('it returns early when finding by login misses', (done) => {

        const realFindOne = Account.findOne;
        Account.findOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback();
        };

        Account.findByCredentials('stimpy', 'dog', (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.not.exist();

            Account.findOne = realFindOne;

            done();
        });
    });

    lab.test('it returns an error when finding by login fails', (done) => {

        const realFindOne = Account.findOne;
        Account.findOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('find one failed'));
        };

        Account.findByCredentials('stimpy', 'dog', (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            Account.findOne = realFindOne;

            done();
        });
    });

    lab.test('it returns a result when finding by username', (done) => {

        Async.auto({
            account: function (cb) {

                Account.create('Stimpson J Cat','stimpy', 'pass','mail@mail.com','en',cb);
            },
            accountCreated: ['account', function (results, cb) {


                Account.findById(results.account._id,cb);
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


    lab.test('it returns a result when finding by email', (done) => {

        Async.auto({
            account: function (cb) {

                Account.create('Stimpson J Cat','stimpy', 'pass','test@mail.com','en',cb);
            },
            accountCreated: ['account', function (results, cb) {


                Account.findById(results.account._id,cb);
            }]
        }, (err, results) => {

            if (err) {
                return done(err);
            }

            Account.findByEmail('test@mail.com', (err, account) => {

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


    lab.test('it returns an error when populating permissions and hydrating groups fails', (done) => {

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

        account.populatePermissionsFromGroups( (err) => {

            Code.expect(err).to.be.an.object();

            Account.prototype.hydrateGroups = realHydrateGroups;

            done();
        });
    });

    lab.test('it returns correct populated permissions', (done) => {



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
                    'can-edit-posts': true,
                    'can-create-posts': false
                }
            }),
            support: new AccountGroup({
                _id: 'support',
                name: 'Support',
                permissions: {
                    'can-remove-posts': true,
                    'can-list-posts': false
                }
            })
        };


        account.populatePermissionsFromGroups( (err,result) => {

            Code.expect(err).to.not.exists();
            Code.expect(result).to.be.an.object();
            Code.expect(account.permissions).to.be.an.object();
            Code.expect(account.permissions['can-edit-posts']).to.exist();
            Code.expect(account.permissions['can-remove-posts']).to.exist();
            Code.expect(account.permissions['can-create-posts']).to.not.exist();
            Code.expect(account.permissions['can-list-posts']).to.not.exist();



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
