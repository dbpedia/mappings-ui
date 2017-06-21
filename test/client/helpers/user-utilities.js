'use strict';
const Code = require('code');
const Lab = require('lab');
const UserUtilities = require('../../../client/helpers/user-utilities');


const lab = exports.lab = Lab.script();


lab.experiment('User Utilities Helper hasPermission', () => {


    lab.test('returns true when user has the permission', (done) =>  {

        const user = {
            permissions: { 'test-permission':true }
        };

        const result = UserUtilities.hasPermission(user,'test-permission');

        Code.expect(result).to.be.true();
        done();

    });


    lab.test('returns false when user does not have the permission', (done) =>  {

        const user = {
            permissions: { 'test-permission':false }
        };

        const result = UserUtilities.hasPermission(user,'test-permission');

        Code.expect(result).to.be.false();
        done();

    });

    lab.test('returns true when user is in admin group', (done) =>  {

        const user = {
            groups: { '111111111111111111111111': 'Admin' }
        };

        const result = UserUtilities.hasPermission(user,'test-permission');

        Code.expect(result).to.be.true();
        done();

    });



});

lab.experiment('User Utilities Helper parseUserFromHTML', () => {


    lab.test('it returns user when correctly parsed', (done) => {

        const user = { username:'Test', groups: { one: ' One', two: 'Two' } , permissions: { first: true, second:false } };

        const span = document.createElement('span');
        span.setAttribute('id','userInformation');
        const text = document.createTextNode(JSON.stringify(user));
        span.appendChild(text);
        global.document.body.appendChild(span);


        const credentials = UserUtilities.parseUserFromHTML();
        global.document.body.removeChild(span);
        Code.expect(credentials).to.be.an.object();
        Code.expect(credentials).to.include(user);
        done();

    });

    lab.test('it returns undefined when userInformation span is empty', (done) => {


        const span = document.createElement('span');
        span.setAttribute('id','userInformation');
        const text = document.createTextNode('');
        span.appendChild(text);
        global.document.body.appendChild(span);


        const credentials = UserUtilities.parseUserFromHTML();
        global.document.body.removeChild(span);

        Code.expect(credentials).to.be.equal(undefined);
        done();

    });

    lab.test('it returns undefined when userInformation element does not exist', (done) => {


        const div = document.createElement('div');
        global.document.body.appendChild(div);


        const credentials = UserUtilities.parseUserFromHTML();
        Code.expect(credentials).to.be.equal(undefined);
        done();

    });
});
