"use-strict"

let item = {
    'type': 'found',
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
    document.querySelector('#location').value = '';

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

var map, marker, infowindow, lastAddress;
let buildings = ['Academic Surge', 'Activities & Recreation Center (ARC)', 'Advanced Materials Research Laboratory', 'Aggie Surplus (Bargain Barn) & Custodial', 'Advanced Transportation Infrastructure Research Center', 'Agriculture Field Station', 'Agriculture Service Office', 'Animal Husbandry Beef Barn', 'Animal Husbandry Feed Scales', 'Animal Husbandry Sheep', 'Animal Resource Service V (AH Goat)', 'Animal Resources Service Headquarters', 'Animal Science Horse Barn', 'Animal Sciences Teaching Facility 1', 'Animal Sciences Teaching Facility 2', 'Ann E. Pitzer Center', 'Annual Fund Trailer', 'Aquaculture Facility Hatchery', 'Aquatic Biology & Environmental Science Bldg', 'Aquatic Weed Laboratory', 'Arboretum Headquarters (Valley Oak Cottage)', 'Arboretum Teaching Nursery', 'Art Annex', 'Art Building', 'Art Studio-Graduate Building', 'Asmundson Hall', 'Bainer Hall', 'Bike Barn', 'Bowley Plant Science Teaching Facility', 'Briggs Hall', 'California Hall', 'California Raptor Museum', 'Center for Companion Animal Health', 'Center for Comparative Medicine', 'Center for Equine Health', 'Center for Health & Environment Office & Laboratory', 'Center for Neuroscience', 'Center for Vectorborne Diseases, Laboratory', 'Center for Vectorborne Diseases, Main Office', 'Center for Vectorborne Diseases, Staff Offices', "Chancellor's Residence", 'Chemistry', 'Chemistry Annex', 'Civil & Industrial Services', '116 A Street', 'Conference Center & Welcome Center', 'Contained Research Facility', 'Cottonwood Cottage (Temporary Classroom 30)', 'Cowell Building', 'Cruess Hall', 'Dairy', 'Davis 501 Oak Ave', 'Design & Construction Management (DCM)', 'Dutton Hall', 'Earth and Physical Sciences Building', 'Earth & Planetary Sciences Shockwave Lab', 'East House', 'Educational Opportunity Program (EOP)', 'Eichhorn Family House', 'Elderberry Cottage', 'Enology Laboratory Building', 'Environmental Horticulture', 'Environmental Services Facility Headquarters', 'Equestrian Center Covered Arena', 'Everson Hall', 'Facilities Mechanical Operations', 'Facilities Services', 'Facilities Structural Trailer', 'Fire & Police Building', 'Fleet Services Central Garage Campus', 'FOA: 1050 Extension Center Drive', 'FPS Facility (Main Lab & Office)', 'Freeborn Hall', 'Gallagher Hall', 'Gateway Parking Structure', 'Genome & Biomedical Sciences Facility', 'Geotechnical Centrifuge', 'Germplasm Laboratory', 'Ghausi Hall', 'Giedt Hall', 'Gourley Clinical Teaching Center', 'Grounds', 'Music Annex', 'Guilbert House', 'Hangar', 'Hangar Office', 'Haring Hall', 'Harry H. Laidlaw Jr. Honey Bee Research Facility', 'Hart Hall', 'Heitman Staff Learning Center', 'Hickey Gym', 'Hoagland Annex', 'Hoagland Hall', 'Hopkins Building', 'Hopkins Svcs Complex Auxiliary', 'Hopkins Svcs Complex Receiving', 'Human and Community Development Administration', 'Human Resources Administration Building', 'Hunt Hall', 'Hutchison Child Development Center', 'Hutchison Hall', 'Hyatt Place', 'International Center', 'International House', 'Jackson Sustainable Winery', 'John A. Jungerman Hall (formerly Crocker Nuclear Lab)', 'Kemper Hall', 'Kerr Hall', 'King Hall', 'Kleiber Hall', 'Latitude Dining Commons', 'Life Sciences', 'Maddy Lab', 'Manetti Shrem Museum', 'Mann Laboratory', 'Mathematical Sciences Building', 'Meat Laboratory, Cole Facility Building C', 'Medical Sciences 1 B (Carlson Health Sciences Library)', 'Medical Sciences 1 C', 'Medical Sciences 1 D', 'Memorial Union', 'Meyer Hall', 'Mondavi Center for the Performing Arts', 'Mondavi Center for the Performing Arts - Administration', 'Mrak Hall', 'Music Building', 'Nelson Hall (University Club)', 'Neurosciences Building', 'Noel-Nordfelt Animal Science Goat Dairy and Creamery', 'North Hall', 'Olson Hall', 'Orchard House', 'Outdoor Adventures', 'Parsons Seed Certification Center', 'Pavilion at the ARC', 'Peter A. Rock Hall', 'Peter J. Shields Library', 'Pavilion Parking Structure', 'Physical Sciences & Engineering Library', 'Physics Building', 'Plant & Environmental Sciences', 'Plant Reproductive Biology Facility', 'Pomology Field House C', 'Poultry Headquarters', 'Pritchard VMTH', 'Putah Creek Lodge', 'Quad Parking Structure', 'Regan Central Commons', 'Reprographics', 'Robbins Hall', 'Robbins Hall Annex', 'Robert Mondavi Institute Brewery, Winery, and Food Pilot Facility', 'Robert Mondavi Institute - North', 'Robert Mondavi Institute - Sensory', 'Robert Mondavi Institute - South', 'Roessler Hall', 'Schaal Aquatic Center', 'Schalm Hall', 'School of Education Building', 'Sciences Lab Building', 'Sciences Lecture Hall', 'Scrub Oak Hall (Auditorium)', 'Scrubs Cafe', 'Segundo Dining Commons', 'Segundo Services Center', 'Silo', 'Silo South', 'Social Sciences & Humanities', 'Social Sciences Lecture Hall (1100)', 'South Hall', 'Sprocket Annex', 'Sprocket Building', 'Sproul Hall', 'Storer Hall', 'Student Community Center', 'Student Health & Wellness Center', 'Student Housing', 'Surge II', 'Surge IV (TB 200,TB 201,TB 202,TB 203)', 'Swine Teaching and Research Facility', 'TB 009', 'TB 16', 'TB 116', 'TB 117', 'TB 118', 'TB 119', 'TB 120', 'TB 123', 'TB 124', 'TB 140', 'TB 188', 'TB 189', 'TB 206', 'TB 207', 'Temporary Classroom 1', 'Temporary Classrooms 2 & 3', 'Tercero Services Center', 'The Barn', 'The Grove (Surge III)', 'Thermal Energy Storage', 'Thurman Laboratory', 'Toomey Weight Room', 'Transportation and Parking Services', 'Trinchero Family Estates Building', 'Tupper Hall', 'UC Davis Health Stadium East', 'UC Davis Health Stadium North', 'UC Davis Health Stadium North', 'UC Davis Health Stadium West', 'Unitrans Maintenance Facility', 'University Extension Building', 'University House & Annex', 'University Services Building', 'Urban Forestry', 'Utilities Headquarters', 'Valley Hall', 'Veihmeyer Hall', 'Vet Med 3A', 'Vet Med 3A - MPT', 'Vet Med 3B', 'Vet Med Equine Athletic Performance Lab', 'Vet Med Laboratory Facility Large Animal Holding', 'Veterinary Medicine 2', 'Veterinary Medicine Student Services and Administrative Center', 'Veterinary Genetics Lab', 'Viticulture Relocation C', 'Voorhies Hall', 'Walker Hall', 'Walnut Cottage', 'Walter A. Buehler Alumni Center', 'Water Science & Engineering Hydraulic L2', 'Watershed Science Facility', 'Wellman Hall', 'West House', 'Western Center for Agricultural Equipment', 'Western Human Nutrition Research Center (WHNRC)', 'Wickson Hall', 'Willow Cottage', 'Wright Hall', 'Wyatt Deck', 'Wyatt Pavilion', 'Young Hall', 'Young Hall Annex'];


function moveMarker() {
  marker.setPosition(infowindow.getPosition());
  infowindow.open(map, marker);
  infowindow.close();
  console.log('before', item.location);
  document.getElementById('location').value = lastAddress;
  item.location = lastAddress;
  console.log('after', item.location);
}

function moveSearchMarker() {
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
      lastAddress = name + ", " + address;
      item.location = lastAddress;
      
      marker.setPosition(location);
      marker.setMap(map);
      map.setCenter(location);
      
      moveSearchMarker();
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


//====================================== AUTOCOMPLETE TEST CODE BELOW =========================================================


function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
              document.getElementById('fakeBtn').click();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
        document.getElementById('fakeBtn').click();
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
autocomplete(document.getElementById("location"), buildings);