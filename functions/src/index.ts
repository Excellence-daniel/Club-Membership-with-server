import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// import * as validator from 'validator';
// import * as uuid from 'uuid';
import * as cors from 'cors';
import * as express from 'express';


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const serviceAccount = require('../service_account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://club-membership-87748.firebaseio.com'
});

import { signup } from './signup/index';
import { verifyEmail } from './verifyEmail/index';
import { getCurrentUserData, UpdateUser, DeleteUser } from './userQueries/index';
import { CreateClub, EditClub, UpdateClub, DeleteClub, GetClubsDataOfCurrentUser, InviteMembers, GetClubDataByID } from './clubQueries/index';

// const database = admin.firestore();

const verifyUserToken = async function (req, res, next) {
    const IdToken = req.body.IdToken;
    try{
        const decodedToken = await admin.auth().verifyIdToken(IdToken);
        console.log('decoded Token', decodedToken);
    
        if (decodedToken) {
            console.log('Middle Ware Check : User Found');
            next();
        } else {
            console.log('HHEY', 'User not found. Invalid Token');
            res.send({ status: 401, statusmessage: 'Invalid User.' });
        }
    }
    catch(error){
        console.log('hhi', error);
        res.send({status : 400, statusmessage : 'User not found!'});
    }
}



app.post('/signup', signup);

app.post('/VerifyEmail', verifyEmail);

app.post('/getCurrentUserData', verifyUserToken, getCurrentUserData);

app.post('/updateProfile', verifyUserToken, UpdateUser);

app.post('/deleteUser', verifyUserToken, DeleteUser);

app.post('/CreateClub', verifyUserToken, CreateClub);

app.post('/EditClub', verifyUserToken, EditClub);

app.post('/UpdateClub', verifyUserToken, UpdateClub);

app.post('/deleteClub', verifyUserToken, DeleteClub);

app.post('/getClubsUsingCurrentUserData', verifyUserToken, GetClubsDataOfCurrentUser);

app.post('/InviteMembers', verifyUserToken, InviteMembers);

app.post('/getClubByClubID', verifyUserToken, GetClubDataByID);

export const ClubApp = functions.https.onRequest(app);
