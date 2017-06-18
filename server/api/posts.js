'use strict';
const Boom = require('boom');
const EscapeRegExp = require('escape-string-regexp');
const Joi = require('joi');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Post = server.plugins['hapi-mongo-models'].Post;


    server.route({
        method: 'GET',
        path: '/posts',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    title: Joi.string().allow(''),
                    lasteditor: Joi.string().allow(''),
                    creator: Joi.string().allow(''),
                    visible: Joi.string().allow(''),
                    fields: Joi.string(),
                    sort: Joi.string().default('_id'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            }
        },
        handler: function (request, reply) {


            const query = {};
            if (request.query.title) {
                query.title = new RegExp('^.*?' + EscapeRegExp(request.query.title) + '.*$', 'i');
            }

            if (request.query.lasteditor){
                query['lastEdition.username'] = new RegExp('^.*?' + EscapeRegExp(request.query.lasteditor) + '.*$', 'i');
            }

            if (request.query.creator){
                query['creation.username'] = new RegExp('^.*?' + EscapeRegExp(request.query.creator) + '.*$', 'i');
            }

            if (request.query.visible){
                query.visible = request.query.visible === 'true';
            }

            //Don't return markdown text in the list...
            const fields = Post.fieldsAdapter('_id title lastEdition creation visible');

            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            Post.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply(results);
            });
        }
    });



    server.route({
        method: 'GET',
        path: '/posts/{id}',
        //Anybody can see a post, no authentication checks
        handler: function (request, reply) {

            Post.findById(request.params.id, (err, post) => {

                if (err) {
                    return reply(err);
                }

                if (!post) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(post);
            });
        }
    });


    server.route({
        method: 'POST',
        path: '/posts',
        config: {
            //Only admins can create posts
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                payload: {
                    title: Joi.string().required(),
                    markdown: Joi.string().required().allow(''),
                    visible: Joi.boolean().required()
                }
            }
        },
        handler: function (request, reply) {

            const title = request.payload.title;
            const markdown = request.payload.markdown;
            const visible = request.payload.visible;
            const username = request.auth.credentials.user.username;

            Post.create(title,markdown, username, visible, (err, accountGroup) => {

                if (err) {
                    return reply(err);
                }

                reply(accountGroup);
            });
        }
    });


    server.route({
        method: 'PUT',
        path: '/posts/{id}',
        config: {
            //Only admins can edit posts
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                payload: {
                    title: Joi.string().required(),
                    markdown: Joi.string().required().allow(''),
                    visible: Joi.boolean().required()
                }
            }
        },
        handler: function (request, reply) {

            const newId = Post.idFromTitle(request.payload.title);
            const oldId = request.params.id;
            const update = {
                $set: {
                    _id: newId,
                    title: request.payload.title,
                    visible: request.payload.visible,
                    lastEdition: {
                        username: request.auth.credentials.user.username,
                        time: new Date()
                    }
                }
            };

            Post.findByIdAndUpdate(oldId, update, (err, post) => {

                if (err) {
                    return reply(err);
                }

                if (!post) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(post);
            });
        }
    });





    server.route({
        method: 'DELETE',
        path: '/posts/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                //Account and Admin groups cannot be removed
                //Todo: home page can't be removed
            }
        },
        handler: function (request, reply) {

            Post.findByIdAndDelete(request.params.id, (err, post) => {

                if (err) {
                    return reply(err);
                }

                if (!post) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply({ success: true });
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
    name: 'posts'
};
