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