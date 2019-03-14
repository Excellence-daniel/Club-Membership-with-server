"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// import * as validator from 'validator';
// import * as uuid from 'uuid';
const cors = require("cors");
const express = require("express");
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
app.post('/tryCloud', function (req, res) {
    res.send("Hello from Firebase!");
});
exports.helloWorld = functions.https.onRequest(app);
// const validateEmail = validator.isEmail('ade@gmail.com');
//# sourceMappingURL=index.js.map