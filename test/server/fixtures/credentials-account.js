'use strict';
const Account = require('../../../server/models/account');




const user = new Account({
    _id: '535HOW35',
    username: 'ren',
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
