"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const index_3 = require("./userQueries/index");
// const database = admin.firestore();
const verifyUserToken = app.use(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const IdToken = req.body.IdToken;
        try {
            const decodedToken = yield admin.auth().verifyIdToken(IdToken);
            console.log('DecodedToken', decodedToken);
            if (decodedToken) {
                console.log('Middle Ware Check : User Found');
                next();
            }
            else {
                console.log('HHEY', 'User not found. Invalid Token');
                res.send({ status: 401, statusmessage: 'Invalid User.' });
            }
        }
        catch (error) {
            console.log('hhi', error);
            res.send({ status: 400, statusmessage: 'User not found!' });
        }
    });
});
app.post('/signup', index_1.signup);
app.post('/VerifyEmail', index_2.verifyEmail);
app.post('/getCurrentUserData', verifyUserToken, index_3.getCurrentUserData);
app.post('/UpdateUser', verifyUserToken, index_3.UpdateUser);
exports.ClubApp = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map