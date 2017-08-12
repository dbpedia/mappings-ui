'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');

/**
 * This model is used to keep a local copy of ontology properties, used to search.
 */
class OntologyProperty extends MongoModels {
    static create(propertyObject,callback) { //propertyObject = {name,uri,range,domain}


        propertyObject.length = propertyObject.name.length;

        this.insertOne(propertyObject, (err, docs) => {

            if (err) {
                return callback(err);
            }

            callback(null, docs[0]);
        });
    }
}


OntologyProperty.collection = 'ontologyProperties';


OntologyProperty._idClass = String;


OntologyProperty.schema = Joi.object().keys({
    name: Joi.string().required(),
    length: Joi.number().required(),
    uri: Joi.string().required(),
    range: Joi.object().keys({
        name: Joi.string(),
        uri: Joi.string()
    }),
    domain: Joi.object().keys({
        name: Joi.string(),
        uri: Joi.string()
    })

});



OntologyProperty.indexes = [
    { key: { name: 1 } },
    { key: { uri: 1 } }
];


module.exports = OntologyProperty;
