/**
 * Created by ismaro3 on 28/06/17.
 * Class to interact with WebProtege database.
 * Could be modified to interact with an API if provided, keeping the same interface.
 */
'use strict';
const MongoClient = require('mongodb').MongoClient;
const Crypto = require('crypto');
const Config = require('../../config');


//TODO: Make tests of this file, once it is verified that we will use WebProtege

let database;
let projectID;
const URI = Config.get('/webProtegeIntegration/mongodb/uri');
const PROJECT_NAME = Config.get('/webProtegeIntegration/projectName');

/**
 * Returns a database db object and the webprotege dbpedia project _id.
 */
const connectToWebprotege = function (){

    if (database && projectID){
        return Promise.resolve({ db: database, _id:projectID });
    }

    //Returns a promise when everything is finished
    return MongoClient.connect(URI)
        .then((db) => {

            database = db; //Store database object

            //Get project ID
            const projectDetails = db.collection('ProjectDetails');
            return projectDetails.findOne({ displayName: PROJECT_NAME });


        })
        .then((result) => {


            if (!result){
                console.log('[ERROR] Please, create a project in webprotege instance called ' + PROJECT_NAME + '. Then, restart the server.');
                return { };
            }

            //Store project id
            projectID = result._id;
            console.log('Connected to WebProtege database, ' + PROJECT_NAME + ' project.');

            return {
                db: database,
                _id: projectID
            };
        })

        .catch( (err) =>  {

            console.log(err);
        });

};


/**
 * Returns a promise with the ID of the project identified with PROJECT_NAME.
 */
const getProjectId = function (){

    return connectToWebprotege()
        .then((res) => {

            return res._id;
        })
        .catch((err) => {

            console.log(err);
            return undefined;
        });
};




/**
 * Adds user to webprotege database, also replaces if already existing with that username.
 * In addition, sets permissions to regular ones.
 */
const addUser = function (username,name,email,password){

    return connectToWebprotege()
        .then((res) => {


            //Generate salt and Hash
            const saltHash = calculateSaltAndHash(password,16);
            password = undefined; //Clear password from memory

            //Insert into Users collection
            const users = res.db.collection('Users');

            return users.replaceOne(
                { _id: username },
                {
                    _id: username,
                    realName: name,
                    emailAddress: email,
                    salt: saltHash.salt,
                    saltedPasswordDigest: saltHash.hash
                },
                { upsert:true }
            );


        })
        //Now, set as regular account
        .then( (res) => {

            return setAdmin(username,false);
        })
        .catch( (err) =>  {

            return Promise.reject(err);

        });

};


/**
 *  Updates the password of an already existing user
 */
const updateUserPassword = function (username,newPassword){

    return connectToWebprotege()
        .then((res) => {


            //Generate salt and Hash
            const saltHash = calculateSaltAndHash(newPassword,16);
            newPassword = undefined; //Clear password from memory

            //Insert into Users collection
            const users = res.db.collection('Users');

            return users.updateOne(
                { _id: username },
                { $set: {
                    salt: saltHash.salt,
                    saltedPasswordDigest: saltHash.hash
                }
                },
                { upsert:false }
            );


        })
        .catch( (err) =>  {

            return Promise.reject(err);
        });
};

/**
 * Updates username, name and mail, but not password
 */
const updateUserDetails = function (username,newName,newMail){

    return connectToWebprotege()
        .then((res) => {


            //Insert into Users collection
            const users = res.db.collection('Users');

            return users.updateOne(
                { _id: username },
                { $set: {
                    realName: newName,
                    emailAddress: newMail
                }
                },
                { upsert:false }
            );


        })
        .catch( (err) =>  {

            return Promise.reject(err);
        });
};


/**
 * Deactivates a user, just putting a deactivated hash
 */

const removeUser = function (username){

    return connectToWebprotege()
        .then((res) => {

            const users = res.db.collection('Users');


            return users.updateOne(
                { _id: username },
                {
                    $set: {
                        saltedPasswordDigest: 'AABBCCDDEEFFAABBCCDDEEFF00000000'
                    }
                }
            );


        })
        .catch( (err) =>  {

            return Promise.reject(err);
        });
};


/**
 * Sets admin permissions
 */

const setAdmin = function (username, admin){

    return connectToWebprotege()
        .then((res) => {

            const roles = res.db.collection('RoleAssignments');

            const roleObject =
                {
                    projectId: res._id,
                    assignedRoles: normalAccountPermissions.assignedRoles,
                    roleClosure: normalAccountPermissions.roleClosure,
                    actionClosure: normalAccountPermissions.actionClosure
                };

            if (admin){
                roleObject.assignedRoles = adminPermissions.assignedRoles;
                roleObject.roleClosure = adminPermissions.roleClosure;
                roleObject.actionClosure = adminPermissions.actionClosure;
            }

            //Update roles for user. If not exist, create.
            return roles.updateOne(
                { userName: username },
                {
                    $set: roleObject
                },
                { upsert: true }
            );




        })
        .catch( (err) =>  {

            return Promise.reject(err);
        });


};


/**
 * Activates or deactivates an account, storing the old hash for when activating again.

 */
const setActive = function (username,active){


    return connectToWebprotege()
        .then((res) => {

            const users = res.db.collection('Users');

            return users.findOne({ _id:username })
                .then((user) => {

                    const deactivatedPass = user.deactivatedPass;
                    const currentPass = user.saltedPasswordDigest;

                    if (active && !deactivatedPass ){ //If wants to activate and deactivatedPass is empty, PANIC!

                        throw 'cannot activate as user has not a deactivedPass stored! should not happen';
                    }

                    if (active){ //To active, we empty the deactivatedPass field, and put the deactivatedPass in saltedPasswordDigest
                        return users.updateOne({ _id:username },{ $set:{ saltedPasswordDigest:deactivatedPass, deactivatedPass: undefined } });
                    }

                    //To deactive, we put the saltedPasswordDigest into deactivatedPass, and put AABB... into password
                    return users.updateOne({ _id:username },{ $set:{ saltedPasswordDigest:'AABBCCDDEEFFAABBCCDDEEFF00000000', deactivatedPass: currentPass } });


                });


        })
        .catch( (err) =>  {

            return Promise.reject(err);
        });

};


//Sharing permissions for the project
const normalAccountPermissions = { 'assignedRoles' : ['CanEdit'], 'roleClosure' : ['ProjectEditor', 'IssueCommenter', 'CanView', 'IssueViewer', 'ProjectDownloader', 'ProjectViewer', 'CanComment', 'CanEdit', 'IssueCreator', 'ObjectCommenter'], 'actionClosure' : ['AddOrRemovePerspective', 'AddOrRemoveView', 'AssignOwnIssueToSelf', 'CloseOwnIssue', 'CommentOnIssue', 'CreateClass', 'CreateDatatype', 'CreateIndividual', 'CreateIssue', 'CreateObjectComment', 'CreateProperty', 'DeleteClass', 'DeleteDatatype', 'DeleteIndividual', 'DeleteProperty', 'DownloadProject', 'EditOntology', 'EditOntologyAnnotations', 'EditOwnObjectComment', 'EditOwnObjectComment', 'RevertChanges', 'SetObjectCommentStatus', 'ViewAnyIssue', 'ViewChanges', 'ViewObjectComment', 'ViewProject', 'WatchChanges'] };
const adminPermissions = { 'assignedRoles' : ['CanManage'], 'roleClosure' : ['IssueCommenter', 'CanView', 'IssueViewer', 'ProjectDownloader', 'ProjectManager', 'CanEdit', 'CanManage', 'ObjectCommenter', 'ProjectEditor', 'IssueManager', 'ProjectViewer', 'CanComment', 'IssueCreator', 'LayoutEditor'], 'actionClosure' : ['AddOrRemovePerspective', 'AddOrRemovePerspective', 'AddOrRemoveView', 'AddOrRemoveView', 'AssignAnyIssueToAnyone', 'AssignOwnIssueToSelf', 'CloseAnyIssue', 'CloseOwnIssue', 'CommentOnIssue', 'CreateClass', 'CreateDatatype', 'CreateIndividual', 'CreateIssue', 'CreateObjectComment', 'CreateProperty', 'DeleteClass', 'DeleteDatatype', 'DeleteIndividual', 'DeleteProperty', 'DownloadProject', 'EditNewEntitySettings', 'EditOntology', 'EditOntologyAnnotations', 'EditOwnObjectComment', 'EditOwnObjectComment', 'EditProjectSettings', 'EditSharingSettings', 'RevertChanges', 'SaveDefaultProjectLayout', 'SetObjectCommentStatus', 'UpdateAnyIssueBody', 'UpdateAnyIssueTitle', 'UploadAndMerge', 'ViewAnyIssue', 'ViewChanges', 'ViewObjectComment', 'ViewProject', 'WatchChanges'] };


/**
 * Private method to calculate salt and hash for a password.
 */
const calculateSaltAndHash = function (password,length){

    const salt =  Crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0,length);   /** return required number of characters */

    const hash =  Crypto.createHash('md5').update(salt + password).digest('hex');
    return {
        salt,
        hash
    };
};



module.exports = {
    addUser,
    updateUserPassword,
    updateUserDetails,
    removeUser,
    setAdmin,
    setActive,
    getProjectId
};
