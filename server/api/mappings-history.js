'use strict';
const Joi = require('joi');
const Boom = require('boom');
const AuthPlugin = require('../auth');
const internals = {};
const EscapeRegExp = require('escape-string-regexp');

internals.applyRoutes = function (server, next) {

    const MappingHistory = server.plugins['hapi-mongo-models'].MappingHistory;
    const CurrentMappingStats = server.plugins['hapi-mongo-models'].CurrentMappingStats;
    const Mapping = server.plugins['hapi-mongo-models'].Mapping;

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


    /**
     * To show deleted mappings.
     */
    server.route({
        method: 'GET',
        path: '/mappings-history/deleted',
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
                    template: Joi.string().allow(''),
                    lang: Joi.string().allow(''),
                    username: Joi.string().allow(''),
                    errored: Joi.string().allow(''),
                    status: Joi.string().allow(''),
                    fields: Joi.string(),
                    sort: Joi.string().default('-_id.template'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            }
        },
        handler: function (request, reply) {

            const query = {};
            if (request.query.template) {
                query.templateFullName = new RegExp('^.*?' + EscapeRegExp(request.query.template) + '.*$', 'i');
            }
            if (request.query.lang && request.query.lang.length > 0) {
                query['_id.lang'] = new RegExp( EscapeRegExp(request.query.lang), 'i');
            }
            if (request.query.username) {

                query['edition.username'] = new RegExp('^.*?' + EscapeRegExp(request.query.username) + '.*$', 'i');
            }
            if (request.query.status) {
                query['status.message'] = new RegExp('^.*?' + EscapeRegExp(request.query.status) + '.*$', 'i');
            }

            if (request.query.minCompletion && request.query.minCompletion > 0) {
                if (query['stats.mappedPercentage']){
                    query['stats.mappedPercentage'].$gte = '' + request.query.minCompletion;
                }
                else {
                    query['stats.mappedPercentage'] = { $gte: '' + request.query.minCompletion };
                }

            }

            if (request.query.maxCompletion && request.query.maxCompletion < 100) {
                if (query['stats.mappedPercentage']){
                    query['stats.mappedPercentage'].$lte = '' + request.query.maxCompletion;
                }
                else {
                    query['stats.mappedPercentage'] = { $lte: '' + request.query.maxCompletion };
                }

            }


            if (request.query.errored) {
                query['status.error'] = request.query.errored === 'true';
            }

            query.deleted = true; //Only deleted!!
            const fields = MappingHistory.fieldsAdapter('_id status edition templateFullName deletion');
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

    /**
     * Completely deletes a mapping from history and stats. To make sure,
     * also deletes mapping from active
     */
    server.route({
        method: 'DELETE',
        path: '/mappings-history/{template}/{lang}',
        config: {
            //Only authenticated users can delete
            auth: {
                strategy: 'session',
                scope: ['111111111111111111111111', '000000000000000000000000']
            },
            validate: {
                params: {
                    template: Joi.string().required(),
                    lang: Joi.string().required()
                }
            },
            pre: [AuthPlugin.preware.ensureHasPermissions('can-remove-mappings-history')]
        },
        handler: function (request, reply) {


            const template = request.params.template;
            const lang = request.params.lang;

            const query = { '_id.template':template,'_id.lang':lang };
            MappingHistory.deleteMany(query,(err,res) => {

                console.log(res);
                if (err){
                    return reply(err);
                }

                CurrentMappingStats.findOneAndDelete(query, (err,res2) => {

                    if (err){
                        return reply(err);
                    }


                    Mapping.deleteMany(query,(err,res3) => {

                        if (err){
                            return reply(err);
                        }

                        return reply(null,res);
                    });


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
    name: 'mappings-history'
};
