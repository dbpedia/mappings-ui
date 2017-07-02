/**
 * Created by ismaro3 on 2/07/17.
 */
'use strict';

const Netrc = require('netrc');



const putLoginIntoNetrc = function (){

    const myNetrc = Netrc();
    const github = myNetrc['github.com'];
    const username = process.env.GITHUB_USERNAME;
    const password = process.env.GITHUB_PASSWORD;

    if (github){
        console.log('Data already on .netrc file, skipping...');
        return true;
    }

    myNetrc['github.com'] = {};
    if (username && password){
        myNetrc['github.com'].login = username;
        myNetrc['github.com'].password = password;
        Netrc.save(myNetrc);
        console.log('Login data saved in .netrc file');
        return true;


    }

    console.log('Please, make sure GITHUB_USERNAME and GITHUB_PASSWORD env vars are set');
    return false;
};



module.exports = {
    putLoginIntoNetrc
};

