'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');
const CurrentMappingStats = require('./currentMappingStats');
const MappingHistory = require('./mapping-history');
//Represents a Mapping (basic information, without stats)
class Mapping extends MongoModels {


    //Receive the template name, language, rml and username
    static create(template,lang,rml,username,comment,version,callback){

        const modificationName = new Date();
        if (!rml){
            rml = '';
        }

        if (!comment){
            comment = '';
        }

        const document = {
            _id: {
                template,
                lang
            },
            rml,
            status: 'PENDING',
            edition: {
                username,
                date: modificationName,
                comment
            }
        };

        this.insertOne(document, (err, docs) => {

            if (err) {
                return callback(err);
            }

            docs[0].hydrateStats( (err,stats) => {

                if (err){
                    return callback(err);
                }

                callback(null,docs[0]);
            });
        });
    }


    constructor(attrs) {

        super(attrs);
        Object.defineProperty(this, 'stats', {
            writable: true,
            enumerable: false
        });
    }

    hydrateStats(callback) {


        if (this.stats) {
            return callback(null, this.stats);
        }


        CurrentMappingStats.findOne({ _id: { template:this.template ,lang: this.lang } }, (err,results) => {

            if (err) {
                return callback(err);
            }
            this.stats = results;

            callback(null,this.stats);
        });
    }

    /**
     * Archives the mapping into the mappingHistory collection and deletes the document
     * from the real collection.
     * In the callback, returns the created history object.
     */
    archive(deleted,callback){

        MappingHistory.create(this,deleted, (err,res) => {

            if (err){
                return callback(err);
            }

            Mapping.findOneAndDelete({ _id:{ template:this.template,lang:this.lang } }, (err,res2) => {

                if (err){
                    return callback(err);
                }

                callback(null,res);
            });


        });
    }

}


Mapping.collection  = 'mappings';

Mapping.schema = Joi.object().keys({
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
    })
});





Mapping.indexes = [
    { key: { _id: 1 } }
];


module.exports = Mapping;
