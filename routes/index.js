const express = require('express');
const router = express.Router();

const userQueries = require('../controllers/userQueries.js');
const clubQueries = require('../controllers/clubQueries.js');

router.post('/updateProfile', userQueries.UpdateUser);

router.post('/deleteUser', userQueries.DeleteUser);

router.post('/getCurrentUserData', userQueries.CurrentUserData);



router.post('/CreateClub', clubQueries.CreateClub);

router.post('/getClubsUsingCurrentUserData', clubQueries.GetClubsDataOfCurrentUser);

router.post('/getClubByClubID', clubQueries.GetClubDataByID);

router.post('/EditClub', clubQueries.EditClub);
 
router.post('/UpdateClub', clubQueries.UpdateClub);

router.post('/deleteClub', clubQueries.DeleteClub);

router.post('/InviteMembers', clubQueries.InviteMembers); 

router.post('/leaveClub', clubQueries.LeaveClub);

https://us-central1-club-membership-87748.cloudfunctons.net/helloWorld/l

router.post('/deleteClubMember', clubQueries.DeleteMember);

const apiFunctions = functions.https.onRequest(router);

module.exports = apiFunctions; 