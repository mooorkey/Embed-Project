fetchData();
let lowFlag = false;
let aFlag = false;
let fFlag = 0;
const channelId = "2104323";
const HRchannelId = "2106683";
const dlength = 20;
const form = document.getElementById("popupForm");
const popup = document.getElementById("popup");
const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];
const pbtn = document.getElementById("popBtn");
const showHistBtn = document.getElementById("iv-hstBtn");
const showHRHistBtn = document.getElementById("hr-hstBtn");
const submitButton = document.getElementById("submitButton");
submitButton.addEventListener("click", handleSubmit);
const coverpopup = document.getElementById("cover-popup");
const ts_url_w_graph = `https://thingspeak.com/channels/${channelId}/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=${dlength}&title=IV+Bag+weight&type=line&xaxis=Date%26Time&yaxis=Weight+%28gram%29"`;
const ts_url_hr_graph = `https://thingspeak.com/channels/${HRchannelId}/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=${dlength}&title=Heart+Rate&type=line&xaxis=Date%26Time`;
const tsgraphw = document.getElementById("tsgraphWeight");
const tsgraphhr = document.getElementById("tsgraphHeartRate");
const alertCheckBox = document.querySelector("#acheckbox");
tsgraphw.setAttribute("src", ts_url_w_graph);
tsgraphhr.setAttribute("src", ts_url_hr_graph);

alertCheckBox.addEventListener("change", function() {
  if(this.checked) {
    aFlag = true;
  } else {
    aFlag = false;
  }
});

function openForm() {
  form.style.display = "block";
}

function closeForm() {
  form.style.display = "none";
  if(lowFlag == true) {
    alertCheckBox.checked = false;
    aFlag = false;  
  } else {
    alertCheckBox.checked = true;
    aFlag = true;  
  }
}

showHistBtn.onclick = function () {
  modal.style.display = "block";
  fFlag = 1;
  updateTableOnClick(5, fFlag);
};

showHRHistBtn.onclick = function () {
  modal.style.display = "block";
  fFlag = 2;
  updateTableOnClick(5, fFlag);
};

span.onclick = function () {
  modal.style.display = "none";
};

function cover_close() {
  coverpopup.style.display = "none";
}

function openForm2() {
  const main_container = document.getElementById("info-container");
  const position = main_container.getBoundingClientRect();
  const coverpopup = document.getElementById("cover-popup");

  // Set initial position and size of coverpopup
  coverpopup.style.top = position.top + "px";
  coverpopup.style.left = position.left + "px";
  coverpopup.style.width = position.width + "px";
  coverpopup.style.height = position.height + "px";
  coverpopup.style.display = "flex";

  // Add event listener for resize event
  window.addEventListener("resize", function () {
    const position = main_container.getBoundingClientRect();
    coverpopup.style.top = position.top + "px";
    coverpopup.style.left = position.left + "px";
    coverpopup.style.width = position.width + "px";
    coverpopup.style.height = position.height + "px";
  });
}

// Sunmit entry
function handleSubmit() {
  const input = document.getElementById("entryInput").value;
  // console.log(`You entered: ${input}`);
  if (input === "") {
    return;
  }
  updateTableOnClick(input, fFlag);
}

// Update the history table
function updateTable(data) {
  const table = document.getElementById("hisTable");
  // Clear existing rows from the table
  while (table.rows.length > 1) {
    table.deleteRow(-1);
  }

  let i = data.length - 1;
  let prevValue = null;

  while (i >= 0) {
    const value = data[i].field1;
    const row = table.insertRow(-1);
    const nCell = row.insertCell(0);
    nCell.innerHTML = data.length - i;
    const dateCell = row.insertCell(1);
    const valueCell = row.insertCell(2);

    if (value === null || value === "") {
      // if the current value is empty, use the previous non-empty value
      valueCell.innerHTML = prevValue;
    } else {
      // if the current value is not empty, use it as the new previous value
      prevValue = value;
      valueCell.innerHTML = value;
    }

    const dateValue = new Date(data[i].created_at).toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    });

    dateCell.innerHTML = dateValue;

    i--;
  }
}

let history_url = "";
let hist_data_url = "";
function updateTableOnClick(length, field) {  
  if (field == 1) {
    history_url = `https://thingspeak.com/channels/${channelId}/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=${length}&title=IV+Bag+weight&type=line&xaxis=Date%26Time&yaxis=Weight+%28gram%29"`;
    hist_data_url = `https://api.thingspeak.com/channels/${channelId}/fields/1.json?results=${length}`;
  } else if (field == 2) {
    history_url = `https://thingspeak.com/channels/${HRchannelId}/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=${length}&title=Heart+Rate&type=line&xaxis=Date%26Time`;
    hist_data_url = `https://api.thingspeak.com/channels/${HRchannelId}/fields/1.json?results=${length}`;
  }
  const hisIframe = document.getElementById("history-iframe");
  hisIframe.setAttribute("src", history_url);
  fetch(hist_data_url)
    .then((response) => response.json())
    .then((data) => {
      updateTable(data.feeds);
      // create a download link for the Blob object
      const jsonData = JSON.stringify(data);
      const blob = new Blob([jsonData], { type: "application/json" });
      const downloadBtn = document.querySelector(".download-btn");
      downloadBtn.href = URL.createObjectURL(blob);
      downloadBtn.download = "iv_data.json";
    })
    .catch((error) => console.error(error));
}

let latestNonNullFieldc1 = null;
let latestNonNullFieldc2 = null;

// Update the data
function fetchData() {
  // ThingSpeak API URL
  const channelId = "2104323";
  const HRchannelId = "2106683";
  const Nresult = 10;

  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?results=${Nresult}`;
  const url2 = `https://api.thingspeak.com/channels/${HRchannelId}/feeds.json?results=${Nresult}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const infoText = document.querySelector("#info-text");
      const dateText = document.querySelector("#date-text");
      const entryText = document.querySelector("#entry-text");
      const statusText = document.querySelector("#status-text");
      const bIV = document.querySelector("#bigIV");

      let field1Value = data.feeds[Nresult - 1].field1;

      // Check if field1Value is null
      if (field1Value === null) {
        // Find the latest non-null value for field1Value
        for (let i = Nresult - 1; i >= 0; i--) {
          if (data.feeds[i].field1 !== null) {
            latestNonNullFieldc1 = data.feeds[i].field1;
            break;
          }
        }
        // Set field1Value to the latest non-null value or "No data available" if all values are null
        field1Value = latestNonNullFieldc1 !== null ? latestNonNullFieldc1 : "No data available";
      }

      const dateValue = new Date(data.feeds[Nresult - 1].created_at).toLocaleString(
        "en-US",
        { timeZone: "Asia/Bangkok" }
      );
      const totalEntry = data.channel.last_entry_id;

      infoText.textContent = `Latest IV reading: ${field1Value}`;
      dateText.textContent = `IV Date and time: ${dateValue}`;
      entryText.textContent = `IV Total Entry: ${totalEntry}`;

      bIV.textContent = `${field1Value}`;
      

      if (field1Value !== "No data available" && parseFloat(field1Value) >= 25) {
        statusText.textContent = "Status: normal";
        lowFlag = false;
      } else {
        lowFlag = true;
        statusText.textContent = "Status: low";
      }
      if (lowFlag && aFlag) {
        form.style.display = "block";
      }
    })
    .catch((error) => console.error(error));

    fetch(url2)
    .then((response) => response.json())
    .then((data) => {
      const hrText = document.querySelector("#hrinfo-text");
      const hrdateText = document.querySelector("#hrdate-text");
      const hrentryText = document.querySelector("#hrentry-text");
      const bHR = document.querySelector("#bigHR");

      let field1Valuehr = data.feeds[Nresult - 1].field1;
      if (field1Valuehr === null) {
        for (let i = Nresult - 1; i >= 0; i--) {
          if (data.feeds[i].field1 !== null) {
            latestNonNullFieldc1 = data.feeds[i].field1;
            break;
          }
        }
        field1Valuehr = latestNonNullFieldc2 !== null ? latestNonNullFieldc2 : "No data available";
      }
      const hrdateValue = new Date(data.feeds[Nresult - 1].created_at).toLocaleString(
        "en-US",
        { timeZone: "Asia/Bangkok" }
      );
      const hrtotalEntry = data.channel.last_entry_id;

      hrdateText.textContent = `HR Date and time: ${hrdateValue}`;
      hrentryText.textContent = `HR Total Entry: ${hrtotalEntry}`;
      hrText.textContent = `Latest HR reading: ${field1Valuehr}`;
      bHR.textContent = `${field1Valuehr}`;
    })
    .catch((error) => console.error(error));
}

// Update data every 5 seconds
setInterval(fetchData, 1000);
