'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');
const CurrentMappingStats = require('./currentMappingStats');
const MappingHistory = require('./mapping-history');
//Represents a Mapping (basic information, without stats)
class Mapping extends MongoModels {



    /**
     * Used to create a new mapping, not to update it.
     */
    static create(template,lang,rml,username,comment,callback){

        Mapping.getLastVersion(template,lang, (err,res) => {

            if (err){
                return callback(err);
            }

            const nextVersion = res + 1;
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
                },
                nextVersion
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

        });

    };

    /**
     * Returns the last version of the document, searching first in active mappings, and then on history.
     * If not found in none of them, returns -1.
     */
    static getLastVersion(template,lang,callback){


        Mapping.findOne({ _id:{ template,lang } }, (err,res) => {

            if (err) {  //Error on query
                return callback(err);
            }

            if (res && res.version){ //Found in active mappings
                return callback(null,res.version);
            }

            if (res && !res.version){ //Something strange happens
                return callback('Error, found document has no version attribute!');
            }



            //Last option is that version is not found on active mappings, so we query the MappingHistory
            MappingHistory.findOne({ _id:{ template,lang } }, (err,res2) => {

                if (err) {  //Error on query
                    return callback(err);
                }

                if (res2 && res2.version){ //Found in archived mappings
                    return callback(null,res2.version);
                }

                if (res2 && !res2.version){ //Something strange happens
                    return callback('Error, found document in history and has no version attribute!');
                }


                //No document found here, so it does not exist... Return -1, so next version will be 0
                callback(null,-1);

            });


        });

    }



    /**
     * Creates a new mapping from a mapping history object.
     * Automatically sets the version.
     */
    static createFromHistory(doc,callback){

        Mapping.getLastVersion(doc._id.template,doc._id.lang, (err,res) => {

            if (err){
                callback(err);
            }

            const newVersion = res + 1; //If -1, then it will be 0

            const oldVersion = doc.version;
            const d = {
                _id: {
                    template: doc._id.template,
                    lang: doc._id.lang
                },
                rml: doc.rml,
                status: doc.status,
                edition: {
                    username: doc.edition.username,
                    date: doc.edition.date,
                    comment: doc.edition.comment + ' (Restored from version ' + oldVersion + ').'
                },
                version: newVersion
            };

            this.insertOne(d, (err, docs) => {

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

        });

    }

    constructor(attrs) {

        super(attrs);

    }

    hydrateStats(callback) {


        if (this.stats) {
            return callback(null, this.stats);
        }


        CurrentMappingStats.findOne({ _id: { template:this._id.template ,lang: this._id.lang } }, (err,results) => {

            if (err) {
                return callback(err);
            }

            this.stats = results;

            callback(null,this.stats);
        });
    }

    /**
     * Updates a mapping, setting the changes in the setChanges,
     * and incrementing the version in 1. Also sets the username and comment.
     */
    update(setChanges,username,comment,callback){



        const updateObject = {
            $set: setChanges
        };

        updateObject.$set.version = this.version + 1;
        updateObject.$set.edition = {
            username,
            comment,
            date: new Date()
        };

        Mapping.findOneAndUpdate({ _id: this._id }, updateObject, callback);


    };
    /**
     * Archives the mapping into the mappingHistory collection. Does not delete document from
     * the original collection
     * In the callback, returns the created history object.
     */
    archive(deleted,callback){

        MappingHistory.create(this,deleted, (err,res) => {

            if (err){
                return callback(err);
            }

            if (!deleted){
                return callback(null,res);
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
