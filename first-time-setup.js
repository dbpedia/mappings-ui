'use strict';
const Async = require('async');
const MongoModels = require('mongo-models');
const Mongodb = require('mongodb');
const Promptly = require('promptly');


Async.auto({
    mongodbUri: (done) => {

        const options = {
            default: 'mongodb://localhost:27017/aqua'
        };

        Promptly.prompt(`MongoDB URI: (${options.default})`, options, done);
    },
    testMongo: ['mongodbUri', (results, done) => {

        Mongodb.MongoClient.connect(results.mongodbUri, {}, (err, db) => {

            if (err) {
                console.error('Failed to connect to Mongodb.');
                return done(err);
            }

            db.close();
            done(null, true);
        });
    }],
    rootEmail: ['testMongo', (results, done) => {

        Promptly.prompt('Root user email:', done);
    }],
    rootPassword: ['rootEmail', (results, done) => {

        Promptly.password('Root user password:', done);
    }],
    setupRootUser: ['rootPassword', (results, done) => {

        const Account = require('./server/models/account');
        const AccountGroup = require('./server/models/account-group');
        const AuthAttempt = require('./server/models/auth-attempt');
        const Session = require('./server/models/session');
        const Status = require('./server/models/status');
        const Post = require('./server/models/post');

        Async.auto({
            connect: function (done) {

                MongoModels.connect(results.mongodbUri, {}, done);
            },
            clean: ['connect', (dbResults, done) => {

                Async.parallel([
                    Account.deleteMany.bind(Account, {}),
                    AccountGroup.deleteMany.bind(AccountGroup, {}),
                    AuthAttempt.deleteMany.bind(AuthAttempt, {}),
                    Session.deleteMany.bind(Session, {}),
                    Status.deleteMany.bind(Status, {}),
                    Post.deleteMany.bind(Post,{})
                ], done);
            }],

            adminGroup: ['clean', function (dbResults, done) {
                //Admin group has 111111111111111111111111 id

                const document = {
                    _id: Account.ObjectId('111111111111111111111111'),
                    name: 'Admin'
                };

                AccountGroup.insertOne(document, (err, docs) => {

                    done(err, docs && docs[0]);
                });
            }],


            accountGroup: ['clean', function (dbResults, done) {

                //Account group has 000000000000000000000000 id

                const document = {
                    _id: Account.ObjectId('000000000000000000000000'),
                    name: 'Account'
                };

                AccountGroup.insertOne(document, (err, docs) => {

                    done(err, docs && docs[0]);
                });
            }],

            postEditorGroup: ['clean', function (dbResults, done) {
                //Group with all needed permissions to operate with help posts

                const document = {
                    name: 'Post Editors',
                    permissions: { 'can-list-posts':true,'can-create-posts':true,'can-remove-posts':true,'can-edit-posts':true }
                };

                AccountGroup.insertOne(document, (err, docs) => {

                    done(err, docs && docs[0]);
                });
            }],

            homePost: ['clean', function (dbResults, done) {

                const d = {
                    title: 'Home Page',
                    markdown: '#Welcome!!',
                    username: 'admin',
                    visible: true
                };

                Post.create(d.title,d.markdown,d.username,d.visible, (err,docs) => {

                    done(err, docs);
                });



            }],
            homePost2: ['clean', function (dbResults, done) {

                const d = {
                    title: 'Home Page2',
                    markdown: '#Welcome2!!',
                    username: 'pepito',
                    visible: true
                };

                Post.create(d.title,d.markdown,d.username,d.visible, (err,docs) => {

                    done(err, docs);
                });



            }],

            rootUser: ['clean', function (dbResults, done) {

                Async.auto({
                    passwordHash: Account.generatePasswordHash.bind(this, results.rootPassword)
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
                        email: results.rootEmail.toLowerCase(),
                        groups: {
                            '111111111111111111111111': 'Admin',
                            '000000000000000000000000': 'Account'
                        },
                        mappingsLang: 'all',
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
