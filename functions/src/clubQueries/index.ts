import * as uuidv4 from 'uuid/v4';
import * as validator from 'validator';
import * as admin from 'firebase-admin';
const database = admin.firestore();

export const CreateClub = function (req, res) {
    const clubData = req.body;      //get request body
    const clubToken = uuidv4();
    try {
        database.collection('Clubs').doc().set({
            ClubName: clubData.clubName,
            ClubType: clubData.clubType,
            AdminEmail: clubData.email,
            MemberLimit: clubData.memberLimit,
            Members: [],
            Invites: [],
            ClubToken: clubToken
        })
            .then(() => {
                res.send({ status: 200, statusmessage: 'Club Created' });
            })
            .catch(err => {
                res.send({ status: err.code, statusmessage: err.message });
            })
    }
    catch (err) {
        res.send({ status: 400, statusmessage: 'Bad Request', errorMessage: err.message });   //if data is not gotten from the request body
    }
}

export const EditClub = async function (req, res){
    const clubInfo = req.body;
    let clubdata;
    try {
        const club = await database.collection('Clubs').doc(clubInfo.clubID).get();
        clubdata = club.data();
        res.send({status : 200, statusmessage : 'success', clubdata});
    }
    catch(err){
        res.send({status : err, statusmessage : err.message, errorMessage : 'Bad Request'});
    }
}


export const UpdateClub = async function (req, res){
    const clubInfo = req.body; 
    try {
        await database.collection('Clubs').doc(clubInfo.id).update({
            ClubName : clubInfo.clubname, 
            ClubType : clubInfo.clubtype, 
            MemberLimit : clubInfo.membersLimit
        });
        res.send({status : 200, statusmessage : 'success'});
    }
    catch(err){
        res.send({status : err.code, statusmessage : err.message, errorMessage : 'Bad Request'});
    }
}


export const DeleteClub = async function (req, res) {
    const clubInfo = req.body;
    let club;
    console.log(clubInfo);
    try {
        club = await database.collection('Clubs').doc(clubInfo.clubID).get();
        const clubMembers = club.data().Members;
        if (clubMembers.length > 0) {
            clubMembers.forEach(async (member) => {
                var memberMail = member.email;
                var getUsersWithMail = await database.collection('Users').where('Email', '==', memberMail).get();
                getUsersWithMail.forEach(async (doc) => {
                    var clubsjoined = doc.data().ClubsJoined;    //clubs joined of each member 
                    var getClubIndex = clubsjoined.findIndex(idx => idx.Club === clubInfo.clubName);     //get the index of this club
                    clubsjoined.splice(getClubIndex, 1);
                    await database.collection('Users').doc(doc.id).update({
                        ClubsJoined: clubsjoined
                    });
                });
            });
            await database.collection('Clubs').doc(clubInfo.clubID).delete();
            res.send({ status: 200, statusmessage: 'Club Deleted' });
        } else {
            await database.collection('Clubs').doc(clubInfo.clubID).delete();
            res.send({ status: 200, statusmessage: 'Club Deleted' });
        }
    }
    catch (err) {
        res.send({ status: err.code, statusmessage: err.message });
    }
    console.log(club.data().Members);
}


export const GetClubsDataOfCurrentUser = async function (req, res) {
    const currentUserEmail = req.body.currentUserEmail;
    let createdClubIds = []; 
    let createdClubData = [];  
    let joinedClubs = [];
    console.log(currentUserEmail, 'Email');
    const isUserPresentQuery = await database.collection('Users').where('Email', '==', currentUserEmail).get();
    try {
        isUserPresentQuery.forEach((doc) => {
            joinedClubs.push(doc.data().ClubsJoined);
            console.log('CLUBS JOINED', doc.data().ClubsJoined);
        })

        const clubs = await database.collection('Clubs').where('AdminEmail', '==', currentUserEmail).get();
        clubs.forEach((doc) => {
            createdClubIds.push(doc.id);
            createdClubData.push(doc.data());
            console.log('CLUBS CREATED', 'Gotten all clubs');
        })
        res.send({status : 200, statusmessage : 'Gotten all clubs with their IDs', clubIDs : createdClubIds, clubs : createdClubData, clubsjoined : joinedClubs});  
    }
    catch(err){
        res.send({status : 400, statusmessage : 'Bad Request', clubID : [], clubs : [], clubsjoined : [[]]});
    }
}


export const InviteMembers = async function (req, res){
    var invites = req.body; 
    const validateEmail = validator.isEmail(invites.email);
    console.log(validateEmail, 'ValidateEmail');
    if (validateEmail){
        const newInvite = {'email': invites.email, 'accepted': false};
        try {
            const getClubWithDocID = await database.collection('Clubs').doc(invites.clubID).get();
            const clubInvites = getClubWithDocID.data().Invites;
            const clubMemberLimit = getClubWithDocID.data().MemberLimit;
            const clubMembers = getClubWithDocID.data().Members;
            var clubMembersLength = clubMembers.length;

            if (clubMembersLength < clubMemberLimit){
                clubInvites.push(newInvite);
                console.log ('Invites', clubInvites);
                await database.collection('Clubs').doc(invites.clubID).update({
                    Invites : clubInvites
                })
                res.send({status : 200, statusmessage : 'Success'});
            } else {
                res.send({status : 400, statusmessage : 'Members Limit Reached'});
            }
        }
        catch(err){
            console.log(err);
            res.send({status : err.code, statusmessage : err.message, errorMessage : 'Bad Request : 400'});
        }
    } else {
        res.send({status : 400, statusmessage : 'Email Invalid'})
    }
}