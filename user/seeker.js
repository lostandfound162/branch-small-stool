"use-strict"

let item = {
    'type': 'lost',
    'title': '',
    'category': 'Select Category',
    'desc': '',
    'img': '',
    'date': '',
    'time': '',
    'location': ''
};

// SAVE PAGE 1 FORM DATA
document.querySelector('#nextBtn').addEventListener('click', () => {
    
    // Save Page 1 form values into item
    item.title = document.querySelector('#title').value;
    item.category = document.querySelector('#categories').value;
    item.desc = document.querySelector('#desc').value;

    // Validate all input fields except img filechooser were filled in
    if (!(item.title === '' || item.category === 'Select Category' || item.desc === '')) {
        
        // Switch to Page 2 of the form
        document.querySelector('#pg1').classList.add('hidePage');
        document.querySelector('#pg2').classList.remove('hidePage');

        // Set date & time option on Page 2 to current date & time
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
      
        month = (month < 10 ? "0" : "") + month;
        day = (day < 10 ? "0" : "") + day;
        hours = (hours < 10 ? "0" : "") + hours;
        minutes = (minutes < 10 ? "0" : "") + minutes;
      
        document.querySelector('#postdate').value = year + '-' + month + '-' + day;
        document.querySelector('#posttime').value = hours + ':' + minutes;

        // Output item object for testing purposes
        console.log(item, date.getHours());
    }

    // Ouput messages to inform the client input fields were not filled
    if (item.title === '') { console.log('Title is not specified'); }
    if (item.category === 'Select Category') { console.log('Category is not specified'); }
    if (item.desc === '') { console.log('Description is not specified'); }
});

// UPLOAD IMAGE
document.querySelector('#imgUpload').addEventListener('change', () => {

    // get the file with the file dialog box
    const selectedFile = document.querySelector('#imgUpload').files[0];
    // store image name in JSON item
    item.img = selectedFile.name;
    // store it in a FormData object
    const formData = new FormData();
    formData.append('newImage', selectedFile, selectedFile.name);

    // build an HTTP request data structure
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/uploadImage", true);
    xhr.onloadend = function (e) {
        // Get the server's response to the upload
        console.log(xhr.responseText);
    }

    // actually send the request
    xhr.send(formData);
});

// SUBMIT LOST/FOUND ITEM
document.querySelector('#submitBtn').addEventListener('click', () => {

    // Change Back to Page 1
    document.querySelector('#pg1').classList.remove('hidePage');
    document.querySelector('#pg2').classList.add('hidePage');

    // Save Date and Time into JSON item
  
    let today = new Date(document.querySelector('#postdate').value + "T"+ document.querySelector('#posttime').value + ":00") ;
    
    item.date = today.getTime();
    // item.location = document.querySelector('#location').value;

  
  
  // delete later
  let options = {month: 'long', day: 'numeric', hour: 'numeric'};
  console.log(today.toLocaleDateString('en-US', options), today.getHours(), today.getMinutes());
  
  
    // \/  \/  SEND DATA TO SERVER BELOW  \/  \/

    // new HttpRequest instance 
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", '/saveData');
    // important to set this for body-parser
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    // setup callback function
    xmlhttp.onloadend = function (e) {
        let data = JSON.parse(xmlhttp.responseText);
    }
    // Send off the HTTP request
    xmlhttp.send(JSON.stringify(item));

    // /\  /\  SEND DATA TO SERVER ABOVE  /\  /\

    // RESET Page 1 Form Input Values
    document.querySelector('#title').value = '';
    document.querySelector('#categories').value = 'Select Category';
    document.querySelector('#desc').value = '';
    document.querySelector('#imgUpload').value = '';

    // RESET Item Options After Submitting
    item.title = '';
    item.category = 'Select Category';
    item.desc = '';
    item.img = '';
    item.date = '';
    item.time = '';
    item.location = '';
});

//====================================== MAP TEST CODE BELOW =========================================================
// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBnK3eGzuB5D7htmRXlaLeOpFBrX4oezPI&callback=myMap';
script.defer = true;
script.async = true;

document.head.appendChild(script);

var map, marker, infoWindow, lastAddress;

function moveMarker() {
  console.log('test');
  marker.setPosition(infowindow.getPosition());
  infowindow.open(map, marker);
  infowindow.close();
  document.getElementById('location').value = lastAddress;
  item.location = lastAddress;
}


function search() {
  let input = document.getElementById('location').value;
  let url = "/searchAddress?input=" + input + ",Davis"; // YOU CAN ADD ", Davis" TO SEARCH PLACES IN DAVIS
      
  fetch(url)
  .then(res=>res.json())
  .then(data=>{
    if(data.candidates.length > 0) {
      let address = data.candidates[0].formatted_address;
      let location = data.candidates[0].geometry.location;
      let name = data.candidates[0].name;
      
      document.getElementById('location').value = name + ", " + address;
      
      marker.setPosition(location);
      marker.setMap(map);
      map.setCenter(location);
    }
  });

}

function myMap() {
  // SET MAP PROPERTIES
  var mapProp = {
    center: new google.maps.LatLng(38.5382, -121.7617), // UC DAVIS LOCATION
    zoom: 15, // LARGER IS ZOOM IN
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // INIT MAP
  map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

  // INIT MARKER
  marker = new google.maps.Marker({ position: mapProp.center });
  marker.setMap(map);

  // INIT INFOWINDOW
  infowindow = new google.maps.InfoWindow({
    content: "Click on map to move the marker"
  });

  // SHOW INFOWINDOW RIGHT OVER THE MARKER
  infowindow.open(map, marker);

  // MARKER CLICK EVENT
  google.maps.event.addListener(marker, "click", function() {
    infowindow.open(map, marker);
  });

  // MAP CLICK EVENT (SHOW INFOWINDOW AT WHERE USER CLICKS)
  google.maps.event.addListener(map, "click", function(event) {
    placeInfoWindow(map, event.latLng);
  });

  // MOVE INFOWINDOW TO THE LOCATION
  function placeInfoWindow(map, location) {
    let url = "/getAddress?lat=" + location.lat() + "&lng=" + location.lng();
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // CHANGE INFOWINDOW CONTENT (LIKE A DOM)
        infowindow.setContent(
          '<img style="width:50px; height:50px;"src="https://cdn.worldvectorlogo.com/logos/google-icon.svg"></img>' +
            '<p style="font-weight:700;">' +
            data.results[0].formatted_address +
            "</p>" +
            '<p style="color: grey;">' +
            location.lat().toFixed(6) +
            ", " +
            location.lng().toFixed(6) +
            '</p><button type="button" class="Btn lostBtn" onClick="moveMarker();">Move marker to here</button>'
        );
        infowindow.setPosition(location); // CHANGE INFOWINDOW POSITION
        infowindow.open(map, null); // USE NULL TO SHOW INFOWINDOW AT THE CHOSEN POSITION
      
        lastAddress = data.results[0].formatted_address;
      });
  }
}


// Append the 'script' element to 'head'
document.head.appendChild(script);

// SEARCH KEY PRESSED
function searchKeyPress(e)
{
    // look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13)
    {
        document.getElementById('fakeBtn').click();
        return false;
    }
    return true;
}


