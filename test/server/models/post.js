'use strict';
const Post = require('../../../server/models/post');
const Code = require('code');
const Config = require('../../../config');
const Lab = require('lab');


const lab = exports.lab = Lab.script();
const mongoUri = Config.get('/hapiMongoModels/mongodb/uri');
const mongoOptions = Config.get('/hapiMongoModels/mongodb/options');


lab.experiment('Post Class Methods', () => {

    lab.before((done) => {

        Post.connect(mongoUri, mongoOptions, (err, db) => {

            done(err);
        });
    });


    lab.after((done) => {

        Post.deleteMany({}, (err, count) => {

            Post.disconnect();

            done(err);
        });
    });


    lab.test('it returns a new instance when create succeeds', (done) => {

        Post.create('Test Page 1','**text**','sampleaccount',true, (err, result) => {

            Code.expect(err).to.not.exist();
            Code.expect(result).to.be.an.instanceOf(Post);

            done();
        });
    });

    lab.test('it returns **This page is empty** when markdown is empty', (done) => {

        Post.create('Test Page 2','','sampleaccount',true, (err, post) => {

            Code.expect(err).to.not.exist();
            Code.expect(post).to.be.an.instanceOf(Post);
            Code.expect(post.markdown).to.equal('**This page is empty**');
            //Code.expect(accountGroup.hasPermissionTo('SPACE_MADNESS')).to.equal(false);
            done();
        });
    });


    lab.test('it returns a correct id derived from title', (done) => {

        Post.create('España is Spain in Spanish','text','sampleaccount',true, (err, post) => {

            Code.expect(err).to.not.exist();
            Code.expect(post).to.be.an.instanceOf(Post);
            Code.expect(post._id).to.equal('espana-is-spain-in-spanish');
            //Code.expect(accountGroup.hasPermissionTo('SPACE_MADNESS')).to.equal(false);
            done();
        });
    });


    lab.test('it returns a correct post when searching by title', (done) => {

        Post.findByTitle('España is Spain in Spanish', (err,post) => {

            Code.expect(err).to.not.exist();
            Code.expect(post).to.be.an.instanceOf(Post);
            Code.expect(post.title).to.equal('España is Spain in Spanish');

            done();

        });


    });





    lab.test('it returns an error when create fails', (done) => {

        const realInsertOne = Post.insertOne;
        Post.insertOne = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('insert failed'));
        };

        Post.create('Test Page 3','**text**','sampleaccount',true, (err, result) => {

            Code.expect(err).to.be.an.object();
            Code.expect(result).to.not.exist();

            Post.insertOne = realInsertOne;

            done();
        });
    });
});


lab.experiment('Post Instance Methods', () => {

    lab.before((done) => {

        Post.connect(mongoUri, mongoOptions, (err, db) => {

            done(err);
        });
    });


    lab.after((done) => {

        Post.deleteMany({}, (err, result) => {

            Post.disconnect();

            done(err);
        });
    });





});
