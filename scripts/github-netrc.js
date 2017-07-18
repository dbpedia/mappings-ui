/**
 * Created by ismaro3 on 2/07/17.
 */
'use strict';

const Netrc = require('netrc');
const Config = require('../config');
const Exec = require('child_process').exec;
const GITHUB_USERNAME = Config.get('/github/username');
const GITHUB_PASSWORD = Config.get('/github/password');
const GITHUB_NAME = Config.get('/github/name');
const GITHUB_EMAIL = Config.get('/github/email');


const putLoginIntoNetrc = function (){

    const myNetrc = Netrc();
    const github = myNetrc['github.com'];
    const username = GITHUB_USERNAME;
    const password = GITHUB_PASSWORD;

    if (GITHUB_NAME && GITHUB_EMAIL){
        Exec('git config --global user.email ' + GITHUB_EMAIL);
        Exec('git config --global user.name ' + GITHUB_NAME);
    }
    else {
        console.log('Please, make sure you set your github email and name in config file');
    }

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

