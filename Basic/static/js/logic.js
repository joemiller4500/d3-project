function setGaugeTrace(){
  var trace = [{
    domain: { x: [0, 1], y: [0, 1] },
    title: {text: "Bar Rating"},
    type: "indicator",
    mode: "gauge+number+delta",
    gauge: {
      axis: { range: [0, 5]},
      bar: { color: "grey"},
      borderwidth: 3,
      bordercolor: "black",
      steps: [
        { range: [0, 3], color: "red" },
        { range: [3, 4], color: 'yellow'},
        { range: [4, 5], color: 'green'}
      ]
    }
  }];
  return trace;
}

function createMap(bikeStations) {

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
    "Bike Stations": bikeStations
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [37.7749, -122.4194],
    zoom: 12,
    layers: [lightmap, bikeStations]
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
  gaugeTrace = setGaugeTrace();
  Plotly.newPlot("gauge", gaugeTrace);

  // Loop through the stations array
  for (var index = 0; index < 945; index++) {
    var bar = response[index];
    latLon = [+bar.latitude, +bar.longitude];
    console.log(bar.rating);
    // console.log(latLon);

    // function updateGauge(e) {
    //   val = +e.rating;
    //   console.log(val);
    //   Plotly.restyle("gauge","value", [val]);
    // }
    var old = 0;
    function traceUpdate(curr) {
      var update = {
        reference: old
      }
      Plotly.restyle("gauge","value", [curr]);
      Plotly.restyle("gauge","delta", [update]);
      console.log(update);
      old = curr;
    }
    

    // For each station, create a marker and bind a popup with the station's name
    var barMarker = L.marker(latLon)
      .bindPopup("<h3>" + bar.name + "<h3><h3>Rating: " + bar.rating + "<h3><h3>Phone: " + bar.display_phone + "</h3>")
      .on('click',function updateGauge(bar) {
        console.log(bar);
        string = bar.sourceTarget._popup._content;
        valA = string.slice(-37);
        valB = valA.slice(0,3);
        valC = valB.slice(0,1);
        if (valC == ':'){
          valB = valB.slice(-1);
        }
        valD = string.slice(-6);
        valE = valD.slice(0,1);
        if (valE == ' '){
          valB = string.slice(-23);
          valB = valB.slice(0,3)
          console.log(valB);
          valE = valB.slice(0,1);
          if (valE = ":") {
            valB = valB.slice(-1)
          }
        }
        valB = +valB;
        traceUpdate(valB);
        // Plotly.restyle("gauge","value", [valB]);
      })
      // .fire(updateGauge(bar.rating));
    // Add the marker to the bikeMarkers array
    barMarkers.push(barMarker);
  }

  // Create a layer group made from the bike markers array, pass it into the createMap function
  createMap(L.layerGroup(barMarkers));
}


// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
d3.json('bars_data_output.json', createMarkers);
