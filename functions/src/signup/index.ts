import * as uuidv4 from 'uuid/v4';
import * as validator from 'validator';
import * as admin from 'firebase-admin';
const database = admin.firestore();

export const signup = async function(req,res){
    const data = req.body;
    const numbers = /\d+/;
    const specialchars = /[ !@#$%^&*()`_+\-=\[\]{};':'\\|,.<>\/?]/; 
    const isEmail = validator.isEmail(data.email)
    const UserTokenID = uuidv4();
    console.log(UserTokenID);
    //check if the email data sent is an actual email
    if (data.password.length > 9 && numbers.test(data.password) && specialchars.test(data.password)){
        if (isEmail) {
            //check if a user with the email exists
            var checkIfUserExists = await database.collection('Users').where('Email', '==', data.email).get();
            if (checkIfUserExists.empty) {
                try { 
                    await admin.auth().createUser({
                        email: data.email,
                        password: data.password
                    })
                    await database.collection('Users').doc().set({
                        Name: data.name,
                        Email: data.email,
                        EmailVerified: false,
                        PhoneNumber: data.phone,
                        Address: data.address,
                        Password: data.password,
                        ClubsJoined: [],
                        UserToken: UserTokenID
                    })
                    console.log('User sign in successful');
                    res.send({ status : 200, signInStatus: 'success' });
                } 
                catch (err) {
                    console.log('/signup ---', err.message);       
                    res.send({status : 400, statusmessage : err.message, errorMessage : 'Bad Request'});            
                }
            } else {
                res.send({status : 401, statusmessage : 'A User with this Email already exists. Please use another email to register.'});
            }
        } else {
            res.send({status : 400, statusmessage : 'Email not in the right format'});
        }
    } else {
        res.send({status : 400 , statusmessage : 'Password is not strong.!'});
    }
}