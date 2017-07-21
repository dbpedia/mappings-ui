'use strict';


const internals = {};


internals.applyRoutes = function (server, next) {


    /*
     * List of mappings, public
     */
    server.route({
        method: 'GET',
        path: '/mappings',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {

            //Pass credentials to personalize navbar
            reply.view('mappings/index', { credentials: request.auth.credentials });
        }
    });

    server.route({
        method: 'GET',
        path: '/mappings/test',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {

            //Pass credentials to personalize navbar
            reply.view('mappings/index', { credentials: request.auth.credentials });
        }
    });


    server.route({
        method: 'GET',
        path: '/mappings/edit/{glob*}',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {

            //Pass credentials to personalize navbar
            reply.view('mappings/index', { credentials: request.auth.credentials });
        }
    });

    server.route({
        method: 'GET',
        path: '/mappings/view/{glob*}',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {

            //Pass credentials to personalize navbar
            reply.view('mappings/index', { credentials: request.auth.credentials });
        }
    });


    server.route({
        method: 'GET',
        path: '/mappings/history/{glob*}',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {

            //Pass credentials to personalize navbar
            reply.view('mappings/index', { credentials: request.auth.credentials });
        }
    });










    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'web/mappings'
};
