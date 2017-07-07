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
    port: {
        web: {
            $filter: 'env',
            test: 9000,
            production: process.env.PORT,
            $default: 8000
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
    webProtegeIntegration: {
        mongodb:{
            uri:  {
                $filter: 'env',
                production: process.env.MONGODB_WEBPROTEGE_URI,
                $default: 'mongodb://localhost:27017/webprotege'
            }
        },
        projectName: 'DBpedia ontology',
        webProtegeURL:{
            $filter: 'env',
            production: process.env.WEBPROTEGE_URL,
            $default:'http://localhost:8080/webprotege-3.0.0-SNAPSHOT'
        } ,
        localOntologyFolder: 'ontology-store',
        githubRepositoryFolder: {
            $filter: 'env',
            production: 'dbpedia-ontology',
            $default: 'ontologytest'
        },
        githubRepositoryURL: {
            $filter: 'env',
            production: 'https://github.com/ontologypusher/dbpedia-ontology',
            $default: 'https://github.com/ismaro3/ontologytest'
        },
        tempDirectory: 'temp',
        ontologyFileNameInputZip: 'root-ontology',
        ontologyFileBaseName: 'dbpedia-ontology',
        ontologyFormats: 'owx,owl,ttl,omx,ofn',
        ontologyUpdateFrequencyMinutes: 1

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
