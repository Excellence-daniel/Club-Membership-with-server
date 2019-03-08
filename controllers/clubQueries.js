var uuidv4 = require('uuid/v4'); //for generating unique IDs for users
var validator = require('validator');
var admin = require("firebase-admin");
var database = admin.firestore();

exports.CreateClub = function (req, res) {
    const clubData = req.body;      //get request body
    const clubID = uuidv4();
    try {
        database.collection('Clubs').doc().set({
            ClubName : clubData.clubName, 
            ClubType : clubData.clubType, 
            AdminEmail : clubData.email, 
            MemberLimit : clubData.memberLimit, 
            Members : [],
            Invites : [], 
            ClubID : clubID
        });
        res.send({status : 200, statusmessage : "Club Created"});
    }
    catch(err){
        res.send({status : 400, statusmessage : "Bad Request", errorMessage : err.message});   //if data is not gotten from the request body
    }
}

exports.AddMembersToClub = async function (req, res) {
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
}


exports.GetClubsDataOfCurrentUser = async function (req, res) {
    const currentUserEmail = req.body.currentUserEmail;
    let createdClubIds = []; 
    let createdClubData = [];  
    let joinedClubs = [];
    console.log(currentUserEmail, "Email")
    const isUserPresentQuery = await database.collection('Users').where('Email', '==', currentUserEmail).get();
    try {
        isUserPresentQuery.forEach((doc) => {
            joinedClubs.push(doc.data().ClubsJoined);
            console.log("CLUBS JOINED", doc.data().ClubsJoined);
        })

        const clubs = await database.collection('Clubs').where("AdminEmail", "==", currentUserEmail).get();
        clubs.forEach((doc) => {
            createdClubIds.push(doc.id);
            createdClubData.push(doc.data());
            console.log("CLUBS CREATED", "Gotten all clubs");
        })
        res.send({status : 200, statusmessage : "Gotten all clubs with their IDs", clubIDs : createdClubIds, clubs : createdClubData, clubsjoined : joinedClubs})   
    }
    catch(err){
        res.send({status : 400, statusmessage : "Bad Request", clubID : [], clubs : [], clubsjoined : [[]]})
    }
}

exports.GetClubDataByID = async function (req, res){
    const clubID = req.body.clubID
    let clubData, dClubID;
    database.collection('Clubs').where("ClubID", "==", clubID).get()
    .then((snapshot)=>{
        snapshot.forEach((doc)=>{
            clubData = doc.data()
            dClubID = doc.id
        })
        res.send({status : 200, ClubData : clubData, ClubID : dClubID})
    })
    .catch(err=>{
        res.send({status : 400, errorMessage : "Bad Request", statusmessage : err.message, ClubData : [], ClubID : []})
    })
}