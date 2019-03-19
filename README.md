# Club-Membership-with-server

A club membership app that runs on an express server and on a cloud function 

1. A user can sign up and an account is created with email and password on firestore. Before the account is created, the following is checked:
    i. Email is valid 
    ii. Password length is greater than 9
    iii. Password contains a number 
    iv. Password contains a special characters

2. A user can also edit and update his profile. He can also delete his profile. To do this, the frontend sends a current user ID token to the back end and is verified. If true, operations are performed else an error message is alerted. 

3. A user can create clubs. 

4. A user can invite members to a club using an email. The email is validated and the existence of the club is confirmed.

5. A user can remove a user from clubs created, only if he is an admin. 

6. A user can edit, update and delete a club. 

Before a member can join a club, he has to have an account created. If he declines opening an account, the tab is closed. After he creates an account, he can now join the club. 

7. A member of a club can leave the club. 

8. A member of a club can also perform operations of a user. 
