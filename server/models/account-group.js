'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');


class AccountGroup extends MongoModels {



    static create(name, callback) {

        const document = {
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




AccountGroup.schema = Joi.object().keys({
    _id: Joi.object(),
    name: Joi.string().required(),
    permissions: Joi.object().description('{ permission: boolean, ... }')
});


AccountGroup.indexes = [
    { key: { _id: 1 } },
    { key: { name: 1, unique:1 } }
];


module.exports = AccountGroup;
