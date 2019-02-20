var express = require('express');
var admin = require("firebase-admin");
var firebase = require('firebase')
var functions =  require("firebase-functions")
var config = {
    apiKey: "AIzaSyAFWlHfRZVyQcw-lj6chPHrhmNqJks4uGo",
    authDomain: "club-membership-190d2.firebaseapp.com",
    databaseURL: "https://club-membership-190d2.firebaseio.com",
    projectId: "club-membership-190d2",
  };
firebase.initializeApp(config)
// var database = firebase.firestore()

var serviceAccount = require("./club-membership-190d2-firebase-adminsdk-rb4dz-f86b88ed73.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://club-membership-190d2.firebaseio.com"
});
var database = admin.firestore()
var cors = require('cors')
var app = express();
var bodyParser = require('body-parser')
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(cors())
const port = 2000

app.listen(port, function () {
    console.log("Working on port 2000") //gets the server working     
})

app.post('/', function(req, res){   //onload of all the pages 
    const user = firebase.auth().currentUser
    console.log("USER", user)
    if (user !== null){
        res.send({UserPresent : true}) 
    }else {
        res.send({UserPresent : false}) 
    }
})

app.post('/login', function (req, res) {    //for login
    console.log(req.body)
    var email = req.body.email
    var password = req.body.password
    if (email === undefined || password === undefined){
        console.log("No Data")
        res.send({status : 400 , LoggedIn : false, statusText : "Wrong Data"})
    } else {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((data)=>{
            console.log("User Sign In Successful")
            res.send({status : 200 ,LoggedIn : true, statusText : "Succesful Login", userDetails : data})
        })
        .catch((err)=>{
            console.log("Error :", err.code, err.message)
            res.send({LoggedIn : false})
        })
    }
})

app.post('/signup', function(req, res){     //for sign up
    console.log(req.body)
    const data = req.body
    if (data){
        firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
        .then(()=>{
            database.collection('Users').doc(data.name).set({
                Name : data.name, 
                Email : data.email, 
                EmailVerified : false, 
                PhoneNumber : data.phone, 
                Address : data.address, 
                Password : data.password, 
                ClubJoined : []
            }).then(()=>{
                console.log("User sign in successful")
                res.send({signInStatus : 'success'})
            }).catch(err=>{
                console.log("Err-SignUp-1", err)
            res.send({signInStatus : 'failed'})
            })
        }).catch((err)=>{
            console.log("Err-SignUp-2", err)
            res.send({signInStatus : 'failed'})
        })
    }
})

app.post('/logout', function(req , res){
    firebase.auth().signOut()
    .then(()=>{
        res.send({LoggedOut : true, status : 200, statusmessage : "Success"})
    })
    .catch(err=>{
        res.send({LoggedOut : false, status : 400, statusmessage : "Bad Request", errorText : err})
    })
})

// module.exports = app