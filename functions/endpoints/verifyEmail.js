const uuidv4 = require('uuid/v4'); 
const validator = require('validator');
const admin = require('firebase-admin');
const database = admin.firestore();

exports.verifyEmail = function (req, res) {
    const userInfo = req.body; 
    let userData;
    let userID;
    try {
        database.collection('Users').where('UserID', '==', userInfo.UserToken).get()
        .then((snapshot)=>{
            snapshot.forEach((doc) => {
                userData = doc.data(); 
                userID = doc.id;
            })
            if (userData.EmailVerified !== true){
                database.collection('Users').doc(userID).update({
                    EmailVerified : true
                })
                .then(() => {
                    res.send({status : 200, statusmessage : 'success'});
                    console.log('Email Verified Successfully');
                })
                .catch((err)=>{
                    res.send({status : err.code, statusmessage : err.message});
                    console.log(err.message);
                })
            } else {
                res.send({status : 401 , statusmessage : 'Email Verfied Already'});
            }
        })
        .catch((err) => {
            res.send({status : err.code, statusmessage : err.message});
            console.log(err.message);
        })
    }
    catch(err){
        console.log(err.message);
        res.send({status : 400, statusmessage : err.message, errorMessage : 'Bad Request'});
    }
}