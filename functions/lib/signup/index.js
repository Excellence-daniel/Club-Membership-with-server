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
const uuidv4 = require("uuid/v4");
const validator = require("validator");
const admin = require("firebase-admin");
const database = admin.firestore();
exports.signup = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = req.body;
        const numbers = /\d+/;
        const specialchars = /[ !@#$%^&*()`_+\-=\[\]{};':'\\|,.<>\/?]/;
        const isEmail = validator.isEmail(data.email);
        const UserTokenID = uuidv4();
        console.log(UserTokenID);
        //check if the email data sent is an actual email
        if (data.password.length > 9 && numbers.test(data.password) && specialchars.test(data.password)) {
            if (isEmail) {
                //check if a user with the email exists
                var checkIfUserExists = yield database.collection('Users').where('Email', '==', data.email).get();
                if (checkIfUserExists.empty) {
                    try {
                        yield admin.auth().createUser({
                            email: data.email,
                            password: data.password
                        });
                        yield database.collection('Users').doc().set({
                            Name: data.name,
                            Email: data.email,
                            EmailVerified: false,
                            PhoneNumber: data.phone,
                            Address: data.address,
                            Password: data.password,
                            ClubsJoined: [],
                            UserToken: UserTokenID
                        });
                        console.log('User sign in successful');
                        res.send({ status: 200, signInStatus: 'success' });
                    }
                    catch (err) {
                        console.log('/signup ---', err.message);
                        res.send({ status: 400, statusmessage: err.message, errorMessage: 'Bad Request' });
                    }
                }
                else {
                    res.send({ status: 401, statusmessage: 'A User with this Email already exists. Please use another email to register.' });
                }
            }
            else {
                res.send({ status: 400, statusmessage: 'Email not in the right format' });
            }
        }
        else {
            res.send({ status: 400, statusmessage: 'Password is not strong.!' });
        }
    });
};
//# sourceMappingURL=index.js.map