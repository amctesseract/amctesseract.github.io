function toggledisplayflex(element) {
  if (element.classList.contains("hidden-flex")) {
    element.classList.remove("hidden-flex");
    element.classList.add("shown-flex");
  } else {
    element.classList.remove("shown-flex");
    element.classList.add("hidden-flex");
  }
}

function login() {
  let errorele = document.getElementById("error");

  let emailele = document.getElementById("email");
  let passwordele = document.getElementById("password");

  let email = emailele.value;
  let password = passwordele.value;

  let elements = [email, password];
  for (let i = 0; i < elements.length; i++) {
    if (elements[i] === "") {
      errorele.innerHTML =
        "One or more fields are empty. Please fill out all fields and try again.";
      return;
    }
  }

  if (!validateemail(email)) {
    errorele.innerHTML = "Invalid email. Please enter a different one.";
    return;
  }

  errorele.innerHTML = "";

  loginserver(email, password);
}

function validateemail(email) {
  let re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function loginserver(email, password) {
  let auth = firebase.auth();
  let database = firebase.database();
  let infodiv = document.getElementById("info");
  let errordiv = document.getElementById("error");
  let logindiv = document.getElementById("login-form");

  toggledisplayflex(logindiv);
  infodiv.innerHTML = "Logging in... please wait.";

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      let user = auth.currentUser;
      if (user != null) {
        if (!user.emailVerified) {
          errordiv.innerHTML =
            "The email address associated with your account has not been verified.";
          infodiv.innerHTML = "";
          document.getElementById("password").value = "";
          toggledisplayflex(logindiv);
          auth.signOut();
        } else {
          firebase.auth();
          window.location = "amctesseract.github.io";
        }
      }
    })
    .catch((error) => {
      let code = error.code;
      console.log(code);
      if (code === "auth/user-disabled") {
        errordiv.innerHTML = "The account you tried has been disabled.";
        infodiv.innerHTML = "";
        document.getElementById("password").value = "";
        toggledisplayflex(logindiv);
      } else if (code === "auth/user-not-found") {
        errordiv.innerHTML = "The account you tried does not exist.";
        infodiv.innerHTML = "";
        document.getElementById("password").value = "";
        toggledisplayflex(logindiv);
      } else if (code === "auth/wrong-password") {
        errordiv.innerHTML = "Incorrect password. Please try again.";
        infodiv.innerHTML = "";
        document.getElementById("password").value = "";
        toggledisplayflex(logindiv);
      } else {
        errordiv.innerHTML = "There was an error when logging you in.";
        infodiv.innerHTML = "";
      }
    });
}
