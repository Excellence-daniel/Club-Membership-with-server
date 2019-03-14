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

// const database = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

app.post('/tryCloud', function(req, res){
    res.send("Hello from Firebase!");
})
export const helloWorld = functions.https.onRequest(app);


// const validateEmail = validator.isEmail('ade@gmail.com');