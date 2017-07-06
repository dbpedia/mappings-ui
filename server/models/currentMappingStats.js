'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');

//Represents a Mapping (basic information, without stats)
class CurrentMappingStats extends MongoModels {



    static create(template,lang,
                  numOcurrences,
                  numProperties,numMappedProperties,
                  numPropertyOcurrences,numMappedPropertyOcurrences,
                  numPropertiesNotFound,
                  callback){


        const document = {
            _id: {
                template,
                lang
            },
            numOcurrences,
            numProperties,
            numMappedProperties,
            numPropertyOcurrences,
            numMappedPropertyOcurrences,
            numPropertiesNotFound
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


CurrentMappingStats.collection  = 'currentMappingStats';

CurrentMappingStats.schema = Joi.object().keys({
    //Compound id, with template name and lang, as both are needed to identify a mapping
    _id: Joi.object().keys({
        template: Joi.string(),
        lang: Joi.string()
    }),
    numOcurrences: Joi.number(),
    numProperties: Joi.number(),
    numMappedProperties: Joi.number(),
    numPropertyOcurrences: Joi.number(),
    numMappedPropertyOcurrences: Joi.number(),
    numPropertiesNotFound: Joi.number()
});



CurrentMappingStats.indexes = [
    { key: { _id: 1 } }
];


module.exports = CurrentMappingStats;
