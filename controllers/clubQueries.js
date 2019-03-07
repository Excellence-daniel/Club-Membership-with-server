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