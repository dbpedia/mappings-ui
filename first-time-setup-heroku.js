'use strict';
const Async = require('async');
const MongoModels = require('mongo-models');
const Mongodb = require('mongodb');
const Dotenv = require('dotenv');
Dotenv.config({ silent: true });



const rootmail = 'root@mail.com';
const rootpass = 'dbpedia';

Async.auto({

    testMongo: (done) => {

        Mongodb.MongoClient.connect(process.env.MONGODB_URI, {}, (err, db) => {

            if (err) {
                console.error('Failed to connect to Mongodb.');
                return done(err);
            }

            db.close();
            done(null, true);
        });
    },
    setupRootUser: ['testMongo',(results, done) => {



        const Account = require('./server/models/account');
        const AccountGroup = require('./server/models/account-group');
        const AuthAttempt = require('./server/models/auth-attempt');
        const Session = require('./server/models/session');
        const Status = require('./server/models/status');

        Async.auto({
            connect: function (done) {

                MongoModels.connect(process.env.MONGODB_URI, {}, done);
            },
            clean: ['connect', (dbResults, done) => {

                Async.parallel([
                    Account.deleteMany.bind(Account, {}),
                    AccountGroup.deleteMany.bind(AccountGroup, {}),
                    AuthAttempt.deleteMany.bind(AuthAttempt, {}),
                    Session.deleteMany.bind(Session, {}),
                    Status.deleteMany.bind(Status, {})
                ], done);
            }],

            adminGroup: ['clean', function (dbResults, done) {

                AccountGroup.create('Admin', done);
            }],


            accountGroup: ['clean', function (dbResults, done) {

                AccountGroup.create('Account', done);
            }],

            rootUser: ['clean', function (dbResults, done) {

                Async.auto({
                    passwordHash: Account.generatePasswordHash.bind(this, rootpass)
                }, (err, passResults) => {

                    if (err) {
                        return done(err);
                    }

                    const document = {
                        _id: Account.ObjectId('111111111111111111111111'),
                        isActive: true,
                        username: 'admin',
                        name: {
                            first: 'Admin',
                            middle: '',
                            last: 'User'
                        },
                        password: passResults.passwordHash.hash,
                        email: rootmail.toLowerCase(),
                        groups: {
                            admin: 'Admin'
                        },
                        timeCreated: new Date()
                    };

                    Account.insertOne(document, (err, docs) => {

                        done(err, docs && docs[0]);
                    });
                });
            }]
        }, (err, dbResults) => {

            console.log(dbResults);

            if (err) {
                console.error('Failed to setup root user.');
                return done(err);
            }

            done(null, true);
        });
    }]
}, (err, results) => {

    if (err) {
        console.error('Setup failed.');
        console.error(err);
        return process.exit(1);
    }

    console.log('Setup complete.');
    process.exit(0);
});
