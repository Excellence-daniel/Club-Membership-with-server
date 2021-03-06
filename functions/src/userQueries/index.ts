import * as admin from 'firebase-admin';
const database = admin.firestore();

export const getCurrentUserData = async function (req, res) {
    let userData; 
    let userID; 
    const data = req.body;
    const userEmail = data.userEmail; 
    console.log('User Email', userEmail);  
    try {
        const getUserQuery = await database.collection('Users').where('Email', '==', userEmail).get()
        console.log(getUserQuery)   //get from collection USERS using email
        getUserQuery.forEach((doc) => {
            console.log('data', doc, doc.data());
            userData = doc.data();
            userID = doc.id;
        })
        if (userData) {
            res.send({status : 200, UserEmail : userEmail, userData : userData, userID : userID});  //if data is gotten
        } else {
            res.send({status : 400, UserEmail : userEmail, userData : null, userID : null, statusmessage : 'no matching documents in firebase'}); //data is not gotten 
        } 
        console.log('Current User Email', userEmail, '---/getCurrentUserData');
    }
    catch(err){
        console.log(err.message);
        res.send({status : 400, UserEmail : null});
    }
}


export const UpdateUser = async function (req, res) {
    const userData = req.body;
    try{
        await database.collection('Users').doc(userData.userID).update({
            Name : userData.Name, 
            Email : userData.Email,
            Address : userData.Address,
            PhoneNumber : userData.Phone
        });
        res.send({status : 200, statusmessage : 'Success'});
    }
    catch(err){
        res.send({status : 400, statusmessage : err.message , errorMessage : 'Bad Request'});
    }
}


export const DeleteUser = async function (req, res) {
    const userData = req.body;
    try { 
        await admin.auth().deleteUser(userData.uid);
        res.send({status : 200, statusmessage : 'User Profile Deleted'});
    }
    catch(err){
        res.send({status : 200, statusmessage : err.message, errorMessage : 'Error Deleting the user.'});
    }
}