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
