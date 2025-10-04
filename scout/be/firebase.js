//  npm install firebase // first

// firebase.js

const firebase = require('firebase');
const firebaseConfig = {
    apiKey: '<API_KEY>',
    authDomain: '<AUTH_DOMAIN>',
    databaseURL: '<DATABASE_URL>',
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

module.exports = db;