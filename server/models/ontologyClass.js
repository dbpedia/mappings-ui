'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');

/**
 * This model is used to keep a local copy of ontology classes, used to search.
 */
class OntologyClass extends MongoModels {
    static create(classObject,callback) { //classObject = {name,uri}


        classObject.length = classObject.name.length;

        this.insertOne(classObject, (err, docs) => {

            if (err) {
                return callback(err);
            }

            callback(null, docs[0]);
        });
    }
}


OntologyClass.collection = 'ontologyClasses';


OntologyClass._idClass = String;


OntologyClass.schema = Joi.object().keys({
    name: Joi.string().required(),
    uri: Joi.string().required(),
    length: Joi.number().required()
});



OntologyClass.indexes = [
    { key: { name: 1 } },
    { key: { uri: 1 } }
];


module.exports = OntologyClass;
