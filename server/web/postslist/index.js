'use strict';
const AuthPlugin = require('../../auth');


const internals = {};


internals.applyRoutes = function (server, next) {

    server.route({
        method: 'GET',
        path: '/posts',
        config: {
            auth: {
                strategy: 'session'
            },
            pre: [AuthPlugin.preware.ensureHasPermissions('can-list-posts')]
        },
        handler: function (request, reply) {

            //Pass credentials to personalize navbar
            reply.view('postslist/index', { credentials: request.auth.credentials });
        }
    });


    server.route({
        method: 'GET',
        path: '/posts/edit/{glob*}',
        config: {
            auth: {
                strategy: 'session'
            },
            pre: [AuthPlugin.preware.ensureHasPermissions('can-edit-posts')]
        },
        handler: function (request, reply) {

            //Pass credentials to personalize navbar
            reply.view('postslist/index', { credentials: request.auth.credentials });
        }
    });

    server.route({
        method: 'GET',
        path: '/posts/view/{glob*}',
        config:{
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {

            //Pass credentials to personalize navbar
            reply.view('postslist/index', { credentials: request.auth.credentials });
        }
    });





    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'web/posts'
};
