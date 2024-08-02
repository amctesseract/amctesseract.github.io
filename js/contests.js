function switchtest(element) {
  let button = document.getElementById("test-names");
  button.innerHTML = element.innerHTML;
  button.style.color = "black";
  toggleselectshow();
}

function toggleselectshow() {
  let element = document.getElementById("test-dropdown");
  if (element.classList.contains("dropdown-shown")) {
    element.classList.remove("dropdown-shown");
    window.setTimeout(function () {
      element.classList.add("no-border");
    }, 500);
  } else {
    element.classList.remove("no-border");
    element.classList.add("dropdown-shown");
  }
}

let problems = [];
let finishtest = false;

function toggledisplay(element) {
  if (element.classList.contains("hidden")) {
    element.classList.remove("hidden");
    element.classList.add("shown");
  } else {
    element.classList.remove("shown");
    element.classList.add("hidden");
  }
}

function starttest() {
  let homescreen = document.getElementById("home-screen");
  toggledisplay(homescreen);

  let testelement = document.getElementById("test-names");
  let chosentest = testelement.value;

  let yearelement = document.getElementById("test-year");
  let chosenyear = yearelement.value;
  let year = chosenyear;

  let hourselement = document.getElementById("test-length-hours");
  let minuteselement = document.getElementById("test-length-minutes");

  let chosenhours = hourselement.value;
  let chosenminutes = minuteselement.value;

  let totalseconds = 3600 * chosenhours + 60 * chosenminutes;

  let test;
  let grade;
  let version;
  if (chosentest === "AMC 10A") {
    test = "AMC";
    grade = 10;
    version = "A";
  } else if (chosentest === "AMC 10B") {
    test = "AMC";
    grade = 10;
    version = "B";
  } else if (chosentest === "AMC 12A") {
    test = "AMC";
    grade = 12;
    version = "A";
  } else if (chosentest === "AMC 12B") {
    test = "AMC";
    grade = 12;
    version = "B";
  } else if (chosentest === "AIME I") {
    test = "AIME";
    grade = "";
    version = "I";
  } else if (chosentest === "AIME II") {
    test = "AIME";
    grade = "";
    version = "II";
  } else {
    test = "AMC";
    grade = 10;
    version = "A";
  }

  let numproblems = 0;
  if (test === "AMC") {
    numproblems = 25;
  } else if (test === "AIME") {
    // AIME is not supported yet
    numproblems = 15;
  }

  /*year = "2019";
      test = "AMC";
      grade = "10";
      version = "A";
      numproblems = 25;
      totalseconds = 100000000000000;*/

  for (let i = 0; i < numproblems; i++) {
    problems.push(0);
  }

  let loading = document.getElementById("loading-screen");
  toggledisplay(loading);

  getcontest(year, test, grade, version, numproblems, totalseconds);
}

function getcontest(year, test, grade, version, numproblems, totalseconds) {
  let keeplooping = true;
  for (let i = 1; i <= numproblems; i++) {
    if (keeplooping) {
      (async () => {
        let apiurl =
          year + "_" + test + "_" + grade + version + "_Problems/Problem_" + i;
        problems[i - 1] = await getproblem(
          year + "_" + test + "_" + grade + version + "_Problems/Problem_" + i,
          i
        );

        if (problems[i - 1] === 400) {
          let loading = document.getElementById("loading-text");
          loading.innerHTML =
            "There was an error when retrieving the problems.";
          keeplooping = false;
        }

        addcontent(
          problems,
          year,
          test,
          grade,
          version,
          numproblems,
          totalseconds,
          keeplooping
        );
      })();
    }
  }
}

async function getproblem(page, problemnumber) {
  let endpoint = "https://artofproblemsolving.com/wiki/api.php";
  let params = `action=parse&page=${page}&format=json`;

  try {
    let response = await fetch(`${endpoint}?${params}&origin=*`);

    let responsejson = await response.json();

    let pagehtml = responsejson.parse.text["*"];
    if (pagehtml.includes("redirectMsg")) {
      let redirectuncutstartloc =
        pagehtml.indexOf('<a href="/wiki/index.php/') + 25;
      let redirectcut = pagehtml.substring(redirectuncutstartloc);
      let redirectcutendloc = redirectcut.indexOf('"');
      let redirect = redirectcut.substring(0, redirectcutendloc);
      params = `action=parse&page=${redirect}&format=json`;
      response = await fetch(`${endpoint}?${params}&origin=*`);
      responsejson = await response.json();
      pagehtml = responsejson.parse.text["*"];
    }

    let searchstart = pagehtml.indexOf('id="Problem">');
    let problemstartlocoriginal = pagehtml.indexOf("<p>", searchstart);
    let pagehtmlcut = pagehtml.substring(problemstartlocoriginal);
    let problemendloc = pagehtmlcut.indexOf("<h2><span");
    let problemtext = pagehtmlcut.substring(0, problemendloc);

    return convertmathjax(problemtext);
  } catch {
    return 400;
  }
}

function convertmathjax(problemtext) {
  while (
    problemtext.includes('class="latex"') &&
    problemtext.substring(
      problemtext.indexOf('class="latex"') + 19,
      problemtext.indexOf('class="latex"') + 24
    ) != "[asy]"
  ) {
    let latexstartloc = problemtext.indexOf('class="latex"') + 20;
    let latexcut = problemtext.substring(latexstartloc);
    let latexendcutloc = latexcut.indexOf('"');
    let latex = latexcut.substring(0, latexendcutloc - 1);

    let imgstartloc =
      problemtext.lastIndexOf(
        'src="//latex.artofproblemsolving.com',
        latexstartloc
      ) - 5;
    let imgcut = problemtext.substring(imgstartloc);
    let imgendcutloc = imgcut.indexOf(" />");
    let img = imgcut.substring(0, imgendcutloc + 3);

    problemtext = problemtext.replace(img, "\\(" + latex + "\\)");
  }

  while (
    problemtext.includes('class="latexcenter"') &&
    problemtext.substring(
      problemtext.indexOf('class="latexcenter"') + 25,
      problemtext.indexOf('class="latexcenter"') + 30
    ) != "[asy]"
  ) {
    let latexstartloc = problemtext.indexOf('class="latexcenter"') + 27;
    let latexcut = problemtext.substring(latexstartloc);
    let latexendcutloc = latexcut.indexOf('"');
    let latex = latexcut.substring(0, latexendcutloc - 2);

    let imgstartloc =
      problemtext.lastIndexOf(
        'src="//latex.artofproblemsolving.com',
        latexstartloc
      ) - 5;
    let imgcut = problemtext.substring(imgstartloc);
    let imgendcutloc = imgcut.indexOf(" />");
    let img = imgcut.substring(0, imgendcutloc + 3);

    let replacelatex = latex;
    // TODO: extremely hacky way to deal with \begin{align*} statements, find a better way later
    if (replacelatex.includes("egin{align*}")) {
      replacelatex = "\\b" + replacelatex + "*}";
    } else {
      replacelatex = "\\[" + replacelatex + "\\]";
    }

    problemtext = problemtext.replace(img, replacelatex);
  }

  return problemtext;
}

function addcontent(
  problems,
  year,
  test,
  grade,
  version,
  numproblems,
  totalseconds,
  keeplooping
) {
  if (keeplooping) {
    let readytoappend = true;
    for (let i = 0; i < problems.length; i++) {
      if (problems[i] === 0) {
        readytoappend = false;
      }
    }
    if (readytoappend) {
      let questions = document.getElementById("questions");
      for (let i = 0; i < problems.length; i++) {
        // TODO: WHEN IMPLEMENTING OTHER CONTESTS (e.g. AIME), ADD MORE TESTS
        if (test === "AMC") {
          questions.innerHTML +=
            '<div class="problem"><div class="problem-number">' +
            (i + 1) +
            '.</div><div class="bubbles"><div class="bubbles-inner"><button onclick="togglecolor(this.id)" type="button" class="deselected" id="A-button-' +
            i +
            '">A</button><button onclick="togglecolor(this.id)" type="button" class="deselected" id="B-button-' +
            i +
            '">B</button><button onclick="togglecolor(this.id)" type="button" class="deselected" id="C-button-' +
            i +
            '">C</button><button onclick="togglecolor(this.id)" type="button" class="deselected" id="D-button-' +
            i +
            '">D</button><button onclick="togglecolor(this.id)" type="button" class="deselected" id="E-button-' +
            i +
            '">E</button></div></div><div class="problem-body">' +
            problems[i] +
            "</div></div>";
        } else if (test === "AIME") {
          questions.innerHTML +=
            '<div class="problem"><div class="problem-number">' +
            (i + 1) +
            '.</div><div class="answer-input-wrapper"><input type="text" autocomplete="off" class="answer-input" maxlength="3" id="answer-input-' +
            i +
            '"></input></div><div class="problem-body">' +
            problems[i] +
            "</div></div>";
        }

        /*if (i !== (problems.length - 1)) {
              questions.innerHTML += "<hr class=\"problem-splitter\">";
            }*/
      }
      questions.innerHTML +=
        '<button id="finish-test" onclick="finishTest()">Submit test</button>';
      MathJax.typeset();

      let loadingdiv = document.getElementById("loading-screen");
      toggledisplay(loadingdiv);

      starttimer(year, test, grade, version, numproblems, totalseconds);
    }
  }
}

function finishTest() {
  finishtest = true;
}

function togglecolor(id) {
  let currentproblem = id.substring(1);
  let choices = ["A", "B", "C", "D", "E"];
  let runend = true;
  for (let i = 0; i < choices.length; i++) {
    let letter = choices[i];
    let currentbtn = document.getElementById(letter + currentproblem);
    if (
      currentbtn.classList.contains("selected") &&
      id === letter + currentproblem
    ) {
      currentbtn.classList.remove("selected");
      currentbtn.classList.add("deselected");
      runend = false;
    } else if (currentbtn.classList.contains("selected")) {
      currentbtn.classList.remove("selected");
      currentbtn.classList.add("deselected");
    }
  }
  if (runend) {
    let nowbtn = document.getElementById(id);
    if (nowbtn.classList.contains("deselected")) {
      nowbtn.classList.remove("deselected");
      nowbtn.classList.add("selected");
    }
  }
}

function starttimer(year, test, grade, version, numproblems, totalseconds) {
  let starttime = new Date().getTime();
  let endtime = addseconds(starttime, totalseconds);

  let contesthead = document.getElementById("contest-heading-text");
  contesthead.innerHTML =
    year + " " + test + " " + grade + version + " Practice Test";

  let timer = document.getElementById("clock");
  //let settingsbtn = document.getElementById("settings");

  //settingsbtn.innerHTML = '<i class="fa fa-gear" style="font-size:30px"></i>';

  let testscreendiv = document.getElementById("test-screen");
  toggledisplay(testscreendiv);

  let interval = setInterval(function () {
    let currenttime = new Date().getTime();
    let timetoend = endtime - currenttime;

    let hours = Math.floor(
      (timetoend % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    let minutes = Math.floor((timetoend % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((timetoend % (1000 * 60)) / 1000);

    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (hours < 10) {
      hours = "0" + hours;
    }

    timer.innerHTML =
      "Time Remaining: " + hours + ":" + minutes + ":" + seconds;

    if (timetoend <= 0 || finishtest === true) {
      finishtest = true;
      clearInterval(interval);

      toggledisplay(testscreendiv);
      timer.innerHTML = "CONTEST OVER";

      showresults(year, test, grade, version, numproblems);
    }
  }, 1000);
}

function addseconds(date, seconds) {
  return new Date(date + seconds * 1000);
}

function showresults(year, test, grade, version, numproblems) {
  (async () => {
    let loadingtext = document.getElementById("loading-text");
    loadingtext.innerHTML = "Checking answers...";

    let loadingscreen = document.getElementById("loading-screen");
    toggledisplay(loadingscreen);

    let correctanswers = await getcorrectanswers(
      year,
      test,
      grade,
      version,
      numproblems
    );

    let selectedanswers = getselectedanswers(
      year,
      test,
      grade,
      version,
      numproblems
    );
    let score = checkanswers(selectedanswers, correctanswers, test);

    updateFirebase(
      score,
      year,
      test,
      grade,
      version,
      numproblems,
      selectedanswers,
      correctanswers
    );

    let finishedheading = document.getElementById("finished-heading-text");
    finishedheading.innerHTML =
      year + " " + test + " " + grade + version + " End Screen";
    //let scoreelement = document.getElementById("finished-score");
    //scoreelement.innerHTML = "Your score: " + score;

    if (correctanswers === 400) {
      loadingtext.innerHTML =
        "There was an error when retrieving the correct answers.";
      return;
    }

    let finishedscreen = document.getElementById("finished-screen");
    toggledisplay(finishedscreen);

    toggledisplay(loadingscreen);

    let viewreport = document.getElementById("view-scores");
    viewreport.onclick = function () {
      showreview(
        numproblems,
        selectedanswers,
        correctanswers,
        score,
        year,
        test,
        grade,
        version
      );
    };
  })();
}

function showreview(
  numproblems,
  selectedanswers,
  correctanswers,
  score,
  year,
  test,
  grade,
  version
) {
  let finishedscreen = document.getElementById("finished-screen");
  toggledisplay(finishedscreen);

  if (test === "AMC") {
    let letters = ["A", "B", "C", "D", "E"];
    for (let i = 0; i < numproblems; i++) {
      for (let j = 0; j < letters.length; j++) {
        let buttonid = letters[j] + "-button-" + i;
        let buttonelement = document.getElementById(buttonid);
        buttonelement.disabled = true;
        if (
          selectedanswers[i] != -1 &&
          buttonelement.classList.contains("selected")
        ) {
          if (selectedanswers[i] === correctanswers[i]) {
            buttonelement.style.backgroundColor = "#b1e6bc";
          } else {
            buttonelement.style.backgroundColor = "#f5958e";
          }
        }
      }
    }
  } else if (test === "AIME") {
    for (let i = 0; i < numproblems; i++) {
      let fieldid = "answer-input-" + i;
      let fieldelement = document.getElementById(fieldid);
      fieldelement.disabled = true;

      if (selectedanswers[i] == correctanswers[i]) {
        fieldelement.style.backgroundColor = "#b1e6bc";
      } else {
        fieldelement.style.backgroundColor = "#f5958e";
      }
    }
  }
  toggledisplay(document.getElementById("contest-description-text"));
  let reviewheading = document.getElementById("review-heading-text");
  reviewheading.innerHTML =
    year + " " + test + " " + grade + version + " Practice Results";

  let contestheading = document.getElementById("contest-heading-text");
  toggledisplay(contestheading);
  let timer = document.getElementById("timer");
  toggledisplay(timer);
  let scorediv = document.getElementById("review-score");
  scorediv.innerHTML = "<b>Your score: " + score + "</b>";
  let testscreen = document.getElementById("test-screen");
  toggledisplay(testscreen);
  let reviewscreen = document.getElementById("review-screen");
  toggledisplay(reviewscreen);
  let submitbtn = document.getElementById("finish-test");
  toggledisplay(submitbtn);

  let answerstable = document.createElement("table");
  answerstable.setAttribute("id", "answers-table");
  //answerstable.setAttribute("class", "hidden");

  let tablehead = document.createElement("thead");

  let tablerow = document.createElement("tr");

  tablehead.appendChild(tablerow);

  answerstable.appendChild(tablehead);

  let tablerow1 = document.createElement("tr");
  let tablerow2 = document.createElement("tr");
  let tablerow3 = document.createElement("tr");

  let tablecell1 = document.createElement("th");
  let tablecell2 = document.createElement("th");
  let tablecell3 = document.createElement("th");

  tablecell1.innerHTML = "Problem Number";
  tablecell2.innerHTML = "Your Answer";
  tablecell3.innerHTML = "Correct Answer";
  tablerow1.appendChild(tablecell1);
  tablerow2.appendChild(tablecell2);
  tablerow3.appendChild(tablecell3);

  for (let i = 0; i < numproblems; i++) {
    tablecell1 = document.createElement("td");
    tablecell2 = document.createElement("td");
    tablecell3 = document.createElement("td");

    tablecell1.innerHTML = i + 1;
    if (
      (test === "AMC" && selectedanswers[i] === -1) ||
      (test === "AIME" && selectedanswers[i] === -2)
    ) {
      tablecell2.innerHTML = "-";
    } else {
      tablecell2.innerHTML = selectedanswers[i];
    }
    tablecell3.innerHTML = correctanswers[i];

    tablerow1.appendChild(tablecell1);
    tablerow2.appendChild(tablecell2);
    tablerow3.appendChild(tablecell3);
  }

  answerstable.appendChild(tablerow1);
  answerstable.appendChild(tablerow2);
  answerstable.appendChild(tablerow3);

  let answersreport = document.getElementById("review-answers-report");
  answersreport.appendChild(answerstable);
}

function toggletablevisibility() {
  let table = document.getElementById("answers-table");
  // had to get rid of adding shown class because display: block caused weird alignment behavior
  if (table.classList.contains("hidden")) {
    table.classList.remove("hidden");
  } else if (!table.classList.contains("hidden")) {
    table.classList.add("hidden");
  }

  let showtablebtn = document.getElementById("show-score-table");
  if (showtablebtn.innerHTML === "Show Score Report") {
    showtablebtn.innerHTML = "Hide Score Report";
  } else if (showtablebtn.innerHTML === "Hide Score Report") {
    showtablebtn.innerHTML = "Show Score Report";
  }
}

function getselectedanswers(year, test, grade, version, numproblems) {
  let selectedanswers = [];
  for (let i = 0; i < numproblems; i++) {
    selectedanswers.push(-1);
  }

  // TODO: WHEN IMPLEMENTING OTHER CONTESTS (e.g. AIME), ADD MORE TESTS
  if (test === "AMC") {
    let letters = ["A", "B", "C", "D", "E"];
    let buttonid;
    let currentbutton;
    for (let i = 0; i < numproblems; i++) {
      for (let j = 0; j < letters.length; j++) {
        buttonid = letters[j] + "-button-" + i;

        currentbutton = document.getElementById(buttonid);
        if (
          currentbutton.classList.contains("selected") &&
          !currentbutton.classList.contains("deselected")
        ) {
          selectedanswers[i] = letters[j];

          break;
        }
      }
    }
  } else if (test === "AIME") {
    for (let i = 0; i < numproblems; i++) {
      let fieldid = "answer-input-" + i;
      let currentfield = document.getElementById(fieldid);
      let currentanswer = currentfield.value;

      if (currentanswer != "") {
        selectedanswers[i] = Number(currentanswer);
      } else {
        selectedanswers[i] = -2;
      }
    }
  }

  return selectedanswers;
}

async function getcorrectanswers(year, test, grade, version, numproblems) {
  try {
    let endpoint = "https://artofproblemsolving.com/wiki/api.php";
    let page = year + "_" + test + "_" + grade + version + "_Answer_Key";
    let params = `action=parse&page=${page}&format=json`;

    let response = await fetch(`${endpoint}?${params}&origin=*`);

    let responsejson = await response.json();

    let pagehtml = responsejson.parse.text["*"];
    if (pagehtml.includes("redirectMsg")) {
      let redirectuncutstartloc =
        pagehtml.indexOf('<a href="/wiki/index.php/') + 25;
      let redirectcut = pagehtml.substring(redirectuncutstartloc);
      let redirectcutendloc = redirectcut.indexOf('"');
      let redirect = redirectcut.substring(0, redirectcutendloc);
      params = `action=parse&page=${redirect}&format=json`;
      response = await fetch(`${endpoint}?${params}&origin=*`);
      responsejson = await response.json();
      pagehtml = responsejson.parse.text["*"];
    }

    let correctanswers = [];
    let cutloc;
    for (let i = 0; i < numproblems; i++) {
      cutloc = pagehtml.indexOf("<li>") + 4;
      pagehtml = pagehtml.substring(cutloc);
      if (test === "AMC") {
        correctanswers.push(pagehtml.substring(0, 1));
      } else {
        correctanswers.push(Number(pagehtml.substring(0, 3)));
      }
    }

    return correctanswers;
  } catch {
    return 400;
  }
}

function checkanswers(selectedanswers, correctanswers, test) {
  let correctnum = 0;
  let skippednum = 0;
  let wrongnum = 0;
  for (let i = 0; i < selectedanswers.length; i++) {
    if (selectedanswers[i] === -1) {
      skippednum++;
    } else if (selectedanswers[i] === correctanswers[i]) {
      correctnum++;
    } else if (selectedanswers[i] != correctanswers[i]) {
      wrongnum++;
    }
  }
  let score = "";
  if (test === "AMC") {
    score = 6 * correctnum + 1.5 * skippednum;
  } else if (test === "AIME") {
    score = correctnum;
  }

  return score;
}

function updateFirebase(
  score,
  year,
  test,
  grade,
  version,
  numproblems,
  selected_answers,
  correct_answers
) {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user != null && user.emailVerified) {
      let database = firebase.database();

      let newScoreKey = firebase.database().ref().child("users").push().key;
      let updates = {};
      let date = new Date();
      if (test === "AMC") {
        updates["/users/" + user.uid + "/amcs/" + newScoreKey] = {
          username: user.displayName,
          date: date,
          year: year,
          grade: grade,
          version: version,
          score: score,
          "selected-answers": selected_answers,
          "correct-answers": correct_answers,
        };
      } else if (test === "AIME") {
        updates["/users/" + user.uid + "/aimes/" + newScoreKey] = {
          username: user.displayName,
          date: date,
          year: year,
          version: version,
          score: score,
          "selected-answers": selected_answers,
          "correct-answers": correct_answers,
        };
      }

      return firebase.database().ref().update(updates);
    }
    return false;
  });
}

var rotating = false;
function rotate(element) {
  if (!rotating) {
    element.innerHTML =
      '<i class="fa fa-gear fa-spin" style="font-size:30px"></i>';
    rotating = true;
  }
}
function unrotate(element) {
  if (rotating) {
    element.innerHTML = '<i class="fa fa-gear" style="font-size:30px"></i>';
    rotating = false;
  }
}
function togglesettings() {
  let cover = document.getElementById("gray-fullscreen");
  toggledisplay(cover);
}
function togglestickytimer() {
  let timer = document.getElementById("timer");
  let checkele = document.getElementById("sticky-timer-checkbox");
  let checked = checkele.checked;

  if (!checked) {
    timer.style.position = "relative";
  } else {
    timer.style.position = "sticky";
  }
}
