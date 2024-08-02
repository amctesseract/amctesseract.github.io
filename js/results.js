getUser();

function toggledisplay(element) {
  if (element.classList.contains("hidden")) {
    element.classList.remove("hidden");
    element.classList.add("shown");
  } else {
    element.classList.remove("shown");
    element.classList.add("hidden");
  }
}

function getUser() {
  let loading_div = document.getElementById("info-text");
  loading_div.innerHTML = "Retrieving results...";

  let auth_flag = true;
  firebase.auth().onAuthStateChanged(function (user) {
    if (auth_flag) {
      let results_div = document.getElementById("results");
      if (user == null) {
        loading_div.innerHTML =
          "You are not logged in. Sign in to view past results.";
      } else {
        let url = new URL(window.location.href);
        let params = url.searchParams;
        if (Array.from(params).length == 0) {
          getAMCResults(user, results_div);
          getAIMEResults(user, results_div);
        } else {
          let test = params.get("test");
          let id = params.get("id");
          getSpecificTest(user, test, id, results_div);
        }
      }

      auth_flag = false;
    }
  });
}

function getAMCResults(user, results_div) {
  let database = firebase.database();
  let uid = user.uid;
  let amc_results = database.ref("users/" + uid + "/amcs");

  let retrieved_flag = true;
  amc_results.on("value", (snapshot) => {
    if (retrieved_flag) {
      const data = snapshot.val();
      showAMCResults(results_div, data);
      retrieved_flag = false;
    }
  });
}

function showAMCResults(results_div, data) {
  let loading_div = document.getElementById("info-text");

  let amc_div = document.createElement("h2");
  amc_div.setAttribute("class", "section-header");
  amc_div.innerHTML = "<b>AMC Results</b>";
  results_div.appendChild(amc_div);

  let table = document.createElement("table");
  table.setAttribute("id", "amc-results-table");
  table.setAttribute("class", "results-table");

  let head = document.createElement("thead");
  let row = document.createElement("tr");
  let cell1 = document.createElement("th");
  let cell2 = document.createElement("th");
  let cell3 = document.createElement("th");
  let cell4 = document.createElement("th");

  cell1.innerHTML = "Date";
  cell2.innerHTML = "Year";
  cell3.innerHTML = "Test";
  cell4.innerHTML = "Your Score";

  row.appendChild(cell1);
  row.appendChild(cell2);
  row.appendChild(cell3);
  row.appendChild(cell4);

  head.appendChild(row);

  table.appendChild(head);

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      let date = data[key]["date"];
      date = new Date(date);

      var dd = String(date.getDate()).padStart(2, "0");
      var mm = String(date.getMonth() + 1).padStart(2, "0");
      var yyyy = date.getFullYear();

      row = document.createElement("tr");
      cell1 = document.createElement("td");
      cell2 = document.createElement("td");
      cell3 = document.createElement("td");
      cell4 = document.createElement("td");

      cell1.innerHTML =
        '<a href="?test=' +
        "amc" +
        "&id=" +
        key +
        '">' +
        mm +
        "/" +
        dd +
        "/" +
        yyyy +
        "</a>";
      cell2.innerHTML =
        '<a href="?test=' +
        "amc" +
        "&id=" +
        key +
        '">' +
        data[key]["year"] +
        "</a>";
      cell3.innerHTML =
        '<a href="?test=' +
        "amc" +
        "&id=" +
        key +
        '">AMC ' +
        data[key]["grade"] +
        data[key]["version"] +
        "</a>";
      cell4.innerHTML =
        '<a href="?test=' +
        "amc" +
        "&id=" +
        key +
        '">' +
        data[key]["score"] +
        "</a>";

      row.appendChild(cell1);
      row.appendChild(cell2);
      row.appendChild(cell3);
      row.appendChild(cell4);

      table.appendChild(row);
    }
  }

  results_div.appendChild(table);
}

function getAIMEResults(user, results_div) {
  let database = firebase.database();
  let uid = user.uid;
  let aime_results = database.ref("users/" + uid + "/aimes");

  let retrieved_flag = true;
  aime_results.on("value", (snapshot) => {
    if (retrieved_flag) {
      const data = snapshot.val();
      showAIMEResults(results_div, data);
      retrieved_flag = false;
    }
  });
}

function showAIMEResults(results_div, data) {
  let loading_div = document.getElementById("info-text");

  let aime_div = document.createElement("h2");
  aime_div.setAttribute("class", "section-header");
  aime_div.setAttribute("id", "aime-header");
  aime_div.innerHTML = "<b>AIME Results</b>";
  results_div.appendChild(aime_div);

  let table = document.createElement("table");
  table.setAttribute("id", "aime-results-table");
  table.setAttribute("class", "results-table");

  let head = document.createElement("thead");

  let row = document.createElement("tr");
  let cell1 = document.createElement("th");
  let cell2 = document.createElement("th");
  let cell3 = document.createElement("th");
  let cell4 = document.createElement("th");

  cell1.innerHTML = "Date";
  cell2.innerHTML = "Year";
  cell3.innerHTML = "Test";
  cell4.innerHTML = "Your Score";

  row.appendChild(cell1);
  row.appendChild(cell2);
  row.appendChild(cell3);
  row.appendChild(cell4);

  head.appendChild(row);

  table.appendChild(head);

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      let date = data[key]["date"];
      date = new Date(date);

      var dd = String(date.getDate()).padStart(2, "0");
      var mm = String(date.getMonth() + 1).padStart(2, "0");
      var yyyy = date.getFullYear();

      row = document.createElement("tr");
      cell1 = document.createElement("td");
      cell2 = document.createElement("td");
      cell3 = document.createElement("td");
      cell4 = document.createElement("td");

      cell1.innerHTML =
        '<a href="?test=' +
        "aime" +
        "&id=" +
        key +
        '">' +
        mm +
        "/" +
        dd +
        "/" +
        yyyy +
        "</a>";
      cell2.innerHTML =
        '<a href="?test=' +
        "aime" +
        "&id=" +
        key +
        '">' +
        data[key]["year"] +
        "</a>";
      cell3.innerHTML =
        '<a href="?test=' +
        "aime" +
        "&id=" +
        key +
        '">AIME ' +
        data[key]["version"] +
        "</a>";
      cell4.innerHTML =
        '<a href="?test=' +
        "aime" +
        "&id=" +
        key +
        '">' +
        data[key]["score"] +
        "</a>";

      row.appendChild(cell1);
      row.appendChild(cell2);
      row.appendChild(cell3);
      row.appendChild(cell4);

      table.appendChild(row);
    }
  }
  results_div.appendChild(table);

  loading_div.innerHTML = "Click on a table row to view more details.";
}

function getSpecificTest(user, test, id, results_div) {
  try {
    let database = firebase.database();
    let uid = user.uid;
    let answers;
    if (test == "amc") {
      answers = database.ref("users/" + uid + "/amcs/" + id);
    } else {
      answers = database.ref("users/" + uid + "/aimes/" + id);
    }
    answers.on("value", (snapshot) => {
      const data = snapshot.val();
      showTestResults(data, test, results_div);
    });
  } catch (error) {
    console.log(error);
    results_div.innerHTML =
      "There was an error when trying to retrieve the test data.";
  }
}

function showTestResults(data, test, results_div) {
  try {
    const answers = data["selected-answers"];
    const correct_answers = data["correct-answers"];

    let loading_div = document.getElementById("info-text");

    let page_header = document.getElementById("page-header");

    let answers_div = document.createElement("h2");
    answers_div.setAttribute("class", "section-header");
    answers_div.setAttribute("id", "results-header");
    if (test == "amc") {
      page_header.innerHTML =
        data["year"] +
        " AMC " +
        data["grade"] +
        data["version"] +
        " Practice Results";
    } else {
      page_header.innerHTML =
        data["year"] + " AIME " + data["version"] + " Practice Results";
    }

    let score_div = document.createElement("div");
    score_div.setAttribute("id", "score-date-div");

    let date = data["date"];
    date = new Date(date);

    var dd = String(date.getDate()).padStart(2, "0");
    var mm = String(date.getMonth() + 1).padStart(2, "0");
    var yyyy = date.getFullYear();

    let score_p = document.createElement("p");
    score_p.setAttribute("id", "score-p");
    score_p.setAttribute("class", "test-description");

    page_header.innerHTML += ", " + mm + "/" + dd + "/" + yyyy;
    //document.getElementById("date-text").innerHTML =
    //  "Date of exam: " + mm + "/" + dd + "/" + yyyy;
    score_p.innerHTML = "<b>Your score: " + data["score"] + "</b>";

    score_div.appendChild(score_p);

    answers_div.appendChild(score_div);
    results_div.appendChild(answers_div);

    let table = document.createElement("table");
    table.setAttribute("id", "results-table");
    table.setAttribute("class", "results-table");

    let row1 = document.createElement("tr");
    let row2 = document.createElement("tr");
    let row3 = document.createElement("tr");

    let cell1 = document.createElement("th");
    let cell2 = document.createElement("th");
    let cell3 = document.createElement("th");

    cell1.innerHTML = "Problem Number";
    cell2.innerHTML = "Your Answer";
    cell3.innerHTML = "Correct Answer";

    row1.appendChild(cell1);
    row2.appendChild(cell2);
    row3.appendChild(cell3);

    for (let i = 0; i < answers.length; i++) {
      let selected_answer = answers[i];
      let correct_answer = correct_answers[i];

      cell1 = document.createElement("td");
      cell2 = document.createElement("td");
      cell3 = document.createElement("td");

      cell1.innerHTML = i + 1;

      if (selected_answer == -2 || selected_answer == -1) {
        cell2.innerHTML = "-";
      } else {
        cell2.innerHTML = selected_answer;
      }

      cell3.innerHTML = correct_answer;

      row1.appendChild(cell1);
      row2.appendChild(cell2);
      row3.appendChild(cell3);
    }

    table.appendChild(row1);
    table.appendChild(row2);
    table.appendChild(row3);

    results_div.appendChild(table);
    loading_div.innerHTML = "";
    toggledisplay(document.getElementById("review-description-text"));
  } catch (error) {
    console.log(error);
    results_div.innerHTML =
      "There was an error when trying to retrieve the test data.";
  }
}
