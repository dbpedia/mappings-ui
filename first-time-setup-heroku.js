'use strict';
const Async = require('async');
const MongoModels = require('mongo-models');
const Mongodb = require('mongodb');
const Dotenv = require('dotenv');
const Config = require('./config');
Dotenv.config({ silent: true });
const WPDatabase = require('./scripts/githubOntology/webprotegeDatabase');
const GithubNetrc = require('./scripts/github-netrc');
const Exec = require('child_process').exec;
const REPO_FOLDER = Config.get('/github/repositoryFolder');



const rootmail = 'root@mail.com';
const rootpass = 'dbpedia';

const homePageText = '# Welcome to DBpedia Mappings UI!\r\n<div style=\"text-align:center\"><img src =\"\/public\/media\/dbpedia_plain.png\" \/><\/div>\r\n\r\n### DBpedia Mappings Wiki\r\n---\r\n\r\nIn this DBpedia Mappings Wiki you can help to enhance the information in DBpedia. The DBpedia Extraction Framework uses the mappings defined here to homogenize information extracted from Wikipedia before generating structured information in RDF.\r\nAnybody can help by editing:\r\n* the [DBpedia ontology schema](\/posts\/view\/how-to-edit-the-dbpedia-ontology)\r\n* the [DBpedia infobox-to-ontology mappings](\/posts\/view\/how-to-edit-dbpedia-mappings)\r\n\r\nMappings can be written for a variety of languages, connecting multiligual information to a language-independent unified ontology schema (language-specific labels can be provided there).\r\n\r\n### Mapping Example\r\n---\r\nThis is how you write a simple infobox mapping.\r\n```js\r\n{{TemplateMapping \r\n| mapToClass = Actor \r\n| mappings = \r\n   {{ PropertyMapping | templateProperty = name | ontologyProperty = foaf:name }}\r\n   {{ PropertyMapping | templateProperty = birth_place | ontologyProperty = birthPlace }}\r\n}}\r\n```\r\n\r\nThis mapping extracts three information bits:\r\n* the type information (Actor)\r\n* the name of the actor\r\n* the actor\'s place of birth.\r\n\r\nTherefore, three RDF triples for each Infobox_actor in the English Wikipedia are extracted. For example for Vince Vaughn:\r\n\r\n```dbpedia:Vince_Vaughn  rdf:type                dbpedia-owl:Actor   .\r\ndbpedia:Vince_Vaughn  foaf:name               \"Vince Vaughn\"@en   .\r\ndbpedia:Vince_Vaughn  dbpedia-owl:birthPlace  dbpedia:Minneapolis .\r\n```';
const editMappingsPage = 'This is a test page. Contents are used to illustrate how help posts work.\r\n\r\n### Tools and Resources\r\n---\r\n*  **Mapping Validator**. When you are editing a mapping, there is a validate button on the bottom of the page. Pressing the button validates your changes for syntactic correctness and highlights inconsistencies such as missing property definitions. It checks if your mappings conform to the DBpedia ontology, it is updated once per day.\r\n* **Extraction Tester**. The extraction tester linked on each mapping page tests a mapping against a set of example Wikipedia pages. This gives you direct feedback about whether a mapping works and how the resulting data will look like.\r\n* **MappingTool**. The DBpedia MappingTool is a graphical user interface that supports users to create and edit mappings.\r\n* [DBpedia Mapping Language Grammar](https:\/\/raw.githubusercontent.com\/dbpedia\/extraction-framework\/master\/core\/doc\/mapping_language\/dbpedia_grammar.xml)\r\n* [DBpedia Mapping Language Design](https:\/\/github.com\/dbpedia\/extraction-framework\/raw\/master\/core\/doc\/mapping_language\/DBpedia_Mapping_Language.pdf)';
const editOntologyPage = 'This is an example page. Text is used to illustrate how help pages work.\r\n\r\n\r\n### How to add an ontology class\r\n---\r\n* Find a list of existing ontology classes via the sidebar (Ontology Classes) or have a look at the class hierarchy.\r\n* If you like to add a new ontology class, create a wiki page in the OntologyClass namespace. The page name has to be upper camel case.\r\n* Write a Class template defining the ontology class properties like label, super class etc..\r\n\r\n### How to add an ontology property\r\n---\r\n* Find a list of existing ontology properties via the sidebar (Ontology Properties).\r\n* If you like to add a new ontology property, create a wiki page in the OntologyProperty namespace. The page name has to be upper camel case.\r\n* Write a DatatypeProperty template or ObjectProperty template defining the ontology property.\r\n\r\n';

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
        const Mapping = require('./server/models/mapping');
        const MappingHistory = require('./server/models/mapping-history');
        const MappingUpdateStatus = require('./server/models/mappingUpdateStatus');

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
                    Post.deleteMany.bind(Post,{}),
                    Mapping.deleteMany.bind(Mapping,{}),
                    MappingHistory.deleteMany.bind(MappingHistory,{}),
                    MappingUpdateStatus.deleteMany.bind(MappingUpdateStatus,{})
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
            editOntologyPost: ['clean', function (dbResults, done) {

                const d = {
                    title: 'How to edit the DBpedia ontology',
                    markdown: editOntologyPage,
                    username: 'admin',
                    visible: true
                };

                Post.create(d.title,d.markdown,d.username,d.visible, (err,docs) => {

                    done(err, docs);
                });



            }],
            editMappingsPost: ['clean', function (dbResults, done) {

                const d = {
                    title: 'How to edit DBpedia mappings',
                    markdown: editMappingsPage,
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
                        mappingsLang: 'en',
                        timeCreated: new Date()
                    };

                    Account.insertOne(document, (err, docs) => {

                        if (!err){
                            console.log('Admin user added to normal DB');
                        }

                        done(err, docs && docs[0]);
                    });
                });
            }],
            removeRepo: ['clean',(dbResults,done) => {

                exec('rm -rf ' + 'REPO_FOLDER',  (err, stdout, stderr) => {
                    if (err){
                        console.log(err);
                    }
                    else {
                        console.log('removed repo folder');
                    }
                    done();
                });
            }],
           /* addRootToWP: ['rootUser', function (dbResults, done) {



                WPDatabase.addUser('admin','Admin',rootmail,rootpass)
                    .then((res) => {

                        console.log('Admin user added to WebProtege');

                        return WPDatabase.setAdmin('admin',true);

                    })
                    .then((res) => {

                        console.log('Admin user granted admin permissions in WebProtege');
                        done(undefined,res.result);
                    });




            }],*/
            regularUser: ['rootUser', function (dbResults, done) {


                Async.auto({
                    passwordHash: Account.generatePasswordHash.bind(this, 'dbpedia')
                }, (err, passResults) => {

                    if (err) {
                        return done(err);
                    }

                    const document = {
                        isActive: true,
                        username: 'user',
                        name: {
                            first: 'Name',
                            middle: '',
                            last: 'Surname'
                        },
                        password: passResults.passwordHash.hash,
                        email: 'user@mail.com',
                        groups: {
                            '000000000000000000000000': 'Account'
                        },
                        mappingsLang: 'en',
                        timeCreated: new Date(),
                        permissions: {
                            'can-create-mappings': true, 'can-edit-mappings':true, 'can-remove-mappings':true,'can-restore-mappings':true
                        }
                    };


                    Account.insertOne(document, (err, docs) => {

                        if (!err){
                            console.log('Regular user added to normal DB');
                        }

                        done(err, docs && docs[0]);
                    });
                });
            }],
           /* addRegularUserToWP: ['regularUser', function (dbResults, done) {

                WPDatabase.addUser('user','Name Surname','user@mail.com','dbpedia')
                    .then((res) => {

                        console.log('Regular user added to WebProtege');

                        return WPDatabase.setAdmin('user',false);

                    })
                    .then((res) => {

                        console.log('Regular user granted regular permissions to WebProtege');
                        done(undefined,res.result);
                    });




            }],*/
            putDetailsInNetRC: ['clean', function (dbResults, done) {

                const correct = GithubNetrc.putLoginIntoNetrc();
                if (correct){
                    done(undefined);
                }
                else {
                    done('error putting github loing into netrc');
                }


            }]
        }, (err, dbResults) => {

            //console.log(dbResults);

            if (err) {
                console.log(err);
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
