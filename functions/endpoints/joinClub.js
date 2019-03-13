const uuidv4 = require('uuid/v4'); 
const validator = require('validator');
const admin = require('firebase-admin');
const database = admin.firestore();

exports.JoinClub = function (req, res) {
    const clubInfo = req.body;
    let clubID;
    let clubMembers;
    let clubMemberLimit;
    let userClubsJoined;
    let userID;
    let userData;
    let clubInvites;  
    let newClub;
    let clubQuery;
    let getUserQuery;
    let getClubQuery;
    database.collection('Clubs').where('ClubToken', '==', clubInfo.clubID).get()
    .then((snapshot) =>{
        clubQuery = snapshot;
        if (clubQuery.empty) {
            res.send({status : 400, statusmessage : 'The Club does not exist!', errorMessage  : 'Bad Request'});
        } else {
            try {
                database.collection('Users').where('Email', '==', clubInfo.userEmail).get()
                    .then((snapshot) => {
                        getUserQuery = snapshot;
                        if (!(getUserQuery.empty)) { 
                            database.collection('Clubs').where('ClubToken', '==', clubInfo.clubToken).get()
                            .then((snapshot) => {
                                getClubQuery = snapshot;
                                if (getClubQuery.empty) {
                                    console.log('Club does not exist');
                                    res.send({ status: 401, statusmessage: 'Club does not exist' });
                                } else {
                                    getClubQuery.forEach((doc) => {
                                        clubMembers = doc.data().Members;
                                        clubInvites = doc.data().Invites;
                                        clubMemberLimit = doc.data().MemberLimit;
                                        clubID = doc.id;
                                        newClub = { 'Club': doc.data().ClubName, 'Type': doc.data().ClubType, 'AdminEmail': doc.data().AdminEmail };
                                        console.log('CLUB ID', clubID);
                                    })
                                    //check if the user is alredy a member of the club. 
                                    var checkIfUserEmailExistsInClubMemberArr = clubMembers.filter(userCheck => (userCheck.email === clubInfo.userEmail));
                                    if (checkIfUserEmailExistsInClubMemberArr.length > 0) {
                                        console.log('You already belong to this club');
                                        res.send({ status: 401, statusmessage: 'You already belong to this club' });
                                    } else {
                                        //check if the member limit is reached
                                        if (clubMembers.length < clubMemberLimit) {      //if limit is not reached
                                            getUserQuery.forEach(snapshot => {
                                                userID = snapshot.id;   //get user id 
                                                userData = snapshot.data();  //get all userData
                                                console.log('SNAP USER', snapshot.data());
                                                console.log('SNAPSHOT', snapshot.id);
                                            })
                                            console.log('USER DATA', userData);
                                            userClubsJoined = userData.ClubsJoined;     //club joined array in the user data gottten
                                            userClubsJoined.push(newClub);      //add the new club array to the userclubsjoined array
                                            database.collection('Users').doc(userID).update({
                                                ClubsJoined: userClubsJoined       //update array
                                            })
                                            .then(() => {
                                                const newMember = { 'name': userData.Name, 'email': userData.Email };    //initialize new member
                                                clubMembers.push(newMember);    //append into the array clubMembers
                                                const inviteID = clubInvites.findIndex(invite => invite.email === clubInfo.userEmail);  //get the index of the invite in the club user email
                                                clubInvites[inviteID].accepted = true;      //change the boolean value to true
                                                //update Members and Invites
                                                console.log('JOINCLUB CLUBID', clubID);
                                                database.collection('Clubs').doc(clubID).update({
                                                    Members: clubMembers,
                                                    Invites: clubInvites
                                                })
                                                res.send({ status: 200, statusmessage: 'You have joined this club!' });
                                            })
                                            .catch((err)=>{
                                                res.send({ status: err.code, statusmessage: err.message });
                                                console.log(err.message);
                                            })
                                        } else {
                                            console.log('Club Limit Reached. You cannot join this club');
                                            res.send({ status: 401, statusmessage: 'Club Member Limit Reached. You cannot join this club.' });
                                        }
                                    }
                                }
                            })
                        } else {
                            res.send({status : 402 , statusmessage : 'Invited email does not have an account'});     //send 402 if user doesnt have an account with club membership app. 
                            console.log('User does not have an account with club membership');
                        }
                })
                .catch((err)=>{
                    res.send({status : err.code , statusmessage : err.message});     //send 402 if user doesnt have an account with club membership app. 
                    console.log(err.message);
                })
            }
            catch(err){
                res.send({status : 400 , statusmessage : err.message, errorMessage : 'Bad Request'});
                console.log(err.message);
            }
        }
    })
    .catch((err) => {
        res.send({status : 400 , statusmessage : err.message, errorMessage : 'Bad Request'});
        console.log(err.message);
    })
}