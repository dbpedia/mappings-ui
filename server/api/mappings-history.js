'use strict';
const Joi = require('joi');
const Boom = require('boom');
const AuthPlugin = require('../auth');
const internals = {};

internals.applyRoutes = function (server, next) {

    const MappingHistory = server.plugins['hapi-mongo-models'].MappingHistory;


    server.route({
        method: 'GET',
        path: '/mappings-history/{template}/{lang}',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            validate: {
                query: {
                    sort: Joi.string().default('-_id.version'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {

            const query = {
                '_id.template': request.params.template,
                '_id.lang': request.params.lang
            };

            const fields = MappingHistory.fieldsAdapter('_id templateFullName edition version status deleted');
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            MappingHistory.pagedFind(query, fields, sort, limit, page, (err, results) => {

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
        path: '/mappings-history/{template}/{lang}/{version}',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            validate: {
                params: {
                    //Can search by template (full name), lang, username that edited, status
                    template: Joi.string().required(),
                    lang: Joi.string().required(),
                    version: Joi.number().required()
                }
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {

            const _id = { template: request.params.template, lang:request.params.lang, version: request.params.version };
            MappingHistory.findOne({ _id }, (err, mapping) => {

                if (err) {
                    return reply(err);
                }

                if (!mapping) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(mapping);


            });

        }
    });

    server.route({
        method: 'POST',
        path: '/mappings-history/{template}/{lang}/{version}',
        config: {
            //Only authenticated users can restore
            auth: {
                strategy: 'session',
                scope: ['111111111111111111111111', '000000000000000000000000']
            },
            validate: {
                params: {
                    template: Joi.string().required(),
                    lang: Joi.string().required(),
                    version: Joi.number().required()
                }
            },
            pre: [AuthPlugin.preware.ensureHasPermissions('can-restore-mappings')]
        },
        handler: function (request, reply) {

            const template = request.params.template;
            const lang = request.params.lang;
            const version = request.params.version;
            const username = request.auth.credentials.user.username;

            MappingHistory.restoreFromHistory(username,template,lang,version, (err,res) => {

                if (err){
                    return reply(err);
                }

                reply(null,res);
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
    name: 'mappings-history'
};
