fetchData();
const form = document.getElementById("popupForm");
const popup = document.getElementById("popup");
const modal = document.getElementById("myModal");
const btn = document.getElementById("hstBtn");
const span = document.getElementsByClassName("close")[0];
const pbtn = document.getElementById("popBtn");
const showHistBtn = document.getElementById("hstBtn");
const submitButton = document.getElementById("submitButton");
submitButton.addEventListener("click", handleSubmit);
showHistBtn.addEventListener("click", updateTableOnClick(5));
const coverpopup = document.getElementById("cover-popup");

function openForm() {
  form.style.display = "block";
}

function closeForm() {
  form.style.display = "none";
}

btn.onclick = function () {
  modal.style.display = "block";
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
  window.addEventListener("resize", function() {
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
  console.log(`You entered: ${input}`);
  if (input === "") {
    return;
  }
  updateTableOnClick(input);
}

// Update the history table
function updateTable(data) {
  const table = document.getElementById("hisTable");
  // Clear existing rows from the table
  while (table.rows.length > 1) {
    table.deleteRow(-1);
  }

  // Populate the table with the updated data in reverse order
  for (let i = data.length - 1; i >= 0; i--) {
    const row = table.insertRow(-1);
    const nCell = row.insertCell(0);
    const dateCell = row.insertCell(1);
    const valueCell = row.insertCell(2);
    const dateValue = new Date(data[i].created_at).toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    });
    const value = data[i].field1;

    dateCell.innerHTML = dateValue;
    valueCell.innerHTML = value;
    nCell.innerHTML = data.length - i;
  }
}

function updateTableOnClick(length) {
  const history_url = `https://thingspeak.com/channels/2041387/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=${length}&type=line`;
  const hisIframe = document.getElementById("history-iframe");
  hisIframe.setAttribute("src", history_url);

  const hist_data_url = `https://api.thingspeak.com/channels/2041387/feeds.json?results=${length}`;
  fetch(hist_data_url)
    .then((response) => response.json())
    .then((data) => {
      updateTable(data.feeds);
    })
    .catch((error) => console.error(error));
}

// Update the data
function fetchData() {
  // ThingSpeak API URL
  const channelId = "2041387";
  const Nresult = 128;

  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?results=${Nresult}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const totalEntry = data.channel.last_entry_id;
      const field1Value = data.feeds[Nresult - 1].field1;
      const dateValue = new Date(data.feeds[0].created_at).toLocaleString(
        "en-US",
        { timeZone: "Asia/Bangkok" }
      );

      const infoText = document.querySelector("#info-text");
      const dateText = document.querySelector("#date-text");
      const entryText = document.querySelector("#entry-text");
      const downloadBtn = document.querySelector(".download-btn");
      const statusText = document.querySelector("#status-text");
      const jsonData = JSON.stringify(data);
      const blob = new Blob([jsonData], { type: "application/json" });

      // create a download link for the Blob object
      downloadBtn.href = URL.createObjectURL(blob);
      downloadBtn.download = "iv_data.json";

      infoText.textContent = `Latest IV reading: ${field1Value}`;
      dateText.textContent = `Date and time: ${dateValue}`;
      entryText.textContent = `Total Entry: ${totalEntry}`;

      if (field1Value >= 25) {
        statusText.textContent = "Status: normal";
      } else {
        statusText.textContent = "Status: low";
      }
      // updateTable(data.feeds);
    })
    .catch((error) => console.error(error));
}
// Update data every 5 seconds
setInterval(fetchData, 5000);
