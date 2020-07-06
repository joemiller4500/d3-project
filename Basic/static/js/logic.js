function createMap(barsSF) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "SF Bars": barsSF
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [37.7749, -122.4194],
    zoom: 12,
    layers: [lightmap, barsSF]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
}

function createMarkers(response) {
  console.log(response[0].alias);

  // Pull the "stations" property off of response.data
  // var stations = response.data.stations;

  // Initialize an array to hold bike markers
  var barMarkers = [];

  // Loop through the stations array
  for (var index = 0; index < 500; index++) {
    var bar = response[index];
    latLon = [+bar.latitude, +bar.longitude];
    console.log(latLon);
    
    var markers = L.markerClusterGroup();
      // Add a new marker to the cluster group and bind a pop-up
      markers.addLayer(L.marker(latLon)
        .bindPopup(bar.name));

  
    // For each station, create a marker and bind a popup with the station's name
    // var barMarker = L.marker(latLon)
    //   .bindPopup("<h3>" + bar.name + "<h3><h3>Rating: " + bar.rating + "</h3>");

    // // Add the marker to the bikeMarkers array
    barMarkers.push(markers);
  }

  // Create a layer group made from the bike markers array, pass it into the createMap function
  createMap(L.layerGroup(barMarkers));
}


// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
d3.json('bars_data_output.json', createMarkers);
