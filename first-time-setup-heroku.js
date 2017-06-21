'use strict';
const Async = require('async');
const MongoModels = require('mongo-models');
const Mongodb = require('mongodb');
const Dotenv = require('dotenv');
Dotenv.config({ silent: true });



const rootmail = 'root@mail.com';
const rootpass = 'dbpedia';

const homePageText = '# Welcome to DBpedia Mappings UI!\r\n<div style=\"text-align:center\"><img src =\"\/public\/media\/dbpedia_plain.png\" \/><\/div>\r\n\r\n### DBpedia Mappings Wiki\r\n---\r\n\r\nIn this DBpedia Mappings Wiki you can help to enhance the information in DBpedia. The DBpedia Extraction Framework uses the mappings defined here to homogenize information extracted from Wikipedia before generating structured information in RDF.\r\nAnybody can help by editing:\r\n* the [DBpedia ontology schema](http:\/\/mappings.dbpedia.org\/index.php\/How_to_edit_the_DBpedia_Ontology) (classes, properties, datatypes)\r\n* the [DBpedia infobox-to-ontology mappings](http:\/\/mappings.dbpedia.org\/index.php\/How_to_edit_DBpedia_Mappings)\r\n\r\nMappings can be written for a variety of languages, connecting multiligual information to a language-independent unified ontology schema (language-specific labels can be provided there).\r\n\r\n### Mapping Example\r\n---\r\nThis is how you write a simple infobox mapping.\r\n```js\r\n{{TemplateMapping \r\n| mapToClass = Actor \r\n| mappings = \r\n   {{ PropertyMapping | templateProperty = name | ontologyProperty = foaf:name }}\r\n   {{ PropertyMapping | templateProperty = birth_place | ontologyProperty = birthPlace }}\r\n}}\r\n```\r\n\r\nThis mapping extracts three information bits:\r\n* the type information (Actor)\r\n* the name of the actor\r\n* the actor\'s place of birth.\r\n\r\nTherefore, three RDF triples for each Infobox_actor in the English Wikipedia are extracted. For example for Vince Vaughn:\r\n\r\n```dbpedia:Vince_Vaughn  rdf:type                dbpedia-owl:Actor   .\r\ndbpedia:Vince_Vaughn  foaf:name               \"Vince Vaughn\"@en   .\r\ndbpedia:Vince_Vaughn  dbpedia-owl:birthPlace  dbpedia:Minneapolis .\r\n```';

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
        const Post = require('./server/models/post');

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
                    title: 'Home',
                    markdown: homePageText,
                    username: 'admin',
                    visible: true
                };

                Post.create(d.title,d.markdown,d.username,d.visible, (err,docs) => {

                    done(err, docs);
                });



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
