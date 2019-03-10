'use strict';

const internals = {};

internals.applyRoutes = function (server, next) {
    //Frontend will redirect to admin or normal user view
    //Therefore, users view more complex view
    server.route({
        method: 'GET',
        path: '/github-updates/{glob*}',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            }
        },
        handler: function (request, reply) {

            //Pass credentials to personalize navbar
            reply.view('github-updates/index', { credentials: request.auth.credentials });
        }
    });
    next();
};

exports.register = function (server, options, next) {
    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);
    next();
};

exports.register.attributes = {
    name: 'web/github-updates'
};
