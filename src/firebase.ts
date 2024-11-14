import firebase from 'firebase/compat/app'
import 'firebase/compat/database'

let config = {
  apiKey: "AIzaSyBNi_9Q0v7B8c8XngoY2CMjJzOKm5q2qv8",
  authDomain: "trifbarpos.firebaseapp.com",
  databaseURL: "https://trifbarpos-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "trifbarpos",
  storageBucket: "trifbarpos.appspot.com",
  messagingSenderId: "705453968012",
  appId: "1:705453968012:web:cffd4a26a26ff4c49389a9",
  measurementId: "G-K8YLXNS6DF"
};

firebase.initializeApp(config);

export default firebase.database();