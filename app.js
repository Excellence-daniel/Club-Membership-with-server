var express = require('express');
var uuidv4 = require('uuid/v4'); //for generating unique IDs for users
var validator = require('validator');
var admin = require('firebase-admin');
var firebase = require('firebase');
const multer = require('multer');
const config = require('./config/config.js');

firebase.initializeApp(config); 

var serviceAccount = require('./club-membership-87748-firebase-adminsdk-v7lcs-484daf42c1.json');
// const serviceAccount = require('./c')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://club-membership-87748.firebaseio.com'
});
const database = admin.firestore();
const cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(cors());
const port = 2000;

const queriesRoute = require('./routes/index.js');

app.listen(port, function () {
    console.log('Working on port 2000'); //gets the server working     
})


app.use('/signup', async function(req, res){
    const data = req.body;
    const numbers = /\d+/;
    const specialchars = /[ !@#$%^&*()`_+\-=\[\]{};':'\\|,.<>\/?]/; 
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
})


app.use('/VerifyEmail', async(req,res)=>{
    const userInfo = req.body; 
    let userData;
    let userID;
    try {
        const getUserByID = await database.collection('Users').where('UserID', '==', userInfo.UserID).get();
        getUserByID.forEach((doc)=>{
            userData = doc.data(); 
            userID = doc.id;
        })

        if (userData.EmailVerified !== true){
            await database.collection('Users').doc(userID).update({
                EmailVerified : true
            })
            res.send({status : 200, statusmessage : 'success'});
            console.log('Email Verified Successfully');
        } else {
            res.send({status : 401 , statusmessage : 'Email Verfied Already'});
        }
    }
    catch(err){
        console.log(err.message);
        res.send({status : 400, statusmessage : err.message, errorMessage : 'Bad Request'});
    }
})


app.use('/joinClub', async function (req, res){
    const clubInfo = req.body;
    let clubID;
    let clubMembers;
    let clubMemberLimit;
    let userClubsJoined;
    let userID;
    let userData;
    let clubInvites;  
    let newClub;
    const clubQuery = await database.collection('Clubs').where('ClubID', '==', clubInfo.clubID).get();
    if (clubQuery.empty) {
        res.send({status : 400, statusmessage : 'The Club does not exist!', errorMessage  : 'Bad Request'});
    } else {
        try {
            const getUser = await database.collection('Users').where('Email', '==', clubInfo.userEmail).get();
            const getClub = await database.collection('Clubs').where('ClubID', '==', clubInfo.clubID).get();
            if (getUser.docs.length > 0){ 
                //check if the club exists
                if (getClub.empty === true){
                    console.log('Club does not exist');
                    res.send({status : 401 , statusmessage : 'Club does not exist'});
                } else {
                    //get members of the club
                    getClub.forEach((snapshot)=>{
                        clubMembers = snapshot.data().Members;
                        clubInvites = snapshot.data().Invites;
                        clubMemberLimit = snapshot.data().MemberLimit;
                        clubID = snapshot.id;
                        newClub = {'Club' : snapshot.data().ClubName, 'Type' : snapshot.data().ClubType, 'AdminEmail' : snapshot.data().AdminEmail};
                        console.log('CLUB ID', clubID);
                    })
                    //check if the user is alredy a member of the club. 
                    var checkIfUserEmailExistsInClubMemberArr = clubMembers.filter(userCheck => (userCheck.email === clubInfo.userEmail));
                    if (checkIfUserEmailExistsInClubMemberArr.length > 0){
                        console.log('You already belong to this club');
                        res.send({status : 401 , statusmessage : 'You already belong to this club'});
                    } else {
                        //check if the member limit is reached
                        if (clubMembers.length < clubMemberLimit){      //if limit is not reached
                            getUser.forEach(snapshot=>{
                                userID = snapshot.id;   //get user id 
                                userData = snapshot.data();  //get all userData
                                console.log('SNAP USER', snapshot.data());
                                console.log('SNAPSHOT', snapshot.id);
                            })
                            console.log('USER DATA' , userData);
                            userClubsJoined = userData.ClubsJoined;     //club joined array in the user data gottten
                            userClubsJoined.push(newClub);      //add the new club array to the userclubsjoined array
                            await database.collection('Users').doc(userID).update({
                                ClubsJoined : userClubsJoined       //update array
                            })
    
                            //if update is successful
                            const newMember = {'name' : userData.Name, 'email' : userData.Email};    //initialize new member
                            clubMembers.push(newMember);    //append into the array clubMembers
                            const inviteID = clubInvites.findIndex(invite => invite.email === clubInfo.userEmail);  //get the index of the invite in the club user email
                            clubInvites[inviteID].accepted = true;      //change the boolean value to true
                            //update Members and Invites
                            console.log('JOINCLUB CLUBID', clubID);
                            await database.collection('Clubs').doc(clubID).update({
                                Members : clubMembers,
                                Invites : clubInvites
                            })
                            res.send({status : 200 , statusmessage : 'You have joined this club!'});
                        } else {
                            console.log('Club Limit Reached. You cannot join this club');
                            res.send({status : 401, statusmessage : 'Club Member Limit Reached. You cannot join this club.'});
                        }
                    }
                }
            } else {
                res.send({status : 402 , statusmessage : 'Invited email does not have an account'});     //send 402 if user doesnt have an account with club membership app. 
                console.log('User does not have an account with club membership');
            }
        }
        catch(err){
            res.send({status : 400 , statusmessage : err.message, errorMessage : 'Bad Request'});
        }
    }
})

app.use(async function(req, res, next){
    const IdToken = req.body.IdToken;
    try{
        const decodedToken = await admin.auth().verifyIdToken(IdToken);
        console.log('DecodedToken', decodedToken)
        if (decodedToken) {
            console.log('Middle Ware Check : User Found');
            next();
        } else {
            console.log('HHEY', 'User not found. Invalid Token');
            res.send({status : 401, statusmessage : 'Invalid User.'})
        }
    }
    catch(error){
        console.log('hhi', error);
        res.send({status : 400, statusmessage : 'User not found!'});
    }
})

app.use('/api', queriesRoute);
