const express = require('express')
const router = express.Router()

const userQueries = require('../controllers/userQueries.js')
const clubQueries = require('../controllers/clubQueries.js')

router.post('/signup', userQueries.createUser);

router.post('/updateProfile', userQueries.UpdateUser);

router.post('/deleteUser', userQueries.DeleteUser);

router.post('/getCurrentUserData', userQueries.CurrentUserData)



router.post('/CreateClub', clubQueries.CreateClub);

module.exports = router; 