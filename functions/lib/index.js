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
const index_1 = require("./signup/index");
const index_2 = require("./verifyEmail/index");
// const database = admin.firestore();
app.post('/tryCloud', function (req, res) {
    res.send("Hello from Firebase!");
});
app.post('/signup', index_1.signup);
app.post('/VerifyEmail', index_2.verifyEmail);
exports.ClubApp = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map