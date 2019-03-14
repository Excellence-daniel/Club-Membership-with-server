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
exports.verifyEmail = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userInfo = req.body;
        let userData;
        let userID;
        try {
            const getUserByID = yield database.collection('Users').where('UserToken', '==', userInfo.UserToken).get();
            getUserByID.forEach((doc) => {
                userData = doc.data();
                userID = doc.id;
            });
            if (userData.EmailVerified !== true) {
                yield database.collection('Users').doc(userID).update({
                    EmailVerified: true
                });
                res.send({ status: 200, statusmessage: 'success' });
                console.log('Email Verified Successfully');
            }
            else {
                res.send({ status: 401, statusmessage: 'Email Verfied Already' });
            }
        }
        catch (err) {
            console.log(err.message);
            res.send({ status: 400, statusmessage: err.message, errorMessage: 'Bad Request' });
        }
    });
};
//# sourceMappingURL=index.js.map