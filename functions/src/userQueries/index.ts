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
        console.log(getUserQuery)   //get from collection USERS using emailg
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