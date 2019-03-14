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


exports.InviteMembers = async function (req, res){
    var invites = req.body; 
    const validateEmail = validator.isEmail(invites.email);
    console.log(validateEmail, 'ValidateEmail');
    if (validateEmail){
        const newInvite = {'email': invites.email, 'accepted': false};
        try {
            database.collection('Clubs').doc(invites.clubID).get()
            .then((getClubWithDocID)=>{
                const clubInvites = getClubWithDocID.data().Invites;
                const clubMemberLimit = getClubWithDocID.data().MemberLimit;
                const clubMembers = getClubWithDocID.data().Members;
                var clubMembersLength = clubMembers.length;

                if (clubMembersLength < clubMemberLimit){
                    clubInvites.push(newInvite);
                    console.log ('Invites', clubInvites);
                    database.collection('Clubs').doc(invites.clubID).update({
                        Invites : clubInvites
                    })
                    .then(()=>{
                        res.send({status : 200, statusmessage : 'Success'});                        
                    })
                    .catch((err)=>{
                        res.send({status : err.code, statusmessage : err.message})
                    })
                } else {
                    res.send({status : 400, statusmessage : 'Members Limit Reached'});
                }                
            })
            .catch((err)=>{
                res.send({ status: err.code, statusmessage: err.message });
            })
        }
        catch(err){
            console.log(err);
            res.send({status : err.code, statusmessage : err.message, errorMessage : 'Bad Request : 400'});
        }
    } else {
        res.send({status : 400, statusmessage : 'Email Invalid'})
    }
}


exports.GetClubDataByID = function (req, res){
    const clubToken = req.body.clubToken;
    let clubData, dClubID;
    try {
        database.collection('Clubs').where('ClubToken', '==', clubToken).get()
        .then((getClubQuery)=>{
            getClubQuery.forEach((doc) => {
                console.log(doc.data());
                clubData = doc.data();
                dClubID = doc.id;
            })
            res.send({ status: 200, ClubData: clubData, ClubID: dClubID });
        })
        .catch((err)=>{
            console.log(err.message);
            res.send({status : err.code, statusmessage : err.message, ClubData : [], ClubID : []});
        })
    }
    catch(err) {
        res.send({status : 400, errorMessage : 'Bad Request', statusmessage : err.message, ClubData : [], ClubID : []});
    }
}


exports.LeaveClub = async function (req, res){
    const clubInfo = req.body;
    let clubsjoined, userID, clubMembers, clubInvites, clubbID;
    try {
        const getUserData = await database.collection('Users').where('Email', '==', clubInfo.currentUserEmail).get();
        getUserData.forEach((doc)=>{
            clubsjoined = doc.data().ClubsJoined;
            userID = doc.id;
        })

        var clubID = clubsjoined.findIndex(clubs => clubs.Club === clubInfo.clubname);
        clubsjoined.splice(clubID, 1);
        await database.collection('Users').doc(userID).update({
            ClubsJoined : clubsjoined
        });

         const getClub = await database.collection('Clubs').where('ClubName', '==', clubInfo.clubname).get()
         getClub.forEach((doc)=>{
            clubMembers = doc.data().Members;
            clubInvites = doc.data().Invites;
            clubbID = doc.id;
        })

        const getUserIDInClubMembersArr = clubMembers.findIndex(member => member.email === clubInfo.currentUserEmail);
        const getUserIDInClubInvitesArr = clubInvites.findIndex(member => member.email === clubInfo.currentUserEmail);

        clubMembers.splice(getUserIDInClubMembersArr, 1);
        clubInvites.splice(getUserIDInClubInvitesArr, 1);

        await database.collection('Clubs').doc(clubbID).update({
            Members : clubMembers,
            Invites : clubInvites
        })
        res.send({status : 200, statusmessage : 'success'});
    }
    catch(err){
        res.send({status : err.code, statusmessage : err.message, errorMessage : 'Bad Request - I'});       
    }
}