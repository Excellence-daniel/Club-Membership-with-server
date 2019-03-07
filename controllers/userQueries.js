var uuidv4 = require('uuid/v4'); //for generating unique IDs for users
var validator = require('validator');
var admin = require("firebase-admin");
var database = admin.firestore();

exports.createUser = async function(req, res){
    const data = req.body
    var numbers = /\d+/;
    var specialchars = /[ !@#$%^&*()`_+\-=\[\]{};':"\\|,.<>\/?]/; 
    const isEmail = validator.isEmail(data.email)
    const UserUUID = uuidv4();
    console.log(UserUUID);
    //check if the email data sent is an actual email
    if (data.password.length > 9 && numbers.test(data.password) === true && specialchars.test(data.password) === true){
        if (isEmail === true){
            //check if a user with the email exists
            var checkIfUserExists = await database.collection('Users').where("Email", "==", data.email).get()
            console.log(checkIfUserExists.empty)
            if (checkIfUserExists.empty === true){
                admin.auth().createUser({
                    email : data.email, 
                    password : data.password
                })
                .then(()=>{
                    database.collection('Users').doc().set({
                        Name : data.name, 
                        Email : data.email, 
                        EmailVerified : false, 
                        PhoneNumber : data.phone, 
                        Address : data.address, 
                        Password : data.password, 
                        ClubsJoined : [], 
                        UserID : UserUUID
                    })
                    console.log("User sign in successful"); 
                    res.send({signInStatus : 'success'});
                })
                .catch(err=>{
                    console.log("/signup ---", err.message)
                })
            } else {
                res.send({status : 401, statusmessage : "A User with this Email already exists. Please use another email to register."})
            }
        } else {
            res.send({status : 400, statusmessage : "Email not in the right format"})
        }
    } else {
        res.send({status : 400 , statusmessage : "Password is not strong.!"})
    }
}

exports.UpdateUser = async function (req, res) {
    const userData = req.body
    try{
        await database.collection('Users').doc(userData.userID).update({
            Name : userData.Name, 
            Email : userData.Email,
            Address : userData.Address,
            PhoneNumber : userData.Phone
        })
        res.send({status : 200, statusmessage : "Success"})
    }
    catch(err){
        res.send({status : 400, statusmessage : err.message , errorMessage : "Bad Request"})
    }
}


exports.DeleteUser = async function (req, res) {
    const userData = req.body
    try { 
        await database.collection('Users').doc(userData.userID).delete()
        res.send({status : 200, statusmessage : "Profile Deleted"})
    }
    catch(err){
        res.send({status : 200, statusmessage : err.message})
    }
}

exports.CurrentUserData = async function (req, res) {
    let userData; 
    let userID; 
    const data = req.body;
    const userEmail = data.userEmail; 
    console.log("User Email", userEmail);  
    try {
        database.collection('Users').where("Email", "==", userEmail).get()   //get from collection USERS using email
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                console.log("data",doc, doc.data())
                userData = doc.data()
                userID = doc.id
            })

            if (userData){
                res.send({status : 200, UserEmail : userEmail, userData : userData, userID : userID})  //if data is gotten
            }else{
                res.send({status : 400, UserEmail : userEmail, userData : null, userID : null, statusmessage : "no matching documents in firebase"})     //data is not gotten 
            } 
        })
        console.log("Current User Email", userEmail, "---/getCurrentUserData")
    }
    catch(err){
        console.log(err.message)
        res.send({status : 400, UserEmail : null})
    }
} 