'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');

class OntologyUpdateStatus extends MongoModels {
    static create(callback){
        const document =
            {
                startDate: new Date(),
                status: {
                    error: false,
                    message: 'RUNNING',
                    long_message: ''
                }
            };
        this.insertOne(document, (err, docs) => {

            if (err) {
                return callback(err);
            }

            callback(null, docs[0]);
        });
    }

    constructor(attrs) {
        super(attrs);
    }
}

OntologyUpdateStatus.collection  = 'ontologyUpdateStatus';

OntologyUpdateStatus.schema = Joi.object().keys({
    //Compound id, with template name and lang, as both are needed to identify a mapping
    _id: Joi.object(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    status: Joi.object().keys({
        error: Joi.bool(),
        message: Joi.string(),
        long_message: Joi.string()
    })
});

OntologyUpdateStatus.indexes = [
    { key: { _id: 1 } }
];

module.exports = OntologyUpdateStatus;
