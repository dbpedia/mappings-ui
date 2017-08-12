'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');

/**
 * This model is used to keep a local copy of ontology datatypes, used to search.
 */
class OntologyDatatype extends MongoModels {
    static create(datatypeObject,callback) { //datatypeObject = {name,uri}


        datatypeObject.length = datatypeObject.name.length;

        this.insertOne(datatypeObject, (err, docs) => {

            if (err) {
                return callback(err);
            }

            callback(null, docs[0]);
        });
    }
}


OntologyDatatype.collection = 'ontologyDatatypes';


OntologyDatatype._idClass = String;


OntologyDatatype.schema = Joi.object().keys({
    name: Joi.string().required(),
    uri: Joi.string().required(),
    length: Joi.number().required()
});



OntologyDatatype.indexes = [
    { key: { name: 1 } },
    { key: { uri: 1 } }
];


module.exports = OntologyDatatype;
