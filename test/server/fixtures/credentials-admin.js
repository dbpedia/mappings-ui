'use strict';
const Admin = require('../../../server/models/admin');
const Account = require('../../../server/models/account');


const user = new Account({
    _id: '535HOW35',
    username: 'ren',
    groups: { admin: 'Admin' },
    _groups : {
        admin: {
            _id: 'admin',
            name: 'Admin',
            permissions: {
                SPACE_MADNESS: true,
                UNTAMED_WORLD: false
            }
        }
    }
});



module.exports = {
    user,
    groups: user.groups,
    scope: Object.keys(user.groups)
};
