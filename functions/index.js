const functions = require('firebase-functions');
var uuidv4 = require('uuid/v4'); //for generating unique IDs for users
var validator = require('validator');
var admin = require('firebase-admin');

// var serviceAccount = require('../config/club-membership-87748-firebase-adminsdk-v7lcs-484daf42c1.json');
// var serviceAccount = require('../club-membership-87748-firebase-adminsdk-v7lcs-484daf42c1.json')

admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "club-membership-87748",
    "private_key_id": "484daf42c12d8c691ff449e77dff448d72e63afe",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIrl6VXJnv3NP3\n/b2z9dtcKZVSiRUEfT9cExFg/C6CAklhlMbf+XIUkOBbqzpIgizUcxd2MGtjCFs8\nJDeLclq9zUuJR4wJhET3JNbc1arXhMQ6ieDqrUa3Ihqou+EDhYUOHuW4hK4G6AnA\nnDhhUaKGaicobzhbIlZfI7b5qMF66Ukk6JFY+zv7XOzLyROHyTH6+5L6tPKcqxiN\nMFIQqvfdY2S6hXfxGOxL3w+LmPkv8ywV2+XbHRSskI2lmx5tOgzMmB6X31aMIzU2\nbnxtpo2hlA5E5TOJEedOgNyRS4Mu61OQ+nTLTVKXBs6fJkDFyHI7vv/H2LXLM2R7\nNDvEY03ZAgMBAAECggEABcfsIDGPAUQwJ2X78U0YTBl29gebGOPowtfzxk9aOzmI\no2x8DCPgUuvxFc+8oC3laU6Fcv/Zea/AcEUuanBy+u7vVmpYUN/dqSCHcsyFUHim\nutvE8TQbpBcYUIFuoNs95km8KvdIS7LWF3vVYSXoxvMUFkvNG+b4OPzLS3oLVMu9\nf5LBiDWtIDx23CQ1Gp4Xa3kKtWKTJbjMcfS82RYYq97X5JbE27wokNPfiTISl9BU\n3J1wShQc87z8G2dffqCSQR1m1L0hopfR1c07mt4BX/cNTxe1u9PcafBPCwRhg0Bf\nOV09Jm++E4JSu0L8zRGsiOn/WYmoWdi/kvg81opYGQKBgQD0pP/bR6/rDZg5wVC9\nIYPeiVWOL77kr9BkBsV2taL7fVtuT83+p81HpeG2MFFCL7uB0jaMCaqLvyNfrI8G\nrjUVWS28phsj3depD+eAQsGR3kMAUkmTZhBU7cQZdyGLP8iSOTiH/777sTJgwV7h\n6XybWjzff7c+a/DuYgTT8On9hQKBgQDR/vkJaYc7rbLQcDOwvyTYNxMHyTNa3YZ2\nC+sX9zkpCGd1E6qZUIjFj3z+oWzREKmWGBrEQxt5qlqAUxM2RRCk8JuZbTVjHS6C\n96sKT4hEizAe5EW7kEmHgLV4I4faqsuUwKLKB9FdcLY5t2o0Xoe/QswWZEfGYskK\nuj/vKILlRQKBgBLyxK5jOwjloKi4hFxhwCj4UhwVLp/fzjAxJhIvt1PrPa2pmLbk\noE2wV28ZBvItaESB15+5D/CK+V5rqxhFXe8tXRGDfA6nHBEIHlIc2YlGwcHAndpA\nyXsKf2nJhFuYsRxCOlKuSEiOTOyZjZPJ1dDiiFx3M+YtzhdomB8iRb1RAoGBALuE\nramD/GiEMTsEFoRsC2CvvWSkfCFV064x8lrSPs6vXIMlbp+9VITmHr3aNCt0b5tC\nJxS+wBgi0PHqPSum/Lfsy2V0Kco50sDMnIV2g76BdBUBzmsw6xf/DQ0c3UGcZnKM\nmlFCLej8rxxW9pWRHDLkWQ5dueIjcFcN/e14BXrpAoGAULaE8WgXLiveMDY+IJg5\nrf0KysA4mgyiUBjy/gEgS5PdicUM7o2nsy3Y0tM3ZSQWGK5C2xxfQrSx4e30PM4j\nMieFm8ASSaqomW7IwIY804f2giDSDs/75HnonIm23yNkjHrIP6HruJmcwAT7IUuE\nE6HQA1LT+qz/oDj4nE6/lKU=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-v7lcs@club-membership-87748.iam.gserviceaccount.com",
    "client_id": "102408121525973320486",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-v7lcs%40club-membership-87748.iam.gserviceaccount.com"
  }
  ),
  databaseURL: 'https://club-membership-87748.firebaseio.com'
});

var database = admin.firestore();
// const app = require('../app.js')

const userQueries = require('./userQueries')
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//



exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});


exports.signUp = functions.https.onRequest(async (request, response) => {
    const data = req.body;
    const numbers = /\d+/;
    const specialchars = /[ !@#$%^&*()`_+\-=[\]{};':'\\|,.<>/?]/; 
    const isEmail = validator.isEmail(data.email)
    const UserUUID = uuidv4();
    console.log(UserUUID);
    
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
                        UserID: UserUUID
                    })
                    console.log('User sign in successful');
                    response.send({ status : 200, signInStatus: 'success' });
                } 
                catch (err) {
                    console.log('/signup ---', err.message);       
                    response.send({status : 400, statusmessage : err.message, errorMessage : 'Bad Request'});            
                }
            } else {
                response.send({status : 401, statusmessage : 'A User with this Email already exists. Please use another email to register.'});
            }
        } else {
            response.send({status : 400, statusmessage : 'Email not in the right format'});
        }
    } else {
        response.send({status : 400 , statusmessage : 'Password is not strong.!'});
    }
});