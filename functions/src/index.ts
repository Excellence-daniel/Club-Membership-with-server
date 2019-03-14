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

// const database = admin.firestore();

app.post('/tryCloud', function(req, res){
    res.send("Hello from Firebase!");
})

app.post('/signup', signup);

app.post('/VerifyEmail', verifyEmail);




export const ClubApp = functions.https.onRequest(app);
