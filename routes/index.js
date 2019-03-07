const express = require('express')
const router = express.Router()

const userQueries = require('../controllers/userQueries.js')

router.post('/signup', userQueries.createUser);

router.post('/updateProfile', userQueries.UpdateUser);

router.post('/deleteUser', userQueries.DeleteUser);

router.post('/getCurrentUserData', userQueries.CurrentUserData)

module.exports = router; 