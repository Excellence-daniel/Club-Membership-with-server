import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as validator from 'validator';
import * as uuid from 'uuid';
import * as cors from 'cors';
import * as express from 'express';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});