'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');
const Mapping = require('./mapping');

//Represents a Mapping Archived Version (basic information, without stats)
class MappingHistory extends MongoModels {


    //Receives a mappingObject and a 'deleted' status
    static create(mappingObject,deleted,callback){

        const document = {
            _id: {
                template: mappingObject._id.template,
                lang: mappingObject._id.lang
            },
            rml: mappingObject.rml,
            status: mappingObject.status,
            edition: {
                username: mappingObject.edition.username,
                date: mappingObject.edition.date,
                comment: mappingObject.edition.comment
            },
            deleted
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

    //Warning: call archive in the current mapping in the mappings collection before restoring from history
    //Todo: test. maybe we can skip it and call Mapping.crateFromHistory directly
    restore(callback){

        Mapping.createFromHistory(this,callback);

    }


    //Todo: restoreFromHistory(template,lang,rev) that checks flow, etc.

}


MappingHistory.collection  = 'mappingsHistory';

MappingHistory.schema = Joi.object().keys({
    //Compound id, with template name and lang, as both are needed to identify a mapping
    _id: Joi.object().keys({
        template: Joi.string(),
        lang: Joi.string()
    }),
    version: Joi.number().required(),
    rml: Joi.string().required(),
    status: Joi.string(),
    edition: Joi.object().keys({
        username: Joi.string().required(),
        date: Joi.date().required(),
        comment: Joi.string()
    }),
    deleted: Joi.bool().required()
});





MappingHistory.indexes = [
    { key: { _id: 1 } }
];


module.exports = MappingHistory;
