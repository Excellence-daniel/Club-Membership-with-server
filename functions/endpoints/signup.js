const uuidv4 = require('uuid/v4'); 
const validator = require('validator');
const admin = require('firebase-admin');
const database = admin.firestore();

exports.signUp = function (req, res) {
    const data = req.body;
    const numbers = /\d+/;
    const specialchars = /[ !@#$%^&*()`_+\-=[\]{};':'\\|,.<>/?]/;
    const isEmail = validator.isEmail(data.email);
    const UserTokenID = uuidv4();
    let checkIfUserExists;
    //check if the email data sent is an actual email
    if (data.password.length > 9 && numbers.test(data.password) && specialchars.test(data.password)) {
        if (isEmail) {      //validate email
            database.collection('Users').where('Email', '==', data.email).get()
                .then((doc) => {
                    checkIfUserExists = doc.empty; //check if any profile is created with the email
                    if (checkIfUserExists) {
                        try {
                            admin.auth().createUser({
                                email: data.email,
                                password: data.password
                            })  //create user auth
                                .then(() => {
                                    database.collection('Users').doc().set({
                                        Name: data.name,
                                        Email: data.email,
                                        EmailVerified: false,
                                        PhoneNumber: data.phone,
                                        Address: data.address,
                                        Password: data.password,
                                        ClubsJoined: [],
                                        UserToken: UserTokenID
                                    }) //create user profile
                                        .then(() => {
                                            console.log('User sign in successful');
                                            res.send({ status: 200, signInStatus: 'success' });
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            res.send({ status: err.code, statusmessage: err.message, errorMessage: 'Bad Request I' });
                                        })
                                })
                                .catch((err) => {
                                    console.log(err);
                                    res.send({ status: err.code, statusmessage: err.message, errorMessage: 'Bad Request II' });
                                })
                        }
                        catch (err) {
                            console.log(err, err.message);
                            res.send({ status: err.code, statusmessage: err.message, errorMessage: 'Bad Request III' });
                        }
                    } else {
                        res.send({ status: 401, statusmessage: 'A User with this Email already exists. Please use another email to register.' });
                    }
                })
                .catch((err) => {
                    console.log(err)
                    res.send({ status: err.code, statusmessage: err.message, errorMessage: 'Bad Request IV' });
                })
        } else {
            res.send({ status: 400, statusmessage: 'Email not in the right format' });
        }
    } else {
        res.send({ status: 400, statusmessage: 'Password is not strong.!' });
    }
};