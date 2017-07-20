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
                production: true,
                $default: false
            }
        }
    },
    baseUrl: {
        $filter: 'env',
        $meta: 'values should not end in "/"',
        production: 'https://mappings-ui.herokuapp.com',
        $default: 'http://127.0.0.1:8000'
    },
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
        charLimit: 1000000
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
        name: 'OntologyPusher',
        email: 'i.smaro.394@gmail.com',
        repositoryURL: 'https://github.com/ontologypusher/mappings',
        repositoryFolder: {
            $filter: 'env',
            production: '/app/tmp/mappings-repo/',
            $default: '/tmp/mappings-repo'
        },
        repositoryMappingsFolder: 'mappings/',
        repositoryOntologyFolder: 'ontology/',
        repositoryBranch: 'master',
        updateFrequencyMinutes: 5
    },
    webProtegeIntegration: {
        mongodb:{
            uri:  {
                $filter: 'env',
                production: process.env.MONGODB_WEBPROTEGE_URI,
                $default: 'mongodb://localhost:27017/webprotege'
            }
        },
        projectID: '40d5ae46-18ec-4968-8f12-a2dd16f5b156/edit/Classes',
        webProtegeURL:{
            $filter: 'env',
            production: process.env.WEBPROTEGE_URL,
            $default:'http://192.168.1.5:8080/webprotege'
        },
        ontologyFileBaseName: 'dbpedia-ontology',   //Name of file to be saved in repository
        ontologyFormats: 'owx,owl,ttl,omx,ofn'      //Formats to extract

    },
    nodemailer: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'jedireza@gmail.com',
            pass: process.env.SMTP_PASSWORD
        }
    },
    system: {
        fromAddress: {
            name: 'Aqua',
            address: 'jedireza@gmail.com'
        },
        toAddress: {
            name: 'Aqua',
            address: 'jedireza@gmail.com'
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
