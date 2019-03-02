var express = require('express');
var uuidv4 = require('uuid/v4'); //for generating unique IDs for users
var admin = require("firebase-admin");
var firebase = require('firebase')
var config = {
    apiKey: "AIzaSyBmlRfFT3kXI2PrhP345AYsQFdeAYJL0po",
    authDomain: "club-membership-app.firebaseapp.com",
    databaseURL: "https://club-membership-app.firebaseio.com",
    projectId: "club-membership-app",
  };
firebase.initializeApp(config)

var serviceAccount = require("./club-membership-app-firebase-adminsdk-o25at-a9186c469e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://club-membership-app.firebaseio.com"
});
var database = admin.firestore()
var cors = require('cors')
var app = express();
var bodyParser = require('body-parser')
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(cors())
const port = 2000

app.listen(port, function () {
    console.log("Working on port 2000") //gets the server working     
})

app.post('/', async function(req, res){   //onload of all the pages 
    const userData = req.body;
    let verifiedEmail;
    if (userData.currentUserEmail !== undefined){
        const currUser = await admin.auth().getUserByEmail(userData.currentUserEmail)
        if (currUser){
            try {
                const getUser =  await database.collection('Users').where('Email', '==', userData.currentUserEmail).get()
                getUser.forEach((doc)=>{
                    verifiedEmail = doc.data().EmailVerified
                })
                if (verifiedEmail === true){
                    res.send({status : 200, UserPresent : true}) 
                } else {
                    console.log("User Email not defined in post /")
                    res.send({UserPresent : false, status : 401 , statusmessage :" User Email not Verified"}) 
                }
            }
            catch(err){
                console.log("hello err in post /", err)
                res.send({status : 400, statusmessage : err.message, UserPresent : false })
            }
        }
    } else {
        console.log("No User Logged In")
    }
})

//function that runs on login
app.post('/login', async(req, res)=>{  
    let verifiedEmail, currentUserData;
    const userData = req.body
        try {
            const signInQuery = await firebase.auth().signInWithEmailAndPassword(userData.email, userData.password);
            const user = await database.collection('Users').where('Email','==',userData.email).get()
            user.forEach((doc)=>{
                        verifiedEmail = doc.data().EmailVerified;
                        currentUserData = doc.data()
                    })        
            if (verifiedEmail === true){
                console.log("User Sign In Successful")
                res.send({status : 200 ,LoggedIn : true, statusText : "Succesful Login", userDetails : currentUserData})
            } else {
                console.log("User Login Successful but email is not verified")
                res.send({status : 200 ,LoggedIn : false, statusmessage : "Verify your email to login", userDetails : currentUserData})
            }
        }
        catch(err) {
            console.log("Error", err)
            res.send({status : 400, statusmessage : err.message, LoggedIn : false})
        }
    })

//function that runs on signUp
app.post('/signup', async (req, res)=>{   
    const data = req.body
    const UserUUID = uuidv4();
    console.log(UserUUID);
    if (data){
        try{
            admin.auth().createUser({
                email : data.email, 
                password : data.password
            })
            .then(async()=>{
                await database.collection('Users').doc().set({
                    Name : data.name, 
                    Email : data.email, 
                    EmailVerified : false, 
                    PhoneNumber : data.phone, 
                    Address : data.address, 
                    Password : data.password, 
                    ClubsJoined : [], 
                    UserID : UserUUID
                })
                console.log("User sign in successful"); 
                res.send({signInStatus : 'success'});
            })
            .catch(err=>{
                console.log("/signup ---", err.message)
            })
        } 
        catch(err) {
            console.log("Err-SignUp-1", err)
            res.send({signInStatus : 'failed', statusmessage : err.message})
        }
    }
})


app.post('/VerifyEmail', async(req,res)=>{
    const userInfo = req.body; 
    let userData, userID;
    try {
        const getUser = await database.collection('Users').where("Email", "==", userInfo.email).get()
        getUser.forEach((doc)=>{
            userData = doc.data()
            userID = doc.id
        })

        if (userData.EmailVerified !== true){
            await database.collection('Users').doc(userID).update({
                EmailVerified : true
            })
                res.send({status : 200, statusmessage : "success"})
        } else {
            res.send({status : 401 , statusmessage : "Email Verfieid Already"})
        }
    }
    catch(err){
        console.log(err.message)
        res.send({status : 400, statusmessage : err.message, errorMessage : "Bad Request"})
    }
})

//update user's profile.
app.post('/updateProfile', async (req, res)=>{
    const userData = req.body
    try{
        await database.collection('Users').doc(userData.userID).update({
            Name : userData.Name, 
            Email : userData.Email,
            Address : userData.Address,
            PhoneNumber : userData.Phone
        })
        res.send({status : 200, statusmessage : "Success"})
    }
    catch(err){
        res.send({status : 400, statusmessage : err.message , errorMessage : "Bad Request"})
    }
})


app.post('/deleteUser', async(req, res)=>{
    const userData = req.body
    try { 
        await database.collection('Users').doc(userData.userID).delete()
        res.send({status : 200, statusmessage : "Profile Deleted"})
    }
    catch(err){
        res.send({status : 200, statusmessage : err.message})
    }
})


//function that runs on click LOGOUT button
app.post('/logout', async (req , res)=>{
    try {
        await firebase.auth().signOut()
        res.send({LoggedOut : true, status : 200, statusmessage : "Success"})    
    }
    catch(err){
        res.send({LoggedOut : false, status : 400, statusmessage : "Bad Request", errorText : err})
    }
})


//to get the current user Data 
app.post('/getCurrentUserData', async(req, res)=>{
    const currentUserEmail = req.body.currentUserEmail
    const currentUserData = await admin.auth().getUserByEmail(currentUserEmail);     //get current user details 
    let userData , userID;   //initialize a varaible
    if (currentUserEmail !== undefined){
        try {
            if (currentUserData){
                const user = await database.collection('Users').where("Email", "==", currentUserEmail).get()   //get from collection USERS using email
                user.forEach((doc)=>{
                    userData = doc.data()
                    userID = doc.id
                })
                if (userData){
                    res.send({UserEmail : currentUserData.email, userData : userData, userID : userID})  //if data is gotten
                }else{
                    res.send({UserEmail : currentUserData.email, userData : null, userID : null, statusmessage : "no matching documents in firebase"})     //data is not gotten 
                }                        
            } else {
                console.log("No matching documents", "---/getCurrentUserData")    //data is not gotten
                res.send({UserEmail : null, userData : null, statusmessage : "no matching documents in firebase"})
            }
        console.log("Current User Email", currentUserData.email, "---/getCurrentUserData")
        }
        catch(err){
            console.log(err.message)
            res.send({UserEmail : null})
        }
    } else {
        console.log("No User Logged in --- /getCurrentUserData")
    }
})


app.post('/getClubsUsingCurrentUserData', async(req, res)=>{
    const currentUserEmail = req.body.currentUserEmail;
    const isUserPresentQuery = await admin.auth().getUserByEmail(currentUserEmail);
    let createdClubIds = [] , createdClubData = [],  joinedClubs = [];
    if (currentUserEmail !== undefined){
        try {
            if (isUserPresentQuery){
                const clubs = await database.collection('Clubs').where("AdminEmail", "==", currentUserEmail).get()
                clubs.forEach((doc)=>{
                    createdClubIds.push(doc.id)
                    createdClubData.push(doc.data())
                    console.log("CLUBS CREATED", "Gotten all clubs")
                })
    
                const getClubsJoinedofCurrentUser = await database.collection('Users').where("Email", "==", currentUserEmail).get()  
                getClubsJoinedofCurrentUser.forEach((doc)=>{
                    joinedClubs.push(doc.data().ClubsJoined)
                    console.log("CLUBS JOINED", doc.data().ClubsJoined)
                })
                res.send({status : 200, statusmessage : "Gotten all clubs with their IDs", clubIDs : createdClubIds, clubs : createdClubData, clubsjoined : joinedClubs})   
            }
        }
        catch(err){
            res.send({status : 400, statusmessage : "Bad Request I", clubID : [], clubs : [], clubsjoined : [[]]})
        }
    }
})


//this function runs on click of the button Create Club
app.post('/CreateClub', async (req, res) => { 
    const clubData = req.body;      //get request body
    try {
        if (clubData){ 
            const user = await admin.auth().getUserByEmail(clubData.email)      //get current User details
            if (user){
                const doesClubExistQuery = await database.collection('Clubs').where('ClubName','==',clubData.clubName).get()  //get data from Clubs using the given clubname
                if (doesClubExistQuery.empty === false){     //if the return value is not empty
                    res.send({status : 401, statusmessage : "Unauthorized request", errorMessage : "Club already exists."}) 
                } else {
                    //set database if club does not already exist
                    database.collection('Clubs').doc().set({
                        ClubName : clubData.clubName, 
                        ClubType : clubData.clubType, 
                        AdminEmail : clubData.email, 
                        MemberLimit : clubData.memberLimit, 
                        Members : [],
                        Invites : []
                    })
                    res.send({status : 200, statusmessage : "Club Created"})
                }
            }
        }
    }
    catch(err){
        res.send({status : 400, statusmessage : "Bad Request", errorMessage : err.message})   //if data is not gotten from the request body
    }
})

app.post('/EditClub', async (req, res)=>{
    const clubInfo = req.body;
    let clubdata;
    try {
        const club = await database.collection('Clubs').doc(clubInfo.clubID).get()
        clubdata = club.data()
        res.send({status : 200, statusmessage : "success", clubdata})
    }
    catch(err){
        res.send({status : err, statusmessage : err.message, errorMessage : "Bad Request"})
    }
})

app.post('/UpdateClub', async (req,res)=>{
    const clubInfo = req.body; 
    try {
        const updateClub = await database.collection('Clubs').doc(clubInfo.id).update({
            ClubName : clubInfo.clubname, 
            ClubType : clubInfo.clubtype, 
            MemberLimit : clubInfo.membersLimit
        })
        res.send({status : 200, statusmessage : "success"})
    }
    catch(err){
        res.send({status : err.code, statusmessage : err.message, errorMessage : "Bad Request"})
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

app.post('/joinClub', async(req, res)=>{
    await firebase.auth().signOut();
    const clubInfo = req.body;
    console.log(clubInfo)
    let clubID, clubMembers, clubMemberLimit, userClubsJoined, userID, userData, clubInvites;  
    const newClub = {"Club" : clubInfo.clubname, "Type" : clubInfo.clubtype}
    try {
        const getUser = await database.collection('Users').where("Email", "==", clubInfo.userEmail).get()
        const getClub = await database.collection('Clubs').where("ClubName", "==", clubInfo.clubname).get()

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
})

app.post('/deleteClub', async (req, res)=>{
    const clubInfo = req.body;
    console.log(clubInfo);
    try {
        const club = await database.collection('Clubs').doc(clubInfo.clubID).get()
        const clubMembers = club.data().Members
        if (clubMembers.length > 0){
            clubMembers.forEach(async(member)=>{
                var memberMail = member.email;
                var getUsersWithMail = await database.collection('Users').where('Email', "==", memberMail).get()
                getUsersWithMail.forEach(async(doc)=>{
                    var clubsjoined = doc.data().ClubsJoined    //clubs joined of each member 
                    var getClubIndex = clubsjoined.findIndex(idx => idx.Club === clubInfo.clubName)     //get the index of this club
                    clubsjoined.splice(getClubIndex,1)
                    await database.collection('Users').doc(doc.id).update({
                        ClubsJoined : clubsjoined
                    })
                })
            })
            await database.collection('Clubs').doc(clubInfo.clubID).delete()
            res.send({status : 200, statusmessage : "Club Deleted"})
        }else {
            await database.collection('Clubs').doc(clubInfo.clubID).delete()
            res.send({status : 200, statusmessage : "Club Deleted"})
        }
    }
    catch(err){
        res.send({status : err.code, statusmessage : err.message})
    }
    console.log(club.data().Members)
})

app.post('/getClubMembers', async (req, res)=>{
    const clubInfo = req.body; 
    let members;
    try {
        const clubMembers = await database.collection('Clubs').where("ClubName", "==", clubInfo.clubname).get()
        clubMembers.forEach((doc)=>{
            console.log(doc.data().Members)
            members = doc.data().Members;
        })
        res.send({status : 200, statusmessage : "success", clubMembers : members})
    }
    catch(err){
        console.log(err)
        res.send({status : 400, statusmessage : err.message, errorMessage : "Bad Request"})
    }
})


app.post('/InviteMembers', async (req, res)=>{
    var invites = req.body 
    const newInvite = {"email": invites.email, "accepted": false}
    try {
        const getClubWithDocID = await database.collection('Clubs').doc(invites.clubID).get()
        const clubInvites = getClubWithDocID.data().Invites
        const clubMemberLimit = getClubWithDocID.data().MemberLimit
        const clubMembers = getClubWithDocID.data().Members
        var clubMembersLength = clubMembers.length

        if (clubMembersLength < clubMemberLimit){
            clubInvites.push(newInvite)
            console.log ("Invites", clubInvites)
            await database.collection('Clubs').doc(invites.clubID).update({
                Invites : clubInvites
            })
            res.send({status : 200, statusmessage : "Success"})
        } else {
            res.send({status : 400, statusmessage : "Members Limit Reached"})
        }
    }
    catch(err){
        console.log(err)
        res.send({status : err.code, statusmessage : err.message, errorMessage : "Bad Request : 400"})
    }
})

// module.exports = app