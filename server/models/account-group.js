'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');
const Slug = require('slug');


class AccountGroup extends MongoModels {


    static create(name, callback) {

        const document = {
            _id: Slug(name).toLowerCase(),
            name
        };

        this.insertOne(document, (err, docs) => {

            if (err) {
                return callback(err);
            }

            callback(null, docs[0]);
        });
    }

    hasPermissionTo(permission) {

        if (this.permissions && this.permissions.hasOwnProperty(permission)) {
            return this.permissions[permission];
        }

        return false;
    }
}


AccountGroup.collection = 'accountGroups';


AccountGroup._idClass = String;


AccountGroup.schema = Joi.object().keys({
    _id: Joi.string(),
    name: Joi.string().required(),
    permissions: Joi.object().description('{ permission: boolean, ... }')
});


module.exports = AccountGroup;
