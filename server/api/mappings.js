'use strict';
const Joi = require('joi');
const EscapeRegExp = require('escape-string-regexp');
const Boom = require('boom');
const Config = require('../../config');

const internals = {};

//TODO: Make that URLs are separated with -
internals.applyRoutes = function (server, next) {

    const Mapping = server.plugins['hapi-mongo-models'].Mapping;
    const charLimit = Config.get('/mappings/charLimit');


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

                    const p = hydrateStatsPromise(res);
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

    server.route({
        method: 'GET',
        path: '/mappings/{template}/{lang}',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {

            //const fields = Mapping.fieldsAdapter(''); //We return everything
            const _id = { template: request.params.template, lang:request.params.lang };
            Mapping.findOne({ _id }, (err, mapping) => {

                if (err) {
                    return reply(err);
                }

                if (!mapping) {
                    return reply(Boom.notFound('Document not found.'));
                }

                //Now, we hydrate
                hydrateStatsPromise(mapping)
                    .then( () => {

                        reply(mapping);
                    })
                    .catch( () => {

                        return reply(Boom.internal('Error obtaining stats for mapping from DB'));
                    });

            });

        }
    });

    server.route({
        method: 'POST',
        path: '/mappings',
        config: {
            //Only authenticated users can create mappings
            auth: {
                strategy: 'session',
                scope: ['111111111111111111111111', '000000000000000000000000']
            },
            validate: {
                payload: {
                    template: Joi.string().required(),
                    lang: Joi.string().required(),
                    rml: Joi.string().required().allow(''),
                    comment: Joi.string().allow('')
                }
            },
            pre: [
                //AuthPlugin.preware.ensureHasPermissions('can-create-posts'),

                {
                    assign: 'idCheck',
                    method: function (request, reply) {

                        if (request.payload.rml.length > charLimit){
                            return reply(Boom.conflict('RML size must be at most ' + charLimit + ' characters long'));
                        }
                        //Todo: check that language is correct!

                        const _id = { template: request.payload.template, lang: request.payload.lang };
                        Mapping.findOne({ _id }, (err, user) => {

                            if (err) {
                                return reply(err);
                            }

                            if (user) {
                                return reply(Boom.conflict('Template already exists.'));
                            }

                            reply(true);
                        });

                    }
                }
            ]
        },
        handler: function (request, reply) {

            const template = request.payload.template;
            const lang = request.payload.lang;
            const rml = request.payload.rml;
            let comment = request.payload.comment;
            const username = request.auth.credentials.user.username;

            if (!comment || comment.length === 0){
                comment = 'Mapping created';
            }

            Mapping.create(template,lang, rml, username,comment, (err, mapping) => {

                if (err) {
                    return reply(err);
                }

                reply(mapping);
            });
        }
    });

    /**
     * First, finds the document. Then, copies it to history. Finally, updates the active document.
     */
    server.route({
        method: 'PUT',
        path: '/mappings/{template}/{lang}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['111111111111111111111111', '000000000000000000000000']
            },
            validate: {
                payload: {
                    rml: Joi.string().required().allow(''),
                    comment: Joi.string().required().allow('')
                }
            }
        },
        handler: function (request, reply) {

            const rml = request.payload.rml;
            const comment = request.payload.comment;
            const _id = {
                template: request.params.template,
                lang: request.params.lang
            };
            const update = { rml };
            const username = request.auth.credentials.user.username;


            if (rml.length > charLimit){
                return reply(Boom.conflict('RML size must be at most ' + charLimit + ' characters long'));
            }

            /* First, find the document */
            Mapping.findOne({ _id }, (err,mapping) => {


                if (err){
                    return reply(Boom.internal('Error while finding mapping'));
                }

                if (!mapping){
                    return reply(Boom.notFound('Mapping not found.'));
                }

                /*Then, archive the document */
                mapping.archive(false, (err,res) => {

                    if (err){
                        return reply(Boom.internal('Error while archiving mapping'));
                    }

                    /*Finally, document is updated */
                    mapping.update(update,username,comment, (err,updatedRes) => {

                        if (err) {
                            return reply(Boom.internal('Error while updating mapping'));
                        }

                        return reply(updatedRes);

                    });

                });
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/mappings/{template}/{lang}',
        config: {
            auth: {
                strategy: 'session'
            }
        },
        handler: function (request, reply) {



            const query = { _id: { template: request.params.template, lang: request.params.lang } };
            Mapping.findOne(query, (err, mapping) => {

                if (err) {
                    return reply(Boom.internal('Error retrieving mappings'));
                }

                if (!mapping) {
                    return reply(Boom.notFound('Mapping not found.'));
                }

                //Archive and mark as deleted. Automatically deleted from main collection
                mapping.archive(true, (err, res) => {

                    if (err) {
                        return reply(Boom.internal('Error archiving the old mapping.'));
                    }

                    reply({ success:true });
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
