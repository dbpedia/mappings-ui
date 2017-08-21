'use strict';
const Confidence = require('confidence');
const Dotenv = require('dotenv');


Dotenv.config({ silent: true });

const criteria = {
    env: process.env.NODE_ENV
};


const config = {
    $meta: 'This file configures the plot device.',
    projectName: 'DBpedia Mappings UI',
    tempDirectory: {
        $filter: 'env',
        production: '/app/tmp/',
        $default: '/tmp/'
    },
    port: {
        web: {
            $filter: 'env',
            test: 9000,
            production: process.env.PORT,
            $default: 8000
        }
    },
    run: {
        server: {
            $filter: 'env',
            production: true,
            $default: true
        },
        githubUpdater: {
            mappings: {
                $filter: 'env',
                production: true,
                $default: false
            },
            ontology: {
                $filter: 'env',
                production: false,
                $default: false
            }
        },
        statsUpdater: {
            $filter: 'env',
            production: true,
            $default: true
        }
    },
    baseUrl: {
        $filter: 'env',
        $meta: 'values should not end in "/"',
        production: 'https://mappings-ui.herokuapp.com',
        $default: 'http://127.0.0.1:8000'
    },
    extractionFrameworkURL:  process.env.EXTRACTION_FRAMEWORK_URL,
    authAttempts: {
        forIp: 50,
        forIpAndUser: 7
    },
    cookieSecret: {
        $filter: 'env',
        production: process.env.COOKIE_SECRET,
        $default: '!k3yb04rdK4tz~4qu4~k3yb04rdd0gz!'
    },
    posts:{
        charLimit: 100000
    },
    mappings:{
        charLimit: 1000000,
        statsUpdateFrequencyMinutes: 10
    },
    hapiMongoModels: {
        mongodb: {
            uri: {
                $filter: 'env',
                production: process.env.MONGODB_URI,
                test: 'mongodb://localhost:27017/aqua-test',
                $default: 'mongodb://localhost:27017/aqua'
            }
        },
        autoIndex: true
    },
    //Configuration related to github interaction, to update both mappings
    github: {
        username: process.env.GITHUB_USERNAME,
        password: process.env.GITHUB_PASSWORD,
        name: process.env.GITHUB_NAME,
        email: process.env.GITHUB_EMAIL,
        repositoryURL: {
            $filter: 'env',
            production: 'https://github.com/ontologypusher/mappings',
            $default: 'https://github.com/ontologypusher/mappings'
        },
        repositoryFolder: {
            $filter: 'env',
            production: '/app/tmp/mappings-repo/',
            $default: '/tmp/mappings-repo'
        },
        repositoryMappingsFolder: 'mappings', //No slash at end
        repositoryOntologyFolder: 'ontology', //No slash at end
        updateFrequencyMinutes: 1
    },
    webProtegeIntegration: {
        mongodb:{
            uri:  {
                $filter: 'env',
                production: 'mongodb://localhost:27017/webprotege',
                $default: 'mongodb://localhost:27017/webprotege'
            }
        },
        projectID: '95513977-dbb6-4a90-a29c-4d73c760e4b3',
        webProtegeURL:{
            $filter: 'env',
            production: 'http://localhost:8080/webprotege-3.0.0-SNAPSHOT',
            $default:'http://localhost:8080/webprotege-3.0.0-SNAPSHOT'
        },
        ontologyFileBaseName: 'dbpedia-ontology',   //Name of file to be saved in repository
        ontologyFormats: 'owx,owl,ttl,omx,ofn'      //Formats to extract

    },
    nodemailer: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_ADDRESS,
            pass: process.env.SMTP_PASSWORD
        }
    },
    system: {
        fromAddress: {
            name: 'DBpedia Mappings',
            address: process.env.SMTP_ADDRESS
        },
        toAddress: {
            name: 'DBpedia Mappings',
            address: process.env.SMTP_ADDRESS
        }
    }
};


const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
