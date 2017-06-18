'use strict';


const internals = {};


internals.applyRoutes = function (server, next) {

    server.route({
        method: 'GET',
        path: '/posts',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            }
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
