const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

const firebaseConfig = {
  apiKey: 'AIzaSyA1TT7TFz5wJvQJS0nblrEXCag79rzyM0Y',
  authDomain: 'we-sopt-spark.firebaseapp.com',
  projectId: 'we-sopt-spark',
  storageBucket: 'we-sopt-spark.appspot.com',
  messagingSenderId: '849294133156',
  appId: '1:849294133156:web:dc6dc49c19dfe0e6b02331',
  measurementId: 'G-PWLFVZQH06',
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

module.exports = { firebaseApp, firebaseAuth, firebaseConfig };
