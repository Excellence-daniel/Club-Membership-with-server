var express = require('express');
var uuidv4 = require('uuid/v4'); //for generating unique IDs for users
var validator = require('validator');
var admin = require("firebase-admin");
var firebase = require('firebase');
var multer = require('multer')
var config = {
    apiKey: "AIzaSyAfZOg7lWBCdL3PUIhupZuYm18jx10bLZo",
    authDomain: "club-membership-87748.firebaseapp.com",
    databaseURL: "https://club-membership-87748.firebaseio.com",
    projectId: "club-membership-87748",
  };
firebase.initializeApp(config); 

var serviceAccount = require("./club-membership-87748-firebase-adminsdk-v7lcs-484daf42c1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://club-membership-87748.firebaseio.com"
});
var database = admin.firestore();
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());
app.use(cors());
const port = 2000;

var signUUp = require('./routes/index.js');

app.listen(port, function () {
    console.log("Working on port 2000"); //gets the server working     
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
    const newClub = {"Club" : clubInfo.clubname, "Type" : clubInfo.clubtype}
    const clubQuery = await database.collection('Clubs').where('ClubID', '==', clubInfo.clubID).get()
    console.log(clubQuery.empty)
    if (clubQuery.empty){
        res.send({status : 400, statusmessage : 'The Club does not exist!', errorMessage  : 'Bad Request'})
    } else {
        console.log(clubInfo)
        try {
            const getUser = await database.collection('Users').where("Email", "==", clubInfo.userEmail).get()
            const getClub = await database.collection('Clubs').where("ClubID", "==", clubInfo.clubID).get()
    
            if (getUser.docs.length > 0){ 
                //check if the club exists
                if (getClub.empty === true){
                    console.log("Club does not exist")
                    res.send({status : 401 , statusmessage : "Club does not exist"})
                } else {
                    //get members of the club
                    getClub.forEach((snapshot)=>{
                        console.log(snapshot.data().Members)
                        clubMembers = snapshot.data().Members;
                        clubInvites = snapshot.data().Invites;
                        clubMemberLimit = snapshot.data().MemberLimit
                        clubID = snapshot.id
                    })
                    //check if the user is alredy a member of the club. 
                    var checkIfUserEmailExistsInClubMemberArr = clubMembers.filter(userCheck => (userCheck.email === clubInfo.userEmail))
                    if (checkIfUserEmailExistsInClubMemberArr.length > 0){
                        console.log("You already belong to this club")
                        res.send({status : 401 , statusmessage : "You already belong to this club"})
                    } else {
                        //check if the member limit is reached
                        if (clubMembers.length < clubMemberLimit){      //if limit is not reached
                            getUser.forEach(snapshot=>{
                                userID = snapshot.id;   //get user id 
                                userData = snapshot.data()  //get all userData
                                console.log("SNAP USER", snapshot.data())
                                console.log("SNAPSHOT", snapshot.data())
                            })
                            console.log("USER DATA" , userData)
                            userClubsJoined = userData.ClubsJoined;     //club joined array in the user data gottten
                            userClubsJoined.push(newClub);      //add the new club array to the userclubsjoined array
                            database.collection('Users').doc(userID).update({
                                ClubsJoined : userClubsJoined       //update array
                            })
    
                            //if update is successful
                            const newMember = {"name" : userData.Name, "email" : userData.Email}    //initialize new member
                            clubMembers.push(newMember);    //append into the array clubMembers
                            const inviteID = clubInvites.findIndex(invite => invite.email === clubInfo.userEmail);  //get the index of the invite in the club user email
                            clubInvites[inviteID].accepted = true;      //change the boolean value to true
                            //update Members and Invites
                            database.collection('Clubs').doc(clubID).update({
                                Members : clubMembers,
                                Invites : clubInvites
                            })
                            res.send({status : 200 , statusmessage : "You have joined this club!"});
                        } else {
                            console.log("Club Limit Reached. You can't join this club")
                            res.send({status : 401, statusmessage : "Club Member Limit Reached. You can't join this club."});
                        }
                    }
                }
            } else {
                res.send({status : 402 , statusmessage : "Invited email does not have an account"})     //send 402 if user doesnt have an account with club membership app. 
                console.log('User does not have an account with club membership')
            }
        }
        catch(err){
            res.send({status : 400 , statusmessage : err.message, errorMessage : "Bad Request"});
        }
    }
})
// app.post('/joinClub', async(req, res)=>{
    // await firebase.auth().signOut();
    // const clubInfo = req.body;
    // console.log(clubInfo)
    // let clubID, clubMembers, clubMemberLimit, userClubsJoined, userID, userData, clubInvites;  
    // const newClub = {"Club" : clubInfo.clubname, "Type" : clubInfo.clubtype}
    // try {
    //     const getUser = await database.collection('Users').where("Email", "==", clubInfo.userEmail).get()
    //     const getClub = await database.collection('Clubs').where("ClubName", "==", clubInfo.clubname).get()

    //     if (getUser.docs.length > 0){ 
    //         //check if the club exists
    //         if (getClub.empty === true){
    //             console.log("Club does not exist")
    //             res.send({status : 401 , statusmessage : "Club does not exist"})
    //         } else {
    //             //get members of the club
    //             getClub.forEach((snapshot)=>{
    //                 console.log(snapshot.data().Members)
    //                 clubMembers = snapshot.data().Members;
    //                 clubInvites = snapshot.data().Invites;
    //                 clubMemberLimit = snapshot.data().MemberLimit
    //                 clubID = snapshot.id
    //             })
    //             //check if the user is alredy a member of the club. 
    //             var checkIfUserEmailExistsInClubMemberArr = clubMembers.filter(userCheck => (userCheck.email === clubInfo.userEmail))
    //             if (checkIfUserEmailExistsInClubMemberArr.length > 0){
    //                 console.log("You already belong to this club")
    //                 res.send({status : 401 , statusmessage : "You already belong to this club"})
    //             } else {
    //                 //check if the member limit is reached
    //                 if (clubMembers.length < clubMemberLimit){      //if limit is not reached
    //                     getUser.forEach(snapshot=>{
    //                         userID = snapshot.id;   //get user id 
    //                         userData = snapshot.data()  //get all userData
    //                         console.log("SNAP USER", snapshot.data())
    //                         console.log("SNAPSHOT", snapshot.data())
    //                     })
    //                     console.log("USER DATA" , userData)
    //                     userClubsJoined = userData.ClubsJoined;     //club joined array in the user data gottten
    //                     userClubsJoined.push(newClub);      //add the new club array to the userclubsjoined array
    //                     database.collection('Users').doc(userID).update({
    //                         ClubsJoined : userClubsJoined       //update array
    //                     })

    //                     //if update is successful
    //                     const newMember = {"name" : userData.Name, "email" : userData.Email}    //initialize new member
    //                     clubMembers.push(newMember);    //append into the array clubMembers
    //                     const inviteID = clubInvites.findIndex(invite => invite.email === clubInfo.userEmail);  //get the index of the invite in the club user email
    //                     clubInvites[inviteID].accepted = true;      //change the boolean value to true
    //                     //update Members and Invites
    //                     database.collection('Clubs').doc(clubID).update({
    //                         Members : clubMembers,
    //                         Invites : clubInvites
    //                     })
    //                     res.send({status : 200 , statusmessage : "You have joined this club!"});
    //                 } else {
    //                     console.log("Club Limit Reached. You can't join this club")
    //                     res.send({status : 401, statusmessage : "Club Member Limit Reached. You can't join this club."});
    //                 }
    //             }
    //         }
    //     } else {
    //         res.send({status : 402 , statusmessage : "Invited email does not have an account"})     //send 402 if user doesnt have an account with club membership app. 
    //         console.log('User does not have an account with club membership')
    //     }
    // }
    // catch(err){
    //     res.send({status : 400 , statusmessage : err.message, errorMessage : "Bad Request"});
    // }
// })


app.use(function(req, res, next){
    const IdToken = req.body.IdToken;
    try{
        admin.auth().verifyIdToken(IdToken)
        .then((decodedToken) => {
            console.log('Middleware Check -- User Found')
            next();
        })
        .catch((err) => {
            console.log('HHey', err, 'User not found');
            res.send({status : 400, statusmessage : 'User not found!'});
        })
    }
    catch(error){
        console.log('hhi', error);
        res.send({status : 400, statusmessage : 'User not found!'});
    }
})

app.use('', signUUp)

app.post('/VerifyEmail', async(req,res)=>{
    const userInfo = req.body; 
    let userData, userID;
    try {
        const getUserByID = await database.collection('Users').where("UserID", "==", userInfo.UserID).get()
        getUserByID.forEach((doc)=>{
            userData = doc.data()
            userID = doc.id
        })

        if (userData.EmailVerified !== true){
            await database.collection('Users').doc(userID).update({
                EmailVerified : true
            })
                res.send({status : 200, statusmessage : "success"})
                console.log("Email Verified Successfully")
        } else {
            res.send({status : 401 , statusmessage : "Email Verfieid Already"})
        }
    }
    catch(err){
        console.log(err.message)
        res.send({status : 400, statusmessage : err.message, errorMessage : "Bad Request"})
    }
})


app.post('/leaveClub', async (req, res)=>{
    const clubInfo = req.body;
    let clubsjoined, userID, clubMembers, clubInvites, clubbID;
    try {
        const getUserData = await database.collection('Users').where("Email", "==", clubInfo.currentUserEmail).get()
        getUserData.forEach((doc)=>{
            clubsjoined = doc.data().ClubsJoined;
            userID = doc.id;
        })

        var clubID = clubsjoined.findIndex(clubs => clubs.Club === clubInfo.clubname)
        clubsjoined.splice(clubID, 1);
        await database.collection('Users').doc(userID).update({
            ClubsJoined : clubsjoined
        })

         const getClub = await database.collection('Clubs').where("ClubName", "==", clubInfo.clubname).get()
         getClub.forEach((doc)=>{
            clubMembers = doc.data().Members;
            clubInvites = doc.data().Invites;
            clubbID = doc.id;
        })

        const getUserIDInClubMembersArr = clubMembers.findIndex(member => member.email === clubInfo.currentUserEmail)
        const getUserIDInClubInvitesArr = clubInvites.findIndex(member => member.email === clubInfo.currentUserEmail)

        clubMembers.splice(getUserIDInClubMembersArr, 1);
        clubInvites.splice(getUserIDInClubInvitesArr, 1);

        await database.collection('Clubs').doc(clubbID).update({
            Members : clubMembers,
            Invites : clubInvites
        })
        res.send({status : 200, statusmessage : "success"})
    }
    catch(err){
        res.send({status : err.code, statusmessage : err.message, errorMessage : "Bad Request - I"})        
    }
})
