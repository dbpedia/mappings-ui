'use strict';
const Joi = require('joi');
const internals = {};

internals.applyRoutes = function (server, next) {
    const MappingUpdateStatus = server.plugins['hapi-mongo-models'].MappingUpdateStatus;
    const OntologyUpdateStatus = server.plugins['hapi-mongo-models'].OntologyUpdateStatus;

    server.route({
        method: 'GET',
        path: '/github-updates/mappings',
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
                    //Can search by template (full name), lang, username that edited, status
                    fields: Joi.string(),
                    sort: Joi.string().default('-startDate'),
                    limit: Joi.number().default(10),
                    page: Joi.number().default(1)
                }
            }
        },
        handler: function (request, reply) {

            const query = {};
            const fields = MappingUpdateStatus.fieldsAdapter('');
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            MappingUpdateStatus.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err){
                    return reply(err);
                }

                if (!results.data){
                    return reply(results);
                }


                reply(results);


            });
        }
    });

    server.route({
        method: 'GET',
        path: '/github-updates/ontology',
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
                    //Can search by template (full name), lang, username that edited, status
                    fields: Joi.string(),
                    sort: Joi.string().default('-startDate'),
                    limit: Joi.number().default(10),
                    page: Joi.number().default(1)
                }
            }
        },
        handler: function (request, reply) {
            const query = {};
            const fields = OntologyUpdateStatus.fieldsAdapter('');
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            OntologyUpdateStatus.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err){
                    return reply(err);
                }

                if (!results.data){
                    return reply(results);
                }
                reply(results);
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/github-updates',
        config: {
            //Only authenticated users can delete
            auth: {
                strategy: 'session',
                scope: ['111111111111111111111111', '000000000000000000000000']
            }
        },
        handler: function (request, reply) {
            const query = {};
            MappingUpdateStatus.deleteMany(query,(err,res) => {
                if (err){
                    return reply(err);
                }
                OntologyUpdateStatus.deleteMany(query, (err,res2) => {
                    if (err){
                        return reply(err);
                    }
                    return reply(null,res);
                });
            });
        }
    });
    next();
};

exports.register = function (server, options, next) {
    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);
    next();
};

exports.register.attributes = {
    name: 'github-updates'
};
