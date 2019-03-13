// var uuidv4 = require('uuid/v4'); //for generating unique IDs for users
// var validator = require('validator');
// var admin = require('firebase-admin');
// var database = admin.firestore();

// exports.signUp = async(request, response) => {
//     const data = req.body;
//     const numbers = /\d+/;
//     const specialchars = /[ !@#$%^&*()`_+\-=[\]{};':'\\|,.<>/?]/; 
//     const isEmail = validator.isEmail(data.email)
//     const UserUUID = uuidv4();
//     console.log(UserUUID);
//     //check if the email data sent is an actual email
//     if (data.password.length > 9 && numbers.test(data.password) && specialchars.test(data.password)){
//         if (isEmail) {
//             //check if a user with the email exists
//             var checkIfUserExists = await database.collection('Users').where('Email', '==', data.email).get();
//             if (checkIfUserExists.empty) {
//                 try { 
//                     await admin.auth().createUser({
//                         email: data.email,
//                         password: data.password
//                     })
//                     await database.collection('Users').doc().set({
//                         Name: data.name,
//                         Email: data.email,
//                         EmailVerified: false,
//                         PhoneNumber: data.phone,
//                         Address: data.address,
//                         Password: data.password,
//                         ClubsJoined: [],
//                         UserID: UserUUID
//                     })
//                     console.log('User sign in successful');
//                     response.send({ status : 200, signInStatus: 'success' });
//                 } 
//                 catch (err) {
//                     console.log('/signup ---', err.message);       
//                     response.send({status : 400, statusmessage : err.message, errorMessage : 'Bad Request'});            
//                 }
//             } else {
//                 response.send({status : 401, statusmessage : 'A User with this Email already exists. Please use another email to register.'});
//             }
//         } else {
//             response.send({status : 400, statusmessage : 'Email not in the right format'});
//         }
//     } else {
//         response.send({status : 400 , statusmessage : 'Password is not strong.!'});
//     }
// }
