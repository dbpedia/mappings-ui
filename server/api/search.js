'use strict';
const Joi = require('joi');

const internals = {};

//TODO: Implement it to retrieve real wikipedia pages. Maybe, wire the frontend directly to Wikipedia API.
internals.applyRoutes = function (server, next) {


    const pages = [
        {
            title: 'David_Beckham',
            url: 'http://wikipedia.org/wiki/David_Beckham'
        },
        {
            title: 'Abcd_efgh_ijklm_nopqrs_uvwxyz',
            url: 'http://wikipedia.org/wiki/David_Beckham'
        }
    ];


    const classes = [
        {
            name: 'dbo:Soccer_Player',
            uri: 'http://wikipedia.org/wiki/David_Beckham',
            count: 2352
        },
        {
            name: 'dbp:BirthPlace',
            uri: 'http://wikipedia.org/wiki/David_Beckham',
            count: 1234
        },
        {
            name: 'dbo:Politician',
            uri: 'http://wikipedia.org/wiki/David_Beckham',
            count: 123
        }
    ];

    const properties = [
        {
            name: 'dbo:project',
            domain: 'dbo:Person',
            range: 'dbo:Project',
            uri: 'http://wikipedia.org/wiki/David_Beckham',
            count: 2352
        },
        {
            name: 'dbo:population',
            domain: 'dbo:PopulatedPlace',
            range: 'dbo:Population',
            uri: 'http://wikipedia.org/wiki/David_Beckham',
            count: 1234
        },
        {
            name: 'dbo:musicBand',
            domain: 'dbo:MusicalArtist',
            range: 'dbo:Band',
            uri: 'http://wikipedia.org/wiki/David_Beckham',
            count: 742
        }
    ];

    server.route({
        method: 'GET',
        path: '/search/wiki',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    title: Joi.string().allow('').default('')
                }
            }
        },
        handler: function (request, reply) {

            const input = request.query.title;

            const results =  input.length === 0 ? [] : pages.filter((page) =>

                page.title.toLowerCase().indexOf(input.toLowerCase()) > -1
            );

            reply(results);
        }
    });

    server.route({
        method: 'GET',
        path: '/search/classes',
        config: {
            auth: {
                strategy: 'session'
            },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    name: Joi.string().allow('').default('')
                }
            }
        },
        handler: function (request, reply) {

            const input = request.query.name;

            const results =  input.length === 0 ? [] : classes.filter((page) =>

                page.name.toLowerCase().indexOf(input.toLowerCase()) > -1
            );

            reply(results);
        }
    });

    server.route({
        method: 'GET',
        path: '/search/properties',
        config: {
            auth: {
                strategy: 'session'
            },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    name: Joi.string().allow('').default('')
                }
            }
        },
        handler: function (request, reply) {

            const input = request.query.name;

            const results =  input.length === 0 ? [] : properties.filter((page) =>

                page.name.toLowerCase().indexOf(input.toLowerCase()) > -1
            );

            reply(results);
        }
    });


    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'search'
};
