'use strict';
const Account = require('../../../server/models/account');


const user = new Account({
    _id: '592fe4c8ff79c6347b1db038',
    username: 'admin',
    groups: { '111111111111111111111111': 'Admin' },
    _groups : {
        '111111111111111111111111': {
            _id: '111111111111111111111111',
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
