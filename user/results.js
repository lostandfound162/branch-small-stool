
let listOfItems = []
let item = {
    'type': '',
    //'title': '',
    'category': '',
    //'desc': '',
    //'img': '',
    //'date': '',
    //'time': '',
    'location': '',
    'search': '',
    'start': '',
    'end': '',
};

// let params = new URLSearchParams(document.location.search.substring(1));
// item.type = params.get("type"); 

getData();
getQueryString();

function getData() {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", '/showItems' + getQueryString());
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    // set up callback function that will run when the HTTP response comes back
    xhr.onloadend = function (e) {

        // responseText is a string
        let data = JSON.parse(xhr.responseText);
        listOfItems = data;

        displayData(listOfItems);
    }

    // send off request
    xhr.send(JSON.stringify(item));
}

// PUT ALL DATA ONTO RESULTS SCREEN
function displayData(listOfData) {
    let results = document.querySelector('#results');
    for (let i = 0; i < listOfData.length; i++) {
        results.appendChild(buildItem(listOfData[i], i + 1));
    }
}

// BUILD HTML HIERARCHY FOR ITEM
function buildItem(data, id) {
    // Create Item Pieces
    let container = document.createElement("DIV");
    let title = document.createElement("DIV");
    let expBtn = document.createElement("DIV");
    let expandedView = document.createElement("DIV");
    let table = document.createElement("TABLE");
    let row = null;
    let cell = null;
    let desc = document.createElement("DIV");

    // Create Item Container
    container.id = "item_" + id.toString().padStart(3, "0");
    container.classList.add('item');
    if (item.type === 'lost') {
        container.classList.add('lostItem');
    } else {
        container.classList.add('foundItem');
    }

    // Set Title
    title.classList.add('itemTitle');
    title.textContent = data.title;

    // Set Expanded View Category
    row = table.insertRow(-1);
    cell = row.insertCell(-1);
    cell.classList.add('tableHeader');
    cell.textContent = "Category";
    cell = row.insertCell(-1);
    cell.textContent = data.category;

    // Set Expanded View Location
    row = table.insertRow(-1);
    cell = row.insertCell(-1);
    cell.classList.add('tableHeader');
    cell.textContent = "Location";
    cell = row.insertCell(-1);
    cell.textContent = data.location;

    // Set Expanded View Category
    row = table.insertRow(-1);
    cell = row.insertCell(-1);
    cell.classList.add('tableHeader');
    cell.textContent = "Date";
    cell = row.insertCell(-1);
    cell.textContent = getFormattedDate(data.date);

    // Add table to Expanded View
    expandedView.appendChild(table);

    // Set Expanded View Description
    desc.textContent = data.description;

    // Add Descirption to Expanded View
    expandedView.appendChild(desc);

    // Hide Expanded Content and attach class
    expandedView.classList.add("expandedContent");
    expandedView.style.display = "none";

    // Set Expand Btn
    expBtn.classList.add('expandBtn');
    expBtn.textContent = "More";

    // Add Event Listener for expanding Item Information
    expBtn.addEventListener('click', () => {
        if (container.style.flexDirection == "column") {
            container.style.flexDirection = "row";
            container.querySelector('.expandBtn').textContent = 'More';
            expandedView.style.display = "none";
        } else {
            container.style.flexDirection = "column";
            container.querySelector('.expandBtn').textContent = 'Less';
            expandedView.style.display = "block";
        }
    });

    // Create Item Data Hierarchy
    container.appendChild(title);
    container.appendChild(expandedView);
    container.appendChild(expBtn);

    // return Item
    return container;
}

function getFormattedDate(milliTime) {
  let options = {month: 'long', day: 'numeric', hour: 'numeric'};
  let day = new Date(milliTime);
  
  return day.toLocaleDateString('en-US', options);
}

// Data Store for From Functionality
function getQueryString() {
  
  item.type = window.sessionStorage.getItem('type');
  item.category = window.sessionStorage.getItem('categories');
  item.location = window.sessionStorage.getItem('location');
  item.search = window.sessionStorage.getItem('search');
  item.start = parseInt(window.sessionStorage.getItem('startDate'), 10);
  item.end = parseInt(window.sessionStorage.getItem('endDate'), 10);
  
  console.log("Data to query", item);
  //send request to server here
  
  return `?type=${item.type}&start=${item.start}&end=${item.end}&search=${item.search}&category=${item.category}&location=${item.location}`;
}

