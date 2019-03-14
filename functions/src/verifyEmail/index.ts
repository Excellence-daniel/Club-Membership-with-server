import * as admin from 'firebase-admin';
const database = admin.firestore();

export const verifyEmail = async function(req, res) {
    const userInfo = req.body; 
    let userData;
    let userID;
    try {
        const getUserByID = await database.collection('Users').where('UserToken', '==', userInfo.UserToken).get();
        getUserByID.forEach((doc)=>{
            userData = doc.data(); 
            userID = doc.id; 
        })

        if (userData.EmailVerified !== true){
            await database.collection('Users').doc(userID).update({
                EmailVerified : true
            })
            res.send({status : 200, statusmessage : 'success'});
            console.log('Email Verified Successfully');
        } else {
            res.send({status : 401 , statusmessage : 'Email Verfied Already'});
        }
    }
    catch(err){
        console.log(err.message);
        res.send({status : 400, statusmessage : err.message, errorMessage : 'Bad Request'});
    }
}