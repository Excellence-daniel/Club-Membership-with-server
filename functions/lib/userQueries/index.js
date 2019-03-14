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
const admin = require("firebase-admin");
const database = admin.firestore();
exports.getCurrentUserData = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let userData;
        let userID;
        const data = req.body;
        const userEmail = data.userEmail;
        console.log('User Email', userEmail);
        try {
            const getUserQuery = yield database.collection('Users').where('Email', '==', userEmail).get();
            console.log(getUserQuery); //get from collection USERS using emailg
            getUserQuery.forEach((doc) => {
                console.log('data', doc, doc.data());
                userData = doc.data();
                userID = doc.id;
            });
            if (userData) {
                res.send({ status: 200, UserEmail: userEmail, userData: userData, userID: userID }); //if data is gotten
            }
            else {
                res.send({ status: 400, UserEmail: userEmail, userData: null, userID: null, statusmessage: 'no matching documents in firebase' }); //data is not gotten 
            }
            console.log('Current User Email', userEmail, '---/getCurrentUserData');
        }
        catch (err) {
            console.log(err.message);
            res.send({ status: 400, UserEmail: null });
        }
    });
};
//# sourceMappingURL=index.js.map