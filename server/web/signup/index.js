'use strict';


const internals = {};

internals.applyRoutes = function (server, next) {

    server.route({
        method: 'GET',
        path: '/signup',
        config: {
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } }
        },
        handler: function (request, reply) {
            //Pass credentials to personalize navbar
            reply.view('signup/index', { credentials: request.auth.credentials });
        }
    });


    next();
};


exports.register = function (server, options, next) {

    server.dependency(['auth'], internals.applyRoutes);

    next();
};

exports.register.attributes = {
    name: 'web/signup'
};
