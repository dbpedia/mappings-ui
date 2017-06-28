'use strict';
const AccountPlugin = require('../../../server/api/accounts');
const AuthPlugin = require('../../../server/auth');
const AuthenticatedAccount = require('../fixtures/credentials-account');
const AuthenticatedAdmin = require('../fixtures/credentials-admin');
const Code = require('code');
const Config = require('../../../config');
const Hapi = require('hapi');
const HapiAuth = require('hapi-auth-cookie');
const Lab = require('lab');
const MakeMockModel = require('../fixtures/make-mock-model');
const Manifest = require('../../../manifest');
const Path = require('path');
const Proxyquire = require('proxyquire');
const WebProtege = require('../../../server/webprotege');

const lab = exports.lab = Lab.script();
let request;
let server;
let stub;


lab.before((done) => {

    stub = {
        Account: MakeMockModel(),
        Status: MakeMockModel()
    };

    const proxy = {};
    proxy[Path.join(process.cwd(), './server/models/account')] = stub.Account;
    proxy[Path.join(process.cwd(), './server/models/status')] = stub.Status;

    const ModelsPlugin = {
        register: Proxyquire('hapi-mongo-models', proxy),
        options: Manifest.get('/registrations').filter((reg) => {

            if (reg.plugin &&
                reg.plugin.register &&
                reg.plugin.register === 'hapi-mongo-models') {

                return true;
            }

            return false;
        })[0].plugin.options
    };

    const plugins = [HapiAuth, ModelsPlugin, AuthPlugin, AccountPlugin];
    server = new Hapi.Server();
    server.connection({ port: Config.get('/port/web') });
    server.register(plugins, (err) => {

        if (err) {
            return done(err);
        }

        server.initialize(done);
    });
});


lab.after((done) => {

    server.plugins['hapi-mongo-models'].MongoModels.disconnect();
    done();
});


lab.experiment('Accounts Plugin Result List', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'GET',
            url: '/accounts',
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when paged find fails', (done) => {

        stub.Account.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('paged find failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns an array of documents successfully', (done) => {

        stub.Account.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, { data: [{}, {}, {}] });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.data).to.be.an.array();
            Code.expect(response.result.data[0]).to.be.an.object();

            done();
        });
    });


    lab.test('it returns an array of documents successfully (using filters)', (done) => {

        stub.Account.pagedFind = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, { data: [{}, {}, {}] });
        };

        request.url += '?username=ren&isActive=true&limit=10&page=1&group=admin&name=ismael%20rodriguez';

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.data).to.be.an.array();
            Code.expect(response.result.data[0]).to.be.an.object();

            done();
        });
    });
});


lab.experiment('Accounts Plugin Read', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'GET',
            url: '/accounts/93EP150D35',
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when find by id fails', (done) => {

        stub.Account.findById = function (id,filter, callback) {

            callback(Error('find by id failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a not found when find by id misses', (done) => {

        stub.Account.findById = function (id,filter, callback) {

            callback();
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            Code.expect(response.result.message).to.match(/document not found/i);

            done();
        });
    });


    lab.test('it returns a document successfully', (done) => {

        stub.Account.findById = function (id,filter, callback) {

            callback(null, { _id: '93EP150D35' });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });
});


lab.experiment('Accounts Plugin (My) Read', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'GET',
            url: '/accounts/my',
            credentials: AuthenticatedAccount
        };

        done();
    });


    lab.test('it returns an error when find by id fails', (done) => {

        stub.Account.findById = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('find by id failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a not found when find by id misses', (done) => {

        stub.Account.findById = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback();
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            Code.expect(response.result.message).to.match(/document not found/i);

            done();
        });
    });


    lab.test('it returns a document successfully', (done) => {

        stub.Account.findById = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, { _id: '93EP150D35' });
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });
});


lab.experiment('Accounts Plugin Create', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'POST',
            url: '/accounts',
            payload: {
                name: 'Muddy Mudskipper',
                username: 'muddy',
                email: 'mail@mail.com',
                password: 'pass',
                mappingsLang:'en'
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });

    lab.test('it returns an error when find one fails for username check', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            if (conditions.username) {
                callback(Error('find one failed'));
            }
            else {
                callback();
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a conflict when find one hits for username check', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            if (conditions.username) {
                callback(null, {});
            }
            else {
                callback(Error('find one failed'));
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(409);
            done();
        });
    });


    lab.test('it returns an error when find one fails for email check', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            if (conditions.email) {
                callback(Error('find one failed'));
            }
            else {
                callback();
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a conflict when find one hits for email check', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            if (conditions.email) {
                callback(null, {});
            }
            else {
                callback();
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(409);
            done();
        });
    });

    lab.test('it returns an error when create fails', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            callback();
        };

        stub.Account.create = function (completename,username, password, email, mappingsLang, callback) {


            callback(Error('create failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it creates a document successfully', (done) => {

        const old = WebProtege.addUser;
        WebProtege.addUser = function (username,name,mail,pass){

            WebProtege.addUser = old;
            return Promise.resolve('ok');
        };

        stub.Account.create = function (completename,username, password, email,mappingsLang, callback) {

            callback(null, {});
        };

        stub.Account.findOne = function (conditions, callback) {

            callback();
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });
});



lab.experiment('Accounts Active Update',() => {


    lab.beforeEach((done) => {

        request = {
            method: 'PUT',
            url: '/accounts/592fe4c8ff79c6347b1db038/active',
            payload: {
                isActive:true
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when trying to update root active status', (done) => {

        request = {
            method: 'PUT',
            url: '/accounts/111111111111111111111111/active',
            payload: {
                isActive:false
            },
            credentials: AuthenticatedAdmin
        };


        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(400);
            done();
        });
    });

    lab.test('it returns an error when update active status fails', (done) => {


        stub.Account.findOne = function (conditions, callback) {

            callback();
        };

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(Error('update failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });

    lab.test('it returns not found when find by id misses', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            callback();
        };

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(null, undefined);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            done();
        });
    });


    lab.test('it updates the active status successfully', (done) => {


        const old = WebProtege.setActive;
        WebProtege.setActive = function (username,active){

            WebProtege.setActive = old;
            return Promise.resolve('ok');
        };


        stub.Account.findOne = function (conditions, callback) {

            callback();
        };



        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(null, {});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });


});

lab.experiment('Accounts Plugin Update', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'PUT',
            url: '/accounts/592fe4c8ff79c6347b1db038',
            payload: {
                name: {
                    first: 'Muddy',
                    last: 'Mudskipper'
                },
                email: 'mrmud@mudmail.mud',
                mappingsLang:'en'
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });

    lab.test('it returns an error when trying to update root details from outside', (done) => {

        request = {
            method: 'PUT',
            url: '/accounts/111111111111111111111111',
            payload: {
                name: {
                    first: 'Muddy',
                    last: 'Mudskipper'
                },
                email: 'mrmud@mudmail.mud'
            },
            credentials: AuthenticatedAdmin
        };


        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(400);
            done();
        });
    });

    /*lab.test('it returns an error when find one fails for username check', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            if (conditions.username) {
                callback(Error('find one failed'));
            }
            else {
                callback();
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });
*/

    /*lab.test('it returns a conflict when find one hits for username check', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            if (conditions.username) {
                callback(null, {});
            }
            else {
                callback(Error('find one failed'));
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(409);
            done();
        });
    });*/


    lab.test('it returns an error when find one fails for email check', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            if (conditions.email) {
                callback(Error('find one failed'));
            }
            else {
                callback();
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a conflict when find one hits for email check', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            if (conditions.email) {
                callback(null, {});
            }
            else {
                callback();
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(409);
            done();
        });
    });


    lab.test('it returns an error when update fails', (done) => {


        stub.Account.findOne = function (conditions, callback) {

            callback();
        };

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(Error('update failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns not found when find by id misses', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            callback();
        };

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(null, undefined);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            done();
        });
    });


    lab.test('it updates a document successfully', (done) => {


        const old = WebProtege.updateUserDetails;
        WebProtege.updateUserDetails = function (username,newName,newMail){

            WebProtege.updateUserDetails = old;
            return Promise.resolve('ok');
        };

        stub.Account.findOne = function (conditions, callback) {

            callback();
        };

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(null, {});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });
});


lab.experiment('Accounts Plugin (My) Update', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'PUT',
            url: '/accounts/my',
            payload: {
                name: {
                    first: 'Mud',
                    last: 'Skipper'
                },
                email: 'mrmud@mudmail.mud',
                mappingsLang:'en'
            },
            credentials: AuthenticatedAccount
        };

        done();
    });






    lab.test('it returns an error when find one fails for email check', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            if (conditions.email) {
                callback(Error('find one failed'));
            }
            else {
                callback();
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);

            done();
        });
    });


    lab.test('it returns a conflict when find one hits for email check', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            if (conditions.email) {
                callback(null, {});
            }
            else {
                callback();
            }
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(409);

            done();
        });
    });

    lab.test('it returns an error when update fails', (done) => {

        stub.Account.findOne = function (conditions, callback) {

            callback();
        };


        stub.Account.findByIdAndUpdate = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('update failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it updates a document successfully', (done) => {

        const old = WebProtege.updateUserDetails;
        WebProtege.updateUserDetails = function (username,newName,newMail){

            WebProtege.updateUserDetails = old;
            return Promise.resolve('ok');
        };


        stub.Account.findOne = function (conditions, callback) {

            callback();
        };

        stub.Account.findByIdAndUpdate = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, {});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });
});

lab.experiment('Accounts Plugin Set Password', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'PUT',
            url: '/accounts/420000000000000000000000/password',
            payload: {
                password: 'fromdirt'
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when generate password hash fails', (done) => {

        stub.Account.generatePasswordHash = function (password, callback) {

            callback(Error('generate password hash failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns an error when update fails', (done) => {

        stub.Account.generatePasswordHash = function (password, callback) {

            callback(null, { password: '', hash: '' });
        };

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(Error('update failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns an error when trying to update root password', (done) => {

        request = {
            method: 'PUT',
            url: '/accounts/111111111111111111111111/password',
            payload: {
                password: 'fromdirt'
            },
            credentials: AuthenticatedAdmin
        };


        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(400);
            done();
        });
    });


    lab.test('it sets the password successfully', (done) => {

        const old = WebProtege.updateUserPassword;
        WebProtege.updateUserPassword = function (username,pass){

            WebProtege.updateUserPassword = old;
            return Promise.resolve('ok');
        };

        stub.Account.generatePasswordHash = function (password, callback) {

            callback(null, { password: '', hash: '' });
        };

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(null, {});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            done();
        });
    });
});


//Tests add/remove permissions
lab.experiment('Accounts Plugin Update Permissions', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'PUT',
            url: '/accounts/93EP150D35/permissions',
            payload: {
                permissions: { SPACE_RACE: true }
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when update fails', (done) => {

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(Error('update failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it updates a document successfully', (done) => {

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(null, {});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });


    lab.test('it returns an error when trying to update root permissions', (done) => {

        request = {
            method: 'PUT',
            url: '/accounts/111111111111111111111111/permissions',
            payload: {
                permissions: { SPACE_RACE: true }
            },
            credentials: AuthenticatedAdmin
        };


        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(400);
            done();
        });
    });
});
lab.experiment('Accounts Plugin (My) Set Password', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'PUT',
            url: '/accounts/my/password',
            payload: {
                password: 'fromdirt'
            },
            credentials: AuthenticatedAccount
        };

        done();
    });


    lab.test('it returns an error when generate password hash fails', (done) => {

        stub.Account.generatePasswordHash = function (password, callback) {

            callback(Error('generate password hash failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns an error when update fails', (done) => {

        stub.Account.generatePasswordHash = function (password, callback) {

            callback(null, { password: '', hash: '' });
        };

        stub.Account.findByIdAndUpdate = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(Error('update failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it sets the password successfully', (done) => {

        const old = WebProtege.updateUserPassword;
        WebProtege.updateUserPassword = function (username,pass){

            WebProtege.updateUserPassword = old;
            return Promise.resolve('ok');
        };

        stub.Account.generatePasswordHash = function (password, callback) {

            callback(null, { password: '', hash: '' });
        };

        stub.Account.findByIdAndUpdate = function () {

            const args = Array.prototype.slice.call(arguments);
            const callback = args.pop();

            callback(null, {});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            done();
        });
    });
});

lab.experiment('Account Plugin Update Groups', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'PUT',
            url: '/accounts/93EP150D35/groups',
            payload: {
                groups: { sales: 'Sales' }
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when update fails', (done) => {

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(Error('update failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it updates a document successfully', (done) => {


        const old = WebProtege.setAdmin;
        WebProtege.setAdmin = function (username,isAdmin){

            WebProtege.setAdmin = old;
            return Promise.resolve('ok');
        };

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(null, {});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();

            done();
        });
    });


    lab.test('when removing all groups, the account group is set', (done) => {


        const request2 = {
            method: 'PUT',
            url: '/accounts/93EP150D35/groups',
            payload: {
                groups: { }
            },
            credentials: AuthenticatedAdmin
        };


        const old = WebProtege.setAdmin;
        WebProtege.setAdmin = function (username,isAdmin){

            WebProtege.setAdmin = old;
            return Promise.resolve('ok');
        };


        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(null,  update  );
        };

        server.inject(request2, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result).to.be.an.object();
            Code.expect(response.result.$set.groups).to.equal( { '000000000000000000000000': 'Account' } );

            done();
        });
    });

    lab.test('it returns an error when trying to update root groups', (done) => {

        request = {
            method: 'PUT',
            url: '/accounts/111111111111111111111111/groups',
            payload: {
                groups: { sales: 'Sales' }
            },
            credentials: AuthenticatedAdmin
        };


        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(400);
            done();
        });
    });
});





lab.experiment('Accounts Plugin Add Note', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'POST',
            url: '/accounts/93EP150D35/notes',
            payload: {
                data: 'This is a wonderful note.'
            },
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when find by id and update fails', (done) => {

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(Error('find by id and update failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it successfully adds a note', (done) => {

        stub.Account.findByIdAndUpdate = function (id, update, callback) {

            callback(null, {});
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            done();
        });
    });
});






lab.experiment('Accounts Plugin Delete', () => {

    lab.beforeEach((done) => {

        request = {
            method: 'DELETE',
            url: '/accounts/93EP150D35',
            credentials: AuthenticatedAdmin
        };

        done();
    });


    lab.test('it returns an error when delete by id fails', (done) => {

        stub.Account.findByIdAndDelete = function (id, callback) {

            callback(Error('delete by id failed'));
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(500);
            done();
        });
    });


    lab.test('it returns a not found when delete by id misses', (done) => {

        stub.Account.findByIdAndDelete = function (id, callback) {

            callback(null, undefined);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(404);
            Code.expect(response.result.message).to.match(/document not found/i);

            done();
        });
    });


    lab.test('it deletes a document successfully', (done) => {

        const old = WebProtege.removeUser;
        WebProtege.removeUser = function (username){

            WebProtege.removeUser = old;
            return Promise.resolve('ok');
        };

        stub.Account.findByIdAndDelete = function (id, callback) {

            callback(null, 1);
        };

        server.inject(request, (response) => {

            Code.expect(response.statusCode).to.equal(200);
            Code.expect(response.result.success).to.be.true();

            done();
        });
    });
});
