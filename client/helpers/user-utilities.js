'use strict';
/*
    Utilities to handle the user object.
 */

const hasPermission = function (user,permission) {
    if (!user){
        return false;
    }

    if (user.groups && user.groups['111111111111111111111111']){
        return true;
    }

    if (user.permissions && user.permissions[permission]){
        return true;
    }

    return false;
};

const parseUserFromHTML = function (){
    let credentials;

    //Recover credentials from html
    let html = document.getElementById('userInformation');
    if (!html){
        credentials = undefined;
    }
    else {
        html = html.innerHTML;

        if (!html || html.length === 0 || html === null){
            credentials = undefined;
        }
        else {
            credentials = JSON.parse(html);
        }

    }
    return credentials;
};

module.exports = {
    hasPermission,
    parseUserFromHTML
};
