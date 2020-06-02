"use-strict"

// // Save data to sessionStorage
// sessionStorage.setItem('key', 'value');

// // Get saved data from sessionStorage
// let data = sessionStorage.getItem('key');

// // Remove saved data from sessionStorage
// sessionStorage.removeItem('key');

// // Remove all saved data from sessionStorage
// sessionStorage.clear();

// define variables that reference elements on our page
const submitButton = document.getElementById("submitBtn");

submitButton.addEventListener("click", storeData);

function storeData() {
  let loc = document.getElementById("location").value;
  let cat = document.getElementById("categories").value;
  let des = document.getElementById("search").value;
  
  let startDate = new Date(document.querySelector('#postdate1').value + "T"+ document.querySelector('#posttime1').value + ":00");
  let endDate = new Date(document.querySelector('#postdate2').value + "T"+ document.querySelector('#posttime2').value + ":00");
  
  window.sessionStorage.setItem('startDate', startDate.getTime());
  window.sessionStorage.setItem('endDate', endDate.getTime());
  window.sessionStorage.setItem('type', 'found');
  window.sessionStorage.setItem('location', loc);
  window.sessionStorage.setItem('categories', cat);
  window.sessionStorage.setItem('search', des);
}

setDefaultDates();
function setDefaultDates() {
  // Set date & time option on Page 2 to current date & time
  let date = new Date();
  date.setDate(date.getDate() - 2)
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
      
  month = (month < 10 ? "0" : "") + month;
  day = (day < 10 ? "0" : "") + day;
  hours = (hours < 10 ? "0" : "") + hours;
  minutes = (minutes < 10 ? "0" : "") + minutes;
      
  document.querySelector('#postdate1').value = year + '-' + month + '-' + day;
  document.querySelector('#posttime1').value = hours + ':' + minutes;
  
  
  date = new Date();
  date.setDate(date.getDate() + 2)
  day = date.getDate();
  month = date.getMonth() + 1;
  year = date.getFullYear();
  hours = date.getHours();
  minutes = date.getMinutes();
      
  month = (month < 10 ? "0" : "") + month;
  day = (day < 10 ? "0" : "") + day;
  hours = (hours < 10 ? "0" : "") + hours;
  minutes = (minutes < 10 ? "0" : "") + minutes;
      
  document.querySelector('#postdate2').value = year + '-' + month + '-' + day;
  document.querySelector('#posttime2').value = hours + ':' + minutes;
}


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


