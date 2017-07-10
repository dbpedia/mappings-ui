'use strict';
const AuthPlugin = require('../auth');
const Boom = require('boom');
const EscapeRegExp = require('escape-string-regexp');
const Joi = require('joi');
const Config = require('../../config');

const internals = {};


internals.applyRoutes = function (server, next) {

    const Post = server.plugins['hapi-mongo-models'].Post;

    const charLimit = Config.get('/posts/charLimit');

    server.route({
        method: 'GET',
        path: '/posts',
        config: {
            auth: {
                strategy: 'session'
            },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    title: Joi.string().allow(''),
                    lasteditor: Joi.string().allow(''),
                    creator: Joi.string().allow(''),
                    visible: Joi.string().allow(''),
                    fields: Joi.string(),
                    sort: Joi.string().default('title'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [AuthPlugin.preware.ensureHasPermissions('can-list-posts')]
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
            const fields = Post.fieldsAdapter('postId title lastEdition creation visible');

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
        path: '/posts/public',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    title: Joi.string().allow(''),
                    fields: Joi.string(),
                    sort: Joi.string().default('-lastEdition.time'),
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

            query.visible = true;


            //Don't return markdown text in the list...
            const fields = Post.fieldsAdapter('postId title lastEdition');

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
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
            pre: [{
                //Check if page is visible. If not visible and user is not in admin groups -> error
                assign: 'postRetrieve',
                method: function (request, reply) {


                    //Retrieve the post
                    const query = { postId: request.params.id };
                    Post.findOne(query, (err, post) => {

                        if (err) {
                            return reply(err);
                        }

                        if (!post) {
                            return reply(Boom.notFound('Document not found.'));
                        }

                        //Check visibility. If not visible and user is not loged or is not in admin groups, return error instead of post.
                        if (!post.visible && (!request.auth.credentials || !('111111111111111111111111' in request.auth.credentials.user.groups))){
                            return reply(Boom.forbidden('Document not visible'));
                        }

                        reply(post);

                    });

                }
            }
            ]
        },
        handler: function (request, reply) {

            //Return Post object retrieved in check
            reply(request.pre.postRetrieve);

        }
    });


    server.route({
        method: 'POST',
        path: '/posts',
        config: {
            //Only admins can create posts
            auth: {
                strategy: 'session'
            },
            validate: {
                payload: {
                    title: Joi.string().required(),
                    markdown: Joi.string().required().allow(''),
                    visible: Joi.boolean().required()
                }
            },
            pre: [
                AuthPlugin.preware.ensureHasPermissions('can-create-posts'),

                {
                    assign: 'postIdCheck',
                    method: function (request, reply) {
                        //When is trying to change title, check that no repeated

                        if (request.payload.markdown.length > charLimit){
                            return reply(Boom.conflict('Markdown size must be at most ' + charLimit + ' characters long'));
                        }

                        const newPostId = Post.idFromTitle(request.payload.title);


                        const conditions = {
                            postId: newPostId
                        };


                        Post.findOne(conditions, (err, user) => {

                            if (err) {
                                return reply(err);
                            }

                            if (user) {
                                return reply(Boom.conflict('Title already in use.'));
                            }

                            reply(true);
                        });




                    }
                }
            ]
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
            auth: {
                strategy: 'session'
            },
            validate: {
                payload: {
                    title: Joi.string().required(),
                    markdown: Joi.string().required().allow(''),
                    visible: Joi.boolean().required()
                }
            },
            pre: [
                AuthPlugin.preware.ensureHasPermissions('can-edit-posts'),
                {
                    assign: 'postIdCheck',
                    method: function (request, reply) {

                        if (request.payload.markdown.length > charLimit){
                            return reply(Boom.conflict('Markdown size must be at most ' + charLimit + ' characters long'));
                        }

                        //When is trying to change title, check that no repeated

                        const newPostId = Post.idFromTitle(request.payload.title);

                        //Not trying to change title: no problem
                        if ( newPostId === request.params.id){
                            reply(true);
                        }

                        else {
                            const conditions = {
                                postId: newPostId
                            };


                            Post.findOne(conditions, (err, user) => {

                                if (err) {
                                    return reply(err);
                                }

                                if (user) {
                                    return reply(Boom.conflict('Title already in use.'));
                                }

                                reply(true);
                            });

                        }


                    }
                }
            ]
        },
        handler: function (request, reply) {

            const title = request.payload.title;
            const newId = Post.idFromTitle(request.payload.title);
            const visible = request.payload.visible;


            const update = {
                $set: {
                    markdown: request.payload.markdown,
                    lastEdition: {
                        username: request.auth.credentials.user.username,
                        time: new Date()
                    }
                }
            };

            if (request.params.id !== 'home'){ //Only update postId, title and visible when not home

                update.$set.postId = newId;
                update.$set.title = title;
                update.$set.visible = visible;
            }

            const query = { postId: request.params.id };

            Post.findOneAndUpdate(query, update, (err, post) => {

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
                strategy: 'session'
            },

            pre: [AuthPlugin.preware.ensureHasPermissions('can-remove-posts'),
                (request,reply) => {

                    if (request.params.id === 'home') {
                        reply(Boom.methodNotAllowed('Home page cannot be deleted'));
                    }
                    else {
                        reply();
                    }
                }
            ]

        },
        handler: function (request, reply) {



            const query = { postId: request.params.id };
            Post.findOneAndDelete(query, (err, post) => {

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
