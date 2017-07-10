'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');
const Slug = require('slug');

//Represents a Text Post written in markdown
class Post extends MongoModels {




    //Receives the title, markdown, username, visible.
    static create(title,markdown, username, visible, callback) {


        const creationDate = new Date();
        if (!markdown){
            markdown = '';
        }

        //_id is automatically generated
        const document = {
            postId: this.idFromTitle(title),
            title,
            lastEdition: {
                username,
                time: creationDate
            },
            creation: {
                username,
                time: creationDate
            },
            markdown,
            visible
        };

        this.insertOne(document, (err, docs) => {

            if (err) {
                return callback(err);
            }

            callback(null, docs[0]);
        });


    }



    //Find by title. For that, uses the id and first slugs it.
    static findByTitle(title, callback) {


        const id = Slug(title).toLowerCase();
        const query = { 'postId': id };

        this.findOne(query, callback);
    }

    static idFromTitle(title){

        return Slug(title).toLowerCase();

    }
    constructor(attrs) {

        super(attrs);
    }


}


Post.collection = 'posts';


Post.schema = Joi.object().keys({
    _id: Joi.object(),
    postId: Joi.string(),
    title: Joi.string(),
    lastEdition: Joi.object().keys({
        username: Joi.string().required(),
        time: Joi.date()
    }),
    creation: Joi.object().keys({
        username: Joi.string().required(),
        time: Joi.date()
    }),
    markdown: Joi.string(),
    visible: Joi.boolean()
});


Post.indexes = [
    { key: { _id: 1 } },
    { key: { postId: 1, unique: 1 } },
    { key: { title: 1, unique:1 } }
];


module.exports = Post;
