'use strict';
const Joi = require('joi');
const EscapeRegExp = require('escape-string-regexp');
const Boom = require('boom');

const internals = {};


internals.applyRoutes = function (server, next) {

    const Mapping = server.plugins['hapi-mongo-models'].Mapping;


    server.route({
        method: 'GET',
        path: '/mappings',
        config: {
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            },
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            validate: {
                query: {
                    //Can search by template, lang, username that edited, status
                    template: Joi.string().allow(''),
                    lang: Joi.string().allow(''),
                    username: Joi.string().allow(''),
                    status: Joi.string().allow(''),
                    fields: Joi.string(),
                    sort: Joi.string().default('template'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            }
        },
        handler: function (request, reply) {

            const query = {};
            if (request.query.template) {
                query['_id.template'] = new RegExp('^.*?' + EscapeRegExp(request.query.template) + '.*$', 'i');
            }
            if (request.query.lang) {
                query['_id.lang'] = new RegExp('^.*?' + EscapeRegExp(request.query.lang) + '.*$', 'i');
            }
            if (request.query.username) {

                query['edition.username'] = new RegExp('^.*?' + EscapeRegExp(request.query.username) + '.*$', 'i');
            }
            if (request.query.status) {
                query.status = new RegExp('^.*?' + EscapeRegExp(request.query.status) + '.*$', 'i');
            }

            const fields = Mapping.fieldsAdapter('_id status edition stats');
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            Mapping.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err){
                    return reply(err);
                }

                if (!results.data){
                    return reply(results);
                }

                //Now, we have to populate.
                const promises = [];
                results.data.forEach((res) => {

                    const p = hydrateStatsPromise(res)
                        .then((r) => {

                            return r;
                        });
                    promises.push(p);
                });


                Promise.all(promises)
                    .then( () => {

                        reply(results);
                    })
                    .catch( () => {

                        return reply(Boom.internal('Error obtaining stats for mapping from DB'));
                    });

            });
        }
    });



    next();
};


const hydrateStatsPromise = function (mappingObject){

    return new Promise((resolve, reject)  => {

        mappingObject.hydrateStats((err,res) => {

            if (err){
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });

};

exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'mappings'
};
