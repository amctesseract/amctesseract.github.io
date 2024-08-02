function toggledisplayflex(element) {
  if (element.classList.contains("hidden-flex")) {
    element.classList.remove("hidden-flex");
    element.classList.add("shown-flex");
  } else {
    element.classList.remove("shown-flex");
    element.classList.add("hidden-flex");
  }
}

function register() {
  let errorele = document.getElementById("error");

  let emailele = document.getElementById("email");
  let usernameele = document.getElementById("username");
  let passwordele = document.getElementById("password");
  let confirmpassele = document.getElementById("confirm-password");

  let email = emailele.value;
  let username = usernameele.value;
  let password = passwordele.value;
  let confirmpass = confirmpassele.value;

  let elements = [email, username, password, confirmpass];
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

  if (password != confirmpass) {
    errorele.innerHTML = "Your passwords do not match. Please try again.";
    return;
  }

  errorele.innerHTML = "";

  createaccount(email, password, username);
}

function validateemail(email) {
  let re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function createaccount(email, password, username) {
  let auth = firebase.auth();
  let database = firebase.database();

  let infodiv = document.getElementById("info");
  let logindiv = document.getElementById("login-form");
  let errordiv = document.getElementById("error");

  toggledisplayflex(logindiv);
  infodiv.innerHTML = "Creating account... please wait.";

  auth
    .createUserWithEmailAndPassword(email, password)
    .then(function () {
      auth.signOut();
      let user = auth.currentUser;
      user
        .updateProfile({
          displayName: username,
        })
        .then(function () {
          infodiv.innerHTML = "Sending email verification... please wait.";
          user
            .sendEmailVerification()
            .then(function () {
              infodiv.innerHTML =
                "Verification email successfully sent. Please check your email to activate your account before signing in.";

              database.ref("users/" + user.uid).set({
                amcs: {},
                aimes: {},
              });
            })
            .catch(function (error) {
              let code = error.code;
              errordiv.innerHTML =
                "There was an error when sending the verification email. Error code: " +
                code;
            });
        })
        .catch(function (error) {
          let code = error.code;
          errordiv.innerHTML =
            "There was an error when creating the account. Error code: " + code;
        });
    })
    .catch(function (error) {
      let code = error.code;
      if (code === "auth/email-already-in-use") {
        errordiv.innerHTML =
          "The email you tried already has an account associated with it.";
        infodiv.innerHTML = "";
        toggledisplayflex(logindiv);
      } else if (code === "auth/weak-password") {
        errordiv.innerHTML =
          "The password you tried was too weak. Please try again with a stronger password.";
        infodiv.innerHTML = "";
        toggledisplayflex(logindiv);
      } else if (code === "auth/invalid-email") {
        errordiv.innerHTML = "The email you tried does not exist.";
        infodiv.innerHTML = "";
        toggledisplayflex(logindiv);
      } else {
        errordiv.innerHTML =
          "There was an error when creating the account. Error code: " + code;
        infodiv.innerHTML = "";
      }
    });
}
