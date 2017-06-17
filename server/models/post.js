'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');
const Slug = require('slug');

//Represents a Text Post written in markdown
class Post extends MongoModels {




    //Receives the title, markdown, username, visible.
    static create(title,markdown, username, visible, callback) {


        if (!markdown || markdown.length === 0){
            markdown = '**This page is empty**';
        }

        const document = {
            _id: this.idFromTitle(title),
            title,
            lastEdition: {
                username,
                time: new Date()
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
        const query = { '_id': id };

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
    _id: Joi.string(),
    title: Joi.string(),
    lastEdition: Joi.object().keys({
        username: Joi.string().required(),
        time: Joi.date()
    }),
    markdown: Joi.string(),
    visible: Joi.boolean()
});


Post.indexes = [
    { key: { _id: 1 } },
    { key: { title: 1, unique:1 } }
];


module.exports = Post;
