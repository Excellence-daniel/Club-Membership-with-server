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

app.post('/signup', funcSignUp.signUp);

app.post('/', (req, res) => {
    res.send('Hi there you!');
})

exports.ClubApp = functions.https.onRequest(app);

