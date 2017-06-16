'use strict';


const internals = {};


internals.applyRoutes = function (server, next) {

    server.route({
        method: 'GET',
        path: '/profile/{glob*}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['000000000000000000000000', '111111111111111111111111']
            }
        },
        handler: function (request, reply) {

            reply.view('profile/index', { credentials: request.auth.credentials });
        }
    });


    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};


exports.register.attributes = {
    name: 'web/profile'
};
