'use strict';
const Account = require('../../../server/models/account');




const user = new Account({
    _id: '592fe4c8ff79c6347b1db038',
    username: 'ren',
    email: 'mail@mail.com',
    groups: { account: 'Account' },
    _groups : {
        account: {
            _id: 'account',
            name: 'Account',
            permissions: {
                SPACE_MADNESS: true,
                UNTAMED_WORLD: false
            }
        }
    }
});


module.exports = {
    user,
    groups: user._groups,
    scope: Object.keys(user.groups)
};
