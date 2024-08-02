// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRtckGECYdhgZAGTKUpO60NT5NQAsnFd0",
  authDomain: "enigmatology-95018.firebaseapp.com",
  databaseURL: "https://enigmatology-95018-default-rtdb.firebaseio.com",
  projectId: "enigmatology-95018",
  storageBucket: "enigmatology-95018.appspot.com",
  messagingSenderId: "563230550022",
  appId: "1:563230550022:web:109ff2a5bb073f5f237b87",
  measurementId: "G-8PKK0H9346",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
showusername();

function showusername() {
  let auth = firebase.auth();
  let headdiv = document.getElementById("auth");
  auth.onAuthStateChanged(function (user) {
    if (user) {
      headdiv.innerHTML =
        '<div id="username"><button onclick="logout()" id="signout-button">Sign out ' +
        user.displayName +
        "</button></div>";
    } else {
      headdiv.innerHTML =
        '<a href="/accounts/login" id="sign-in-button">Sign in</a><a href="/accounts/register" id="register-button">Register</a>';
    }
  });
}

function logout() {
  let auth = firebase.auth();
  auth
    .signOut()
    .then(() => {
      window.location = "amctesseract.github.io";
    })
    .catch((error) => {
      console.log(error);
    });
}
