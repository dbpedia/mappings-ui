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
                lang: mappingObject._id.lang,
                version: mappingObject.version
            },
            templateFullName: mappingObject.templateFullName,
            rml: mappingObject.rml,
            status: mappingObject.status,
            edition: {
                username: mappingObject.edition.username,
                date: mappingObject.edition.date,
                comment: mappingObject.edition.comment
            },
            stats: mappingObject.stats,
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


    /**
     * Restores an archived mapping.
     * If there is an active mapping, then archives that mapping and updates it.
     * Otherwise, creates new mapping, always with appropriate version.
     * A new version is created with the contents of the restored one.
     */
    static restoreFromHistory(username,template,lang,version,callback){

        //1. Get document corresponding to rev
        MappingHistory.findOne({ _id: { template,lang,version } }, (err, archivedMapping) => {

            if (err){
                return callback(err);
            }


            //2. Get document from active mappings
            Mapping.findOne({ _id: { template,lang } }, (err,activeMapping) => {

                if (err){
                    return callback(err);
                }

                if (activeMapping){ //If there is an already active mapping, just update it.

                    activeMapping.archive(false, (err,res) => { //Archive current mapping

                        if (err){
                            return callback(err);
                        }

                        const newComment = archivedMapping.edition.comment + ' (Restored from version ' + archivedMapping._id.version + ').';

                        //Update current mapping
                        activeMapping.update({ rml: archivedMapping.rml, status: archivedMapping.status },username,newComment, (err,updatedRes) => {

                            if (err) {
                                return callback(err);
                            }

                            return callback(null,updatedRes);

                        });

                    });
                }

                else { //No active mapping, so we create new
                    Mapping.createFromHistory(archivedMapping, (err,result) => {

                        if (err) {
                            return callback(err);
                        }

                        return callback(null,result);
                    });
                }


            });

        });

    }

}


MappingHistory.collection  = 'mappingsHistory';

MappingHistory.schema = Joi.object().keys({
    //Compound id, with template name and lang, as both are needed to identify a mapping
    _id: Joi.object().keys({
        template: Joi.string(),
        lang: Joi.string(),
        version: Joi.number()
    }),
    templateFullName: Joi.string().required(),
    rml: Joi.string().required(),
    status: Joi.string(),
    edition: Joi.object().keys({
        username: Joi.string().required(),
        date: Joi.date().required(),
        comment: Joi.string()
    }),
    deleted: Joi.bool().required(),
    stats: Joi.object().keys({
        numOcurrences: Joi.number(),
        numProperties: Joi.number(),
        numMappedProperties: Joi.number(),
        mappedPercentage: Joi.number(),
        numPropertyOcurrences: Joi.number(),
        numMappedPropertyOcurrences: Joi.number(),
        numPropertiesNotFound: Joi.number()
    })
});





MappingHistory.indexes = [
    { key: { _id: 1 } }
];


module.exports = MappingHistory;
