'use strict';
const Account = require('../../../server/models/account');






//Returns an account with the desired permissions, and account group
const generateAccount = function (permissions){

    const user = new Account({
        _id: '592fe4c8ff79c6347b1db038',
        username: 'account',
        email: 'mail@mail.com',
        groups: { '000000000000000000000000': 'Account' },
        _groups : {
            '000000000000000000000000': {
                _id: '000000000000000000000000',
                name: 'Account',
                permissions: {
                    SPACE_MADNESS: true,
                    UNTAMED_WORLD: false
                }
            }
        },
        permissions: {}
    });

    permissions.forEach((p) => {

        user.permissions[p] = true;
    });

    return { user,groups:user._groups,scope: Object.keys(user.groups) };



};
module.exports =  generateAccount;
