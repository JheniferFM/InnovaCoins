const firebaseConfig = {
  apiKey: "AIzaSyDdZu0ZlEYpSWgDVVJAPKO2kvbEv_xzDAs",
  authDomain: "innova-coins-a68b8.firebaseapp.com",
  projectId: "innova-coins-a68b8",
  storageBucket: "innova-coins-a68b8.firebasestorage.app",
  messagingSenderId: "494367459135",
  appId: "1:494367459135:web:e483690b553b4d67de758a",
  measurementId: "G-B1M50LQ9YC"
};

const firebaseConfigured = true;
if (firebaseConfigured && window.firebase) {
  firebase.initializeApp(firebaseConfig);
  window.firestoreDb = firebase.firestore();
  window.firebaseStorage = firebase.storage();
  window.firestoreDb.enablePersistence().catch(() => {});
}
