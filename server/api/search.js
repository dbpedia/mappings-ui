'use strict';
const Joi = require('joi');
const Boom = require('boom');
const Config = require('../../config');
const EFInteraction = require('../efInteraction/calls.js');

const internals = {};


let ontologyUpdateTime;
let updatingOntology = false;

internals.applyRoutes = function (server, next) {


    const OntologyProperty = server.plugins['hapi-mongo-models'].OntologyProperty;
    const OntologyClass = server.plugins['hapi-mongo-models'].OntologyClass;
    const OntologyDatatype = server.plugins['hapi-mongo-models'].OntologyDatatype;

    const UPDATE_TIME = Config.get('/github/updateFrequencyMinutes') * 1.25; //Margin time

    const pages = [
        {
            title: 'David_Beckham',
            url: 'http://wikipedia.org/wiki/David_Beckham'
        },
        {
            title: 'Abcd_efgh_ijklm_nopqrs_uvwxyz',
            url: 'http://wikipedia.org/wiki/David_Beckham'
        }
    ];


    server.route({
        method: 'GET',
        path: '/search/wiki',
        config: {
            auth: {
                mode:'try',
                strategy: 'session'
            },
            plugins: { 'hapi-auth-cookie': { redirectTo: false } },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    title: Joi.string().allow('').default('')
                }
            }
        },
        handler: function (request, reply) {


            const input = request.query.title;

            const results =  input.length === 0 ? [] : pages.filter((page) =>

                page.title.toLowerCase().indexOf(input.toLowerCase()) > -1
            );

            reply(results);
        }
    });

    server.route({
        method: 'GET',
        path: '/search/datatypes',
        config: {
            auth: {
                strategy: 'session',
                scope: ['111111111111111111111111', '000000000000000000000000']
            },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    name: Joi.string().allow('').default('')
                }
            },
            pre: [{
                assign: 'updateCache',
                method: function (request, reply) {

                    if (updatingOntology) {
                        //Go to response directly, only one updating at same time
                        return reply(true);
                    }


                    //Not time defined or update time has passed, we have to update cache
                    if (!ontologyUpdateTime || (new Date() - ontologyUpdateTime > UPDATE_TIME * 60 * 1000)) {
                        updatingOntology = true;


                        //First, delete all previous search results
                        OntologyDatatype.deleteMany({}, (err,res) => {


                            if (err) {
                                return reply(Boom.internal(err));
                            }

                            EFInteraction.getDatatypes()
                                .then((datatypes) => {
                                    //Now,we insert into DB
                                    const promises = [];
                                    datatypes.forEach((dt) => {

                                        promises.push(
                                            new Promise((resolve, reject) => {

                                                OntologyDatatype.create(dt,(err2,res3) => {

                                                    if (err2) {
                                                        return reject(err2);
                                                    }
                                                    resolve();
                                                });

                                            })
                                        );
                                    });
                                    return Promise.all(promises);
                                })
                                .then(() => {

                                    ontologyUpdateTime = new Date();
                                    updatingOntology = false;
                                    return reply(true);
                                })
                                .catch((err) => {

                                    return reply(Boom.badRequest(err));
                                });
                        });
                    }

                    else {
                        return reply(true); //Do not have to update
                    }
                }
            }]
        },
        handler: function (request, reply) {

            const input = request.query.name.trim();


            if (input.length === 0) {   //Do not search if empty
                reply([]);
            }

            const regex = '.*' + input + '.*';
            const filter = {
                name: { '$regex': new RegExp(regex,'i') }
            };
            const sort = { length: 1 };

            const fields = OntologyDatatype.fieldsAdapter('name uri');
            const limit = 5;

            OntologyDatatype.pagedFind(filter,fields,sort,limit,1,(err,res) => {

                if (err) {
                    return reply(Boom.internal(err));
                }

                reply(null,res.data);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/search/classes',
        config: {
            auth: {
                strategy: 'session',
                scope: ['111111111111111111111111', '000000000000000000000000']
            },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    name: Joi.string().allow('').default('')
                }
            },
            pre: [{
                assign: 'updateCache',
                method: function (request, reply) {

                    if (updatingOntology) {
                        //Go to response directly, only one updating at same time
                        reply(true);
                    }


                    //Not time defined or update time has passed, we have to update cache
                    if (!ontologyUpdateTime || (new Date() - ontologyUpdateTime > UPDATE_TIME * 60 * 1000)) {
                        updatingOntology = true;


                        //First, delete all previous search results
                        OntologyClass.deleteMany({}, (err,res) => {


                            if (err) {
                                return reply(Boom.internal(err));
                            }

                            EFInteraction.getClasses()
                                .then((classes) => {
                                    //Now,we insert into DB
                                    const promises = [];
                                    classes.forEach((dt) => {

                                        promises.push(
                                            new Promise((resolve, reject) => {

                                                OntologyClass.create(dt,(err2,res3) => {

                                                    if (err2) {
                                                        return reject(err2);
                                                    }
                                                    resolve();
                                                });

                                            })
                                        );
                                    });
                                    return Promise.all(promises);
                                })
                                .then(() => {

                                    ontologyUpdateTime = new Date();
                                    updatingOntology = false;
                                    return reply(true);
                                })
                                .catch((err) => {

                                    return reply(Boom.badRequest(err));
                                });
                        });
                    }

                    else {
                        reply(true); //Do not have to update
                    }
                }
            }]
        },
        handler: function (request, reply) {

            const input = request.query.name.trim();


            if (input.length === 0) {   //Do not search if empty
                reply([]);
            }

            const regex = '.*' + input + '.*';
            const filter = {
                name: { '$regex': new RegExp(regex,'i') }
            };
            const sort = { length: 1 };

            const fields = OntologyClass.fieldsAdapter('name uri');
            const limit = 5;

            OntologyClass.pagedFind(filter,fields,sort,limit,1,(err,res) => {

                if (err) {
                    return reply(Boom.internal(err));
                }

                reply(null,res.data);
            });

        }
    });


    server.route({
        method: 'GET',
        path: '/search/properties',
        config: {
            auth: {
                strategy: 'session',
                scope: ['111111111111111111111111', '000000000000000000000000']
            },
            validate: {
                query: {
                    //Can search by title, lastEditor username, and visible status
                    name: Joi.string().allow('').default('')
                }
            },
            pre: [{
                assign: 'updateCache',
                method: function (request, reply) {

                    if (updatingOntology) {
                        //Go to response directly, only one updating at same time
                        reply(true);
                    }
                    //Not time defined or update time has passed, we have to update cache
                    if (!ontologyUpdateTime || (new Date() - ontologyUpdateTime > UPDATE_TIME * 60 * 1000)) {
                        updatingOntology = true;


                        //First, delete all previous search results
                        OntologyProperty.deleteMany({}, (err,res) => {


                            if (err) {
                                return reply(Boom.internal(err));
                            }

                            EFInteraction.getProperties()
                                .then((properties) => {
                                    //Now,we insert into DB
                                    const promises = [];
                                    properties.forEach((dt) => {

                                        promises.push(
                                            new Promise((resolve, reject) => {

                                                OntologyProperty.create(dt,(err2,res3) => {

                                                    if (err2) {
                                                        return reject(err2);
                                                    }
                                                    resolve();
                                                });

                                            })
                                        );
                                    });
                                    return Promise.all(promises);
                                })
                                .then(() => {

                                    ontologyUpdateTime = new Date();
                                    updatingOntology = false;
                                    return reply(true);
                                })
                                .catch((err) => {

                                    return reply(Boom.badRequest(err));
                                });
                        });
                    }

                    else {
                        reply(true); //Do not have to update
                    }
                }
            }]
        },
        handler: function (request, reply) {

            const input = request.query.name.trim();


            if (input.length === 0) {   //Do not search if empty
                reply([]);
            }

            const regex = '.*' + input + '.*';
            const filter = {
                name: { '$regex': new RegExp(regex,'i') }
            };
            const sort = { length: 1 };

            const fields = OntologyProperty.fieldsAdapter('name uri range domain');
            const limit = 5;

            OntologyProperty.pagedFind(filter,fields,sort,limit,1,(err,res) => {

                if (err) {
                    return reply(Boom.internal(err));
                }

                reply(null,res.data);
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
    name: 'search'
};
