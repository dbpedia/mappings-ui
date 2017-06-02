'use strict';
const Account = require('../../../server/models/account');


const user = new Account({
    _id: '592fe4c8ff79c6347b1db038',
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