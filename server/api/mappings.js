'use strict';
const Joi = require('joi');


const internals = {};


internals.applyRoutes = function (server, next) {

    //const Post = server.plugins['hapi-mongo-models'].Post;



    server.route({
        method: 'GET',
        path: '/mappings',
        config: {
            auth: {
                strategy: 'session'
            },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    name: Joi.string().allow(''),
                    lang: Joi.string().allow(''),
                    fields: Joi.string(),
                    sort: Joi.string().default('name'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            }
        },
        handler: function (request, reply) {

            const results = [

                {
                    _id: 'Astronaut',
                    name: 'Astronaut',
                    lang: 'es',
                    numOcurrences: 125,
                    numProperties: 12,
                    numMappedProperties: 12,
                    status: {
                        error: false,
                        message: 'OK'
                    }
                },
                {
                    _id: 'Writer',
                    name: 'Writer',
                    lang: 'en',
                    numOcurrences: 543,
                    numProperties: 14,
                    numMappedProperties: 10,
                    status: {
                        error: false,
                        message: 'OK'
                    },
                    ignore: true

                },
                {
                    _id: 'Musical Artist Infobox Completed',
                    name: 'Election box hold with party link ',
                    lang: 'de',
                    numOcurrences: 134,
                    numProperties: 3,
                    numMappedProperties: 1,
                    status: {
                        error: true,
                        message: 'Syntax error'
                    }
                },
                {
                    _id: 'Painter',
                    name: 'Painter',
                    lang: 'it',
                    numOcurrences: 4129,
                    numProperties: 54,
                    numMappedProperties: 30,
                    status: {
                        error: false,
                        message: 'OK'
                    }
                },
                {
                    _id: 'Politician',
                    name: 'Politician',
                    lang: 'ca',
                    numOcurrences: 45,
                    numProperties: 9,
                    numMappedProperties: 1,
                    status: {
                        error: false,
                        message: 'OK'
                    }
                },
                {
                    _id: 'Police',
                    name: 'Police',
                    lang: 'ca',
                    numOcurrences: 45,
                    numProperties: 9,
                    numMappedProperties: 0,
                    status: {
                        error: true,
                        message: 'Not mapped'
                    }
                }

            ];

            reply({ data:results });

        }
    });



    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'mappings'
};
