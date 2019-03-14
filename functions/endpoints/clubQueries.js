var uuidv4 = require('uuid/v4'); //for generating unique IDs for users
var validator = require('validator');
var admin = require('firebase-admin');
var database = admin.firestore();

exports.CreateClub = function (req, res) {
    const clubData = req.body;      //get request body
    const clubToken = uuidv4();
    try {
        database.collection('Clubs').doc().set({
            ClubName : clubData.clubName, 
            ClubType : clubData.clubType, 
            AdminEmail : clubData.email, 
            MemberLimit : clubData.memberLimit, 
            Members : [],
            Invites : [], 
            ClubToken : clubToken
        })
        .then(()=>{
            res.send({status : 200, statusmessage : 'Club Created'});            
        })
        .catch( err => {
            res.send({status : err.code, statusmessage : err.message});            
        })
    }
    catch(err){
        res.send({status : 400, statusmessage : 'Bad Request', errorMessage : err.message});   //if data is not gotten from the request body
    }
}


exports.EditClub = function (req, res){
    const clubInfo = req.body;
    let clubdata;
    try {
        database.collection('Clubs').doc(clubInfo.clubToken).get()
        .then((snapshot)=>{
            snapshot.forEach((club) => {
                clubdata = club.data();
            })
            res.send({status : 200, statusmessage : 'success', clubdata});
        })
        .catch((err)=>{
            res.send({status : err.code, statusmessage : err.message});            
        })
    }
    catch(err){
        res.send({status : err, statusmessage : err.message, errorMessage : 'Bad Request'});
    }
}


exports.UpdateClub = function (req, res){
    const clubInfo = req.body; 
    try {
        database.collection('Clubs').doc(clubInfo.id).update({
            ClubName : clubInfo.clubname, 
            ClubType : clubInfo.clubtype, 
            MemberLimit : clubInfo.membersLimit
        })
        .then(()=>{
            res.send({status : 200, statusmessage : 'success'});            
        })
        .catch((err)=>{
            res.send({status : err.code, statusmessage : err.message})
        })
    }
    catch(err){
        res.send({status : err.code, statusmessage : err.message, errorMessage : 'Bad Request'});
    }
}


exports.DeleteClub = function (req, res){
    const clubInfo = req.body;
    console.log(clubInfo);
    try {
        database.collection('Clubs').doc(clubInfo.clubID).get()
        .then((club)=>{
            const clubMembers = club.data().Members;
            if (clubMembers.length > 0){
                clubMembers.forEach((member)=>{
                    var memberMail = member.email;
                    database.collection('Users').where('Email', '==', memberMail).get()
                    .then((snapshot)=>{
                        snapshot.forEach((doc) => {
                            var clubsjoined = doc.data().ClubsJoined;    //clubs joined of each member 
                            var getClubIndex = clubsjoined.findIndex(idx => idx.Club === clubInfo.clubName);     //get the index of this club
                            clubsjoined.splice(getClubIndex,1);
                            database.collection('Users').doc(doc.id).update({
                                ClubsJoined : clubsjoined
                            })
                            .then(()=>{
                                database.collection('Clubs').doc(clubInfo.clubID).delete()
                                .then(()=>{
                                    res.send({status : 200, statusmessage : 'Club Deleted'});
                                })
                                .catch(()=>{
                                    res.send({ status: err.code, statusmessage: err.message });
                                })
                            })
                            .catch((err)=>{
                                res.send({ status: err.code, statusmessage: err.message });
                            })
                        })
                    })
                    .catch((err)=>{
                        res.send({ status: err.code, statusmessage: err.message });
                    })
                })    
            }else {
                database.collection('Clubs').doc(clubInfo.clubID).delete()
                .then(()=>{
                    res.send({ status: 200, statusmessage: 'Club Deleted' });
                })
                .catch((err)=>{
                    res.send({ status: err.code, statusmessage: err.message });
                })
                res.send({status : 200, statusmessage : 'Club Deleted'});
            }
        })
    }
    catch(err){
        res.send({status : err.code, statusmessage : err.message});
    }
    console.log(club.data().Members);
}


exports.GetClubsDataOfCurrentUser = function (req, res) {
    const currentUserEmail = req.body.currentUserEmail;
    let createdClubIds = []; 
    let createdClubData = [];  
    let joinedClubs = [];
    console.log(currentUserEmail, 'Email');
    try {
        database.collection('Users').where('Email', '==', currentUserEmail).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                joinedClubs.push(doc.data().ClubsJoined);
                console.log('CLUBS JOINED', doc.data().ClubsJoined);
            })
            database.collection('Clubs').where('AdminEmail', '==', currentUserEmail).get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    createdClubIds.push(doc.id);
                    createdClubData.push(doc.data());
                    console.log('CLUBS CREATED', 'Gotten all clubs');
                })
                res.send({ status: 200, statusmessage: 'Gotten all clubs with their IDs', clubIDs: createdClubIds, clubs: createdClubData, clubsjoined: joinedClubs });
            })
            .catch((err) => {
                console.log(err.message);
                res.send({status : err.code, statusmessage : err.message, clubID : [], clubs : [], clubsjoined : [[]]});
            })
        })
        .catch((err) => {
            console.log(err.message)
            res.send({status : err.code, statusmessage : err.message, clubID : [], clubs : [], clubsjoined : [[]]});
        })
    }  
    catch(err){
        console.log(err.message);
        res.send({status : 400, statusmessage : 'Bad Request', clubID : [], clubs : [], clubsjoined : [[]]});
    }
}