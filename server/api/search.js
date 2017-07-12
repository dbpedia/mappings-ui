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

    server.route({
        method: 'GET',
        path: '/search/wiki',
        config: {
            auth: {
                strategy: 'session'
            },
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




    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'search'
};
