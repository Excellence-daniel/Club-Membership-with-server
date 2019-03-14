const functions = require('firebase-functions');
const cors = require('cors');
const express = require('express');
const uuidv4 = require('uuid/v4'); 
const validator = require('validator');
const admin = require('firebase-admin');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const serviceAccount = require('./service_account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://club-membership-87748.firebaseio.com'
});

const database = admin.firestore();

const funcSignUp = require('./endpoints/signup');
const funcVerifyEmail = require('./endpoints/verifyEmail');
const funcJoinClub = require('./endpoints/joinClub');
const userQueries = require('./endpoints/userQueries');

const verifyUserToken  = function(req, res, next){
    const IdToken = req.body.IdToken;
    try{
        admin.auth().verifyIdToken(IdToken)
        .then((decodedToken)=>{
            console.log('Middle Ware Check : User Found');
            next();
        })
        .catch((err)=>{
            console.log('HHEY', 'User not found. Invalid Token', err.message);
            res.send({status : 401, statusmessage : 'Invalid User.', errorMessage : err.message})
        })
    }
    catch(error){
        console.log('hhi', error);
        res.send({status : 400, statusmessage : 'User not found!'});
    }
}

app.post('/signup', funcSignUp.signUp);     //create a user 

app.post('/VerifyEmail', funcVerifyEmail.verifyEmail);  //verify email

app.post('/getCurrentUserData', verifyUserToken, userQueries.getCurrentUserData); //get current user data

app.post('/updateProfile', verifyUserToken, userQueries.UpdateUser); //to update a user's profile

app.post('/deleteUser', verifyUserToken, userQueries.DeleteUser);   //to delete a user

app.post('/', (req, res) => {
    res.send('Hi there you!');
})

exports.ClubApp = functions.https.onRequest(app);

