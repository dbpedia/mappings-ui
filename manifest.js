'use strict';
const Confidence = require('confidence');
const Config = require('./config.js');


const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the plot device.',
    server: {
        debug: {
            request: ['error']
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/web'),
        labels: ['web'],
        state: {
            isHttpOnly: false,
            isSecure: {
                $filter: 'env',
                production: true,
                $default: false
            }
        }
    }],
    registrations: [
        {
            plugin: 'inert'
        },
        {
            plugin: 'hapi-auth-cookie'
        },
        {
            plugin: {
                register: 'crumb',
                options: {
                    restful: true
                }
            }
        },
        {
            plugin: 'vision'
        },
        {
            plugin: {
                register: 'visionary',
                options: {
                    engines: { jsx: 'hapi-react-views' },
                    relativeTo: __dirname,
                    path: './server/web'
                }
            }
        },
        {
            plugin: {
                register: 'hapi-mongo-models',
                options: {
                    mongodb: Config.get('/hapiMongoModels/mongodb'),
                    models: {
                        Account: './server/models/account',
                        AccountGroup: './server/models/account-group',
                        AuthAttempt: './server/models/auth-attempt',
                        Session: './server/models/session',
                        Status: './server/models/status',
                        Post: './server/models/post',
                        Mapping: './server/models/mapping',
                        MappingHistory: './server/models/mapping-history',
                        CurrentMappingStats: './server/models/currentMappingStats'
                    },
                    autoIndex: Config.get('/hapiMongoModels/autoIndex')
                }
            }
        },
        {
            plugin: './server/auth'
        },
        {
            plugin: './server/mailer'
        },
        {
            plugin: './server/api/accounts',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/account-groups',
            options: {
                routes: { prefix: '/api' }
            }
        },

        {
            plugin: './server/api/auth-attempts',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/contact',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/index',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/login',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/logout',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/sessions',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/signup',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/statuses',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/posts',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/mappings',
            options: {
                routes: { prefix: '/api' }
            }
        },

        {
            plugin: './server/web/about'
        },
        {
            plugin: './server/web/profile'
        },
        {
            plugin: './server/web/adminpanel'
        },
        {
            plugin: './server/web/contact'
        },
        {
            plugin: './server/web/home'
        },
        {
            plugin: './server/web/login'
        },
        {
            plugin: './server/web/public'
        },
        {
            plugin: './server/web/signup'
        },
        {
            plugin: './server/web/groups'
        },
        {
            plugin: './server/web/accounts'
        },
        {
            plugin: './server/web/postslist'
        },
        {
            plugin: './server/web/mappings'
        }
    ]
};


const store = new Confidence.Store(manifest);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
