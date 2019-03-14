import * as uuidv4 from 'uuid/v4';
// import * as validator from 'validator';
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