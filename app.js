var express = require('express');
var admin = require("firebase-admin");
var firebase = require('firebase')
var functions =  require("firebase-functions")
var config = {
    apiKey: "AIzaSyAFWlHfRZVyQcw-lj6chPHrhmNqJks4uGo",
    authDomain: "club-membership-190d2.firebaseapp.com",
    databaseURL: "https://club-membership-190d2.firebaseio.com",
    projectId: "club-membership-190d2",
  };
firebase.initializeApp(config)

var serviceAccount = require("./club-membership-190d2-firebase-adminsdk-rb4dz-f86b88ed73.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://club-membership-190d2.firebaseio.com"
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
    const user = await firebase.auth().currentUser
    console.log("USER","IsPresent")
    if (user !== null){
        res.send({UserPresent : true}) 
    }else {
        res.send({UserPresent : false}) 
    }
})

//function that runs on login
app.post('/login', function (req, res) {  
    // console.log(req.body)
    var email = req.body.email  //get email in the request body
    var password = req.body.password    //get password
    if (email === undefined || password === undefined){
        console.log("No Data")
        res.send({status : 400 , LoggedIn : false, statusText : "Wrong Data"})
    } else {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((data)=>{
            console.log("User Sign In Successful")
            res.send({status : 200 ,LoggedIn : true, statusText : "Succesful Login", userDetails : data})
        })
        .catch((err)=>{
            console.log("Error :", err.code, err.message)
            res.send({LoggedIn : false})
        })
    }
})

//function that runs on signUp
app.post('/signup', function(req, res){    
    // console.log(req.body)
    const data = req.body
    if (data){
        firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
        .then(()=>{
            database.collection('Users').doc().set({
                Name : data.name, 
                Email : data.email, 
                EmailVerified : false, 
                PhoneNumber : data.phone, 
                Address : data.address, 
                Password : data.password, 
                ClubJoined : []
            }).then(()=>{
                console.log("User sign in successful")
                res.send({signInStatus : 'success'})
            }).catch(err=>{
                console.log("Err-SignUp-1", err)
            res.send({signInStatus : 'failed'})
            })
        }).catch((err)=>{
            console.log("Err-SignUp-2", err)
            res.send({signInStatus : 'failed'})
        })
    }
})


//function that runs on click LOGOUT button
app.post('/logout', function(req , res){
    firebase.auth().signOut()
    .then(()=>{
        res.send({LoggedOut : true, status : 200, statusmessage : "Success"})
    })
    .catch(err=>{
        res.send({LoggedOut : false, status : 400, statusmessage : "Bad Request", errorText : err})
    })
})


//to get the current user Data 
app.post('/getCurrentUserData', async function(req, res){
    const currentUserData = await firebase.auth().currentUser     //get current user details 
    let userData , userID;   //initialize a varaible
    if (currentUserData){
        const user = await database.collection('Users').where("Email", "==", currentUserData.email).get()   //get from collection USERS using email
                .then((snapshot)=>{
                    if(snapshot){
                        snapshot.forEach((doc)=>{
                            userData = doc.data()
                            userID = doc.id
                        })
                        if (userData){
                            res.send({UserEmail : currentUserData.email, userData : userData, userID : userID})  //if data is gotten
                        }else{
                            res.send({UserEmail : currentUserData.email, userData : null, userID : null, statusmessage : "no matching documents in firebase"})     //data is not gotten 
                        }                        
                    }else {
                        console.log("No matching documents")    //data is not gotten
                        res.send({UserEmail : null, userData : null, statusmessage : "no matching documents in firebase"})
                    }
                })
                .catch((err)=>{ console.log(err) })     //catch errors
    }else {
        res.send({UserEmail : null})
    }
    console.log("Current User EMail", currentUserData.email)
})


app.post('/getClubsUsingCurrentUserData', async(req, res)=>{
    const currentUserData = firebase.auth().currentUser;
    let clubIds = [];
    let clubData = []
    if (currentUserData){
        const clubs = await database.collection('Clubs').where("AdminEmail", "==", currentUserData.email).get()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                clubIds.push(doc.id)
                clubData.push(doc.data())
                console.log("CLUBS CREATED", "Gotten all clubs")
            })
            res.send({status : 200, statusmessage : "Gotten all clubs with their IDs", clubIDs : clubIds, clubs : clubData})
        })
        .catch((err)=>{
            res.send({status : 400, statusmessage : "Bad Request", clubID : [], clubs : []})
        })
    }
})

//this function runs on click of the button Create Club
app.post('/CreateClub', async function(req, res){ 
    const clubData = req.body;      //get request body
    if (clubData){ 
        const user = firebase.auth().currentUser        //get current User details
        if (user){
            const doesClubExist = await database.collection('Clubs').where('ClubName','==',clubData.clubName).get()  //get data from Clubs using the given clubname
            if (doesClubExist.empty === false){     //if the return value is not empty
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
                .then((resp)=>{
                    console.log("Create Club Response", resp)
                    res.send({status : 200, statusmessage : "Club Created"})
                })
                .catch((err)=>{
                    console.log("Create Club Error", err)
                    res.send({status : 400, statusmessage : "Bad Request", errorMessage : err})
                })
                }
        } else {
            res.send({status : 401, statusmessage : "Unauthorized request", errorMessage : "No user is logged in"})   //if user is not present 
        }
    } else {
        res.send({status : 400, statusmessage : "Bad Request", errorMessage : "No data in request body"})   //if data is not gotten from the request body
    }
})

app.post('/EditClub', async (req, res)=>{
    const clubInfo = req.body;
    const club = await database.collection('Clubs').doc(clubInfo.clubID).get()
    .then((club)=>{
        res.send({status : 200, statusmessage : "success", clubdata : club.data()})
    })
    .catch((err)=>{
        res.send({status : err, statusmessage : err.message, errorMessage : "Bad Request"})
    })
})

app.post('/UpdateClub', async (req,res)=>{
    const clubInfo = req.body; 
    const updateClub = await database.collection('Clubs').doc(clubInfo.id).update({
        ClubName : clubInfo.clubname, 
        ClubType : clubInfo.clubtype, 
        MemberLimit : clubInfo.membersLimit
    })
    .then((data)=> {
        res.send({status : 200, statusmessage : "success"})
    })
    .catch(err=>{
        res.send({status : err.code, statusmessage : err.message, errorMessage : "Bad Request"})
    })
})

app.post('/deleteClub', async (req, res)=>{
    const clubInfo = req.body;
    console.log(clubInfo);
    const club = await database.collection('Clubs').doc(clubInfo.clubID).get()
    const clubMembers = club.data().Members
    if (clubMembers.length > 0){
        clubMembers.forEach( async (member)=>{
            var memberMail = member.email;
            var getUsersWithMail = await database.collection('Users').where('Email', "==", memberMail).get()
            .then(async (snapshot)=>{
                snapshot.forEach( async (doc)=>{
                    var clubsjoined = doc.data().ClubsJoined    //clubs joined of each member 
                    var getClubIndex = clubsjoined.findIndex(idx => idx.Club === clubInfo.clubName)     //get the index of this club
                    clubsjoined.splice(getClubIndex,1)
                    await database.collection('Users').doc(doc.id).update({
                        ClubsJoined : clubsjoined
                    })
                })
                await database.collection('Clubs').doc(clubInfo.clubID).delete()
                .then(()=>{
                    res.send({status : 200, statusmessage : "Club Deleted"})
                })
                .catch(err => {
                    res.send({status : err.code, statusmessage : err.message})
                })
            })
            .catch((err)=>{
                console.log(err)
                res.send({status : err.code, statusmessage : err.message})
            })
        })
    }else {
        await database.collection('Clubs').doc(clubInfo.clubID).delete()
        .then(()=>{
            res.send({status : 200, statusmessage : "Club Deleted"})
        })
        .catch(err => {
            res.send({status : err.code, statusmessage : err.message})
        })
    }

    console.log(club.data().Members)
})

app.post('/updateProfile', async (req, res)=>{
    const userData = req.body
    await database.collection('Users').doc(userData.userID).update({
        Name : userData.Name, 
        Email : userData.Email,
        Address : userData.Address,
        Phone : userData.Phone
    })
    .then(()=>{
        res.send({status : 200, statusmessage : "Success"})
    })
    .catch((err)=>{
        res.send({status : 400, statusmessage : err.message , errorMessage : "Bad Request"})
    })
})


app.post('/InviteMembers', async (req, res)=>{
    var invites = req.body 
    const newInvite = {"email": invites.email, "accepted": false}
    const getClubWithDocID = await database.collection('Clubs').doc(invites.clubID).get()
    const clubInvites = await getClubWithDocID.data().Invites
    const clubMemberLimit = await getClubWithDocID.data().MemberLimit
    const clubMembers = await getClubWithDocID.data().Members
    var clubMembersLength = clubMembers.length

    if (clubMembersLength < clubMemberLimit){
        clubInvites.push(newInvite)
        console.log ("Invites", clubInvites)
        await database.collection('Clubs').doc(invites.clubID).update({
            Invites : clubInvites
        })
        .then((data)=>{
            console.log("Update Status", data)
            res.send({status : 200, statusmessage : "Success"})
        })
        .catch((err)=>{
            console.log("Update Error", err)
            res.send({status : err.coode, statusmessage : err.message, errorMessage : "Bad Request : 400"})
        })
    } else {
        res.send({status : 401, statusmessage : "Members Limit reached", errorMessage : "Unauthorized request"})
    }
})


// module.exports = app