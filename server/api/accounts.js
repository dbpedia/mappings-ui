'use strict';

const Boom = require('boom');
const EscapeRegExp = require('escape-string-regexp');
const Joi = require('joi');


const internals = {};


internals.applyRoutes = function (server, next) {

    const Account = server.plugins['hapi-mongo-models'].Account;


    server.route({
        method: 'GET',
        path: '/accounts',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                query: {
                    username: Joi.string().allow(''),
                    name: Joi.string().allow(''),
                    group: Joi.string().allow(''),
                    isActive: Joi.string().allow(''),
                    fields: Joi.string(),
                    sort: Joi.string().default('_id'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }

            }
        },
        handler: function (request, reply) {

            const query = {};
            if (request.query.username) {
                query.username = new RegExp('^.*?' + EscapeRegExp(request.query.username) + '.*$', 'i');
            }
            if (request.query.isActive) {
                query.isActive = request.query.isActive === 'true';
            }
            //Remember, groups are stored like this. groups: { key: 'name',key2: 'name2'}
            if (request.query.group) {
                query['groups.' + request.query.group] = new RegExp('.*');
            }

            if (request.query.name){
                //query.name = new RegExp('^.*?' + EscapeRegExp(request.query.name) + '.*$', 'i');
                const nameParts = request.query.name.split(' ');
                if (nameParts.length === 1){
                    query['name.first'] = new RegExp('^.*?' + EscapeRegExp(request.query.name) + '.*$', 'i');
                }
                else if (nameParts.length === 2){
                    query['name.first'] = new RegExp('^.*?' + EscapeRegExp(nameParts[0]) + '.*$', 'i');
                    query['name.last'] = new RegExp('^.*?' + EscapeRegExp(nameParts[1]) + '.*$', 'i');
                }
                else if (nameParts.length === 3){
                    query['name.first'] = new RegExp('^.*?' + EscapeRegExp(nameParts[0]) + '.*$', 'i');
                    query['name.middle'] = new RegExp('^.*?' + EscapeRegExp(nameParts[1]) + '.*$', 'i');
                    query['name.last'] = new RegExp('^.*?' + EscapeRegExp(nameParts[2]) + '.*$', 'i');
                }


            }


            const fields = Account.fieldsAdapter('_id isActive username name email timeCreated timeLastLogin groups permissions mappingsLang');
            const sort = request.query.sort;
            const limit = request.query.limit;
            const page = request.query.page;

            Account.pagedFind(query, fields, sort, limit, page, (err, results) => {

                if (err) {
                    return reply(err);
                }

                reply(results);
            });
        }
    });


    server.route({
        method: 'GET',
        path: '/accounts/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            }
        },
        handler: function (request, reply) {

            const fields = Account.fieldsAdapter('_id isActive username name email timeCreated timeLastLogin groups permissions mappingsLang');
            Account.findById(request.params.id, fields, (err, account) => {

                if (err) {
                    return reply(err);
                }

                if (!account) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(account);
            });
        }
    });


    server.route({
        method: 'GET',
        path: '/accounts/my',
        config: {
            auth: {
                strategy: 'session',
                scope: ['111111111111111111111111','000000000000000000000000']
            }
        },
        handler: function (request, reply) {

            const id = request.auth.credentials.user._id.toString();
            const fields = Account.fieldsAdapter('username name email timeCreated timeLastLogin groups mappingsLang');

            Account.findById(id, fields, (err, account) => {

                if (err) {
                    return reply(err);
                }

                if (!account) {
                    return reply(Boom.notFound('Document not found. That is strange.'));
                }

                reply(account);
            });
        }
    });


    /*
     * Create a new account. Requires username, email, password, and name
     */
    server.route({
        method: 'POST',
        path: '/accounts',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                payload: {
                    username: Joi.string().token().lowercase().required(),
                    email: Joi.string().email().lowercase().required(),
                    password: Joi.string().required(),
                    name: Joi.string().required(),
                    mappingsLang: Joi.string().required()
                }
            },
            pre: [
                //AuthPlugin.preware.ensureAdminGroup('root'),
                {
                    assign: 'usernameCheck',
                    method: function (request, reply) {

                        const conditions = {
                            username: request.payload.username
                        };

                        Account.findOne(conditions, (err, user) => {

                            if (err) {
                                return reply(err);
                            }

                            if (user) {
                                return reply(Boom.conflict('Username already in use.'));
                            }

                            reply(true);
                        });
                    }
                }, {
                    assign: 'emailCheck',
                    method: function (request, reply) {

                        const conditions = {
                            email: request.payload.email
                        };

                        Account.findOne(conditions, (err, user) => {

                            if (err) {
                                return reply(err);
                            }

                            if (user) {
                                return reply(Boom.conflict('Email already in use.'));
                            }

                            reply(true);
                        });
                    }
                }
            ]
        },
        handler: function (request, reply) {

            const username = request.payload.username;
            const password = request.payload.password;
            const email = request.payload.email;
            const name = request.payload.name;
            const mappingsLang = request.payload.mappingsLang;

            Account.create(name,username, password, email,mappingsLang, (err, user) => {

                if (err) {
                    return reply(err);
                }

                reply(user);
            });
        }
    });


    /**
     * Modify account permissions
     */
    server.route({
        method: 'PUT',
        path: '/accounts/{id}/permissions',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                params: {
                    id: Joi.string().invalid('111111111111111111111111')
                },
                payload: {
                    permissions: Joi.object().required()
                }
            },
            pre: [
                //AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            const id = request.params.id;
            const update = {
                $set: {
                    permissions: request.payload.permissions
                }
            };

            Account.findByIdAndUpdate(id, update, (err, account) => {

                if (err) {
                    return reply(err);
                }

                reply(account);
            });
        }
    });


    /**
     * Modify groups of an account
     */
    server.route({
        method: 'PUT',
        path: '/accounts/{id}/groups',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                params: {
                    id: Joi.string().invalid('111111111111111111111111')
                },
                payload: {
                    groups: Joi.object().required()
                }
            },
            pre: [
                //AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            const id = request.params.id;


            const update = {
                $set: {
                    groups: request.payload.groups
                }
            };

            //Account has to be always present
            if (!('000000000000000000000000' in update.$set.groups)) {
                update.$set.groups['000000000000000000000000'] = 'Account';
            }

            Account.findByIdAndUpdate(id, update, (err, account) => {

                if (err) {
                    return reply(err);
                }

                reply(account);
            });
        }
    });


    /**
     * Modify email, username,  name of an account (Modifiable by admin).
     * Root user has to modify it using its page.
     */
    server.route({
        method: 'PUT',
        path: '/accounts/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {

                payload: {
                    name: Joi.object().keys({
                        first: Joi.string().required(),
                        middle: Joi.string().allow(''),
                        last: Joi.string().allow('')
                    }).required(),
                    username: Joi.string().token().lowercase().required(),
                    email: Joi.string().email().lowercase().required(),
                    mappingsLang: Joi.string().lowercase().required()
                },
                params: {
                    id: Joi.string().invalid('111111111111111111111111')
                }
            },
            pre: [
                //AuthPlugin.preware.ensureAdminGroup('root'),
                {
                    assign: 'usernameCheck',
                    method: function (request, reply) {


                        const conditions = {
                            username: request.payload.username,
                            _id: { $ne: Account._idClass(request.params.id) }
                        };

                        Account.findOne(conditions, (err, user) => {

                            if (err) {
                                return reply(err);
                            }

                            if (user) {
                                return reply(Boom.conflict('Username already in use.'));
                            }

                            reply(true);
                        });
                    }
                }, {
                    assign: 'emailCheck',
                    method: function (request, reply) {


                        const conditions = {
                            email: request.payload.email,
                            _id: { $ne: Account._idClass(request.params.id) }
                        };


                        Account.findOne(conditions, (err, user) => {

                            if (err) {
                                return reply(err);
                            }

                            if (user) {
                                return reply(Boom.conflict('Email already in use.'));
                            }

                            reply(true);
                        });
                    }
                }
            ]
        },

        handler: function (request, reply) {



            const id = request.params.id;
            const update = {
                $set: {
                    name: request.payload.name,
                    email: request.payload.email,
                    username: request.payload.username,
                    mappingsLang: request.payload.mappingsLang
                }
            };


            Account.findByIdAndUpdate(id, update, (err, account) => {

                if (err) {
                    return reply(err);
                }

                if (!account) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(account);
            });
        }
    });


    /**
     * Update account info, but by the account itself. Only can update name and email, not username.
     */
    server.route({
        method: 'PUT',
        path: '/accounts/my',
        config: {
            auth: {
                strategy: 'session',
                scope:['111111111111111111111111','000000000000000000000000']
            },
            validate: {
                payload: {
                    name: Joi.object().keys({
                        first: Joi.string().required(),
                        middle: Joi.string().allow(''),
                        last: Joi.string().allow('')
                    }).required(),
                    email: Joi.string().email().lowercase().required(),
                    mappingsLang: Joi.string().lowercase().required()
                }
            },
            pre: [

                {
                    assign: 'emailCheck',
                    method: function (request, reply) {

                        const conditions = {
                            email: request.payload.email,
                            _id: { $ne: request.auth.credentials.user._id }
                        };



                        Account.findOne(conditions, (err, user) => {

                            if (err) {
                                return reply(err);
                            }

                            if (user) {
                                return reply(Boom.conflict('Email already in use.'));
                            }

                            reply(true);
                        });
                    }
                }
            ]

        },

        handler: function (request, reply) {

            const id = request.auth.credentials.user._id.toString();
            const update = {
                $set: {
                    name: request.payload.name,
                    email: request.payload.email,
                    mappingsLang: request.payload.mappingsLang
                }
            };

            Account.findByIdAndUpdate(id, update, (err, account) => {

                if (err) {
                    return reply(err);
                }

                reply(account);
            });
        }
    });


    /**
     * Update password by admin. Root password cannot be modified here.
     * The own root has to modify it using its account page.
     */
    server.route({
        method: 'PUT',
        path: '/accounts/{id}/password',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                payload: {
                    password: Joi.string().required()
                },
                params: {
                    id: Joi.string().invalid('111111111111111111111111')
                }
            },
            pre: [
                {
                    assign: 'password',
                    method: function (request, reply) {

                        Account.generatePasswordHash(request.payload.password, (err, hash) => {

                            if (err) {
                                return reply(err);
                            }

                            reply(hash);
                        });
                    }
                }
            ]
        },
        handler: function (request, reply) {

            const id = request.params.id;
            const update = {
                $set: {
                    password: request.pre.password.hash
                }
            };

            Account.findByIdAndUpdate(id, update, (err, user) => {

                if (err) {
                    return reply(err);
                }

                reply(user);
            });
        }
    });


    /**
     * A user changes her password
     */
    server.route({
        method: 'PUT',
        path: '/accounts/my/password',
        config: {
            auth: {
                strategy: 'session',
                scope: ['111111111111111111111111', '000000000000000000000000']
            },
            validate: {
                payload: {
                    password: Joi.string().required()
                }
            },
            pre: [
                {
                    assign: 'password',
                    method: function (request, reply) {

                        Account.generatePasswordHash(request.payload.password, (err, hash) => {

                            if (err) {
                                return reply(err);
                            }

                            reply(hash);
                        });
                    }
                }
            ]
        },
        handler: function (request, reply) {

            const id = request.auth.credentials.user._id.toString();
            const update = {
                $set: {
                    password: request.pre.password.hash
                }
            };
            const findOptions = {
                fields: Account.fieldsAdapter('username email')
            };

            Account.findByIdAndUpdate(id, update, findOptions, (err, user) => {

                if (err) {
                    return reply(err);
                }

                reply(user);
            });
        }
    });


    server.route({
        method: 'PUT',
        path: '/accounts/{id}/active',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                payload: {
                    isActive: Joi.boolean().required()
                },
                params: {
                    id: Joi.string().invalid('111111111111111111111111')
                }
            }
        },
        handler: function (request, reply) {

            const id = request.params.id;
            const update = {
                $set: {
                    isActive: request.payload.isActive
                }
            };

            Account.findByIdAndUpdate(id, update, (err, account) => {

                if (err) {
                    return reply(err);
                }
                if (!account) {
                    return reply(Boom.notFound('Document not found.'));
                }

                reply(account);
            });
        }
    });



    server.route({
        method: 'POST',
        path: '/accounts/{id}/notes',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                payload: {
                    data: Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            const id = request.params.id;
            const update = {
                $push: {
                    notes: {
                        data: request.payload.data,
                        timeCreated: new Date(),
                        userCreated: {
                            id: request.auth.credentials.user._id.toString(),
                            name: request.auth.credentials.user.username
                        }
                    }
                }
            };

            Account.findByIdAndUpdate(id, update, (err, account) => {

                if (err) {
                    return reply(err);
                }

                reply(account);
            });
        }
    });



    server.route({
        method: 'DELETE',
        path: '/accounts/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: '111111111111111111111111'
            },
            validate: {
                params: {
                    id: Joi.string().invalid('111111111111111111111111')
                }
            },
            pre: [
                //AuthPlugin.preware.ensureAdminGroup('root')
            ]
        },
        handler: function (request, reply) {

            Account.findByIdAndDelete(request.params.id, (err, account) => {

                if (err) {
                    return reply(err);
                }

                if (!account) {
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
    name: 'account'
};
