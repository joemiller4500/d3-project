function setGaugeTrace(){
  var trace = [{
    domain: { x: [0, 1], y: [0, 1] },
    title: {text: "Bar Rating"},
    type: "indicator",
    mode: "gauge+number+delta",
    gauge: {
      axis: { range: [0, 5]},
      bar: { color: "lightgreen"},
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

function setBubbleTrace(titles, count, avgRating, avgNumRating, layout){
  var size = count.map(c => (Math.sqrt(c) *5))
  console.log(size)
  var trace = [{
    x : avgNumRating,
    y : avgRating,
    text: titles,
    mode: 'markers',
    marker:{
      color : size,
      size: size
    }
  }];
  // return trace;
  Plotly.newPlot("bubble", trace, layout);
}

function createMap(barStations, topBarId, heatArray) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  var streets = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap,
    "Street Map": streets
  };

  var heat = L.heatLayer(heatArray, {
    radius: 30,
    blur: 15
  });

  // Create an overlayMaps object to hold the barStations layer
  var overlayMaps = {
    "All Bars": barStations,
    "Bar Heatmap" : heat,
    "Top bars": topBarId
  };


  // Create the map object with options
  var map = L.map("map-id", {
    center: [37.7749, -122.4194],
    zoom: 12,
    layers: [lightmap,  darkmap, streets, barStations, topBarId, heat]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
    
  //   slider = L.control.slider(function(value) {
  //     console.log(value);
  // }, {
  //   max: 5,
  //   value: 5,
  //   step:0.5,
  //   size: '250px',
  //   orientation:'vertical',
  //   increment: true
  // }).addTo(map);
      
}

function createMarkers(response) {
  console.log(response);

  // Pull the "stations" property off of response.data
  // var stations = response.data.stations;

  // Initialize an array to hold bar markers
  var barMarkers = [];
  gaugeTrace = setGaugeTrace();
  var layout = {
    paper_bgcolor: 'paleturquoise'
  };
  Plotly.newPlot("gauge", gaugeTrace, layout);

  var heatArray = [];
  var cats = [];
  var rats = [];
  var numRats = [];
  var checky = 0
  // Loop through the stations array
  for (var index = 0; index < 995; index++) {
    checky++
    var bar = response[index];
    latLon = [+bar.latitude, +bar.longitude];
    // console.log(checky)
    category = bar.categories;
    rating = bar.rating;
    numRating = bar.review_count;
    // console.log(numRating);
    rats.push(rating);
    numRats.push(numRating);
    // console.log(rating);
    var obj = category.split("'");
    // console.log(obj);
    // console.log(obj[7]);
    cats.push(obj[7])
    if (obj[15]){
      // console.log(obj[15]);
      cats.push(obj[15]);
      rats.push(rating);
      numRats.push(numRating);
    }
    if (obj[23]){
      // console.log(obj[23]);
      cats.push(obj[23]);
      rats.push(rating);
      numRats.push(numRating);
    }
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
      // console.log(update);
      old = curr;
    }

    var icons = L.icon({
      iconUrl: 'glass.png',
      iconSize: [30, 30], // size of the icon
  });

    // For each station, create a marker and bind a popup with the station's name
    var barMarker = L.marker((latLon), {icon: icons})
      .bindPopup("<h3><a target='_blank' href='" + bar.url +"'>Yelp Listing</a> </h3><h3>" + bar.name + "</h3><h3>Rating: " + bar.rating + "</h3><h3>Phone: " + bar.display_phone + "</h3>")
      .on('click',function updateGauge(bar) {
        string = bar.sourceTarget._popup._content;
        // console.log(string)
        bonus = string.split(" ");
        // console.log(bonus);
        var len = bonus.length - 2;
        var slcVal = bonus[len];
        check = slcVal.slice(0,1);
        if (check == "("){
          slcVal = bonus[(len-1)]
        }
        checkB = slcVal.slice(3,4);
        if (checkB == "<"){
          val = slcVal.slice(0,3);
        }
        else {
          val = slcVal.slice(0,1);
        }
        traceUpdate(val);
      })

    barMarkers.push(barMarker);
    
    heatArray.push(latLon);
  }
  var topBars = response.filter(d => d.rating>=4.5);
  console.log(topBars)

  // // Initialize an array to hold top bar markers
  var topBarMarkers = [];
  var checkyA = 0
  // Loop through the stations array
  for (var index = 0; index < 204; index++) {
    var topBar = topBars[index];
    checkyA++
    // console.log(topBar)
    topLatLon = [+topBar.latitude, +topBar.longitude];
    console.log(topLatLon)
    console.log(checkyA)
    
    var topIcons = L.icon({
      iconUrl: 'star.png',
      iconSize: [24, 24], // size of the icon
  }); 

    // For each station, create a marker and bind a popup with the station's name
    var topBarMarker = L.marker((topLatLon), {icon: topIcons})
    .bindPopup("<h3><a target='_blank' href='" + topBar.url +"'>Yelp Listing</a> </h3><h3>" + topBar.name + "</h3><h3>Rating: " + topBar.rating + "</h3><h3>Phone: " + topBar.display_phone + "</h3>")
    .on('click',function updateGauge(bar) {
      string = bar.sourceTarget._popup._content;
      console.log(string)
      bonus = string.split(" ");
      console.log(bonus);
      var len = bonus.length - 2;
      var slcVal = bonus[len];
      check = slcVal.slice(0,1);
      if (check == "("){
        slcVal = bonus[(len-1)]
      }
      checkB = slcVal.slice(3,4);
      if (checkB == "<"){
        val = slcVal.slice(0,3);
      }
      else {
        val = slcVal.slice(0,1);
      }
      traceUpdate(val);
    })
    

  //     // .fire(updateGauge(bar.rating));
  //   // Add the marker to the topBarMarkers array
    topBarMarkers.push(topBarMarker);
  }

  // Create a layer group made from the bar markers array, pass it into the createMap function
  console.log(heatArray)
  createMap(L.layerGroup(barMarkers), L.layerGroup(topBarMarkers),heatArray)
  // console.log(cats);
  // var result = cats.reduce( (acc, o) => (acc[o.name] = (acc[o.name] || 0)+1, acc), {} );
  // console.log(result);
  // sorted = result.sort();
  // console.log(sorted)
  // console.log(cats.sort())
  var keyedRatings = cats.map(function(e, i) {
    return[e, rats[i], numRats[i]];
  })
  // console.log(keyedRatings)
  var sortedRatings = keyedRatings.sort(function(a, b) {
    a = a[0];
    b = b[0];
    return a.localeCompare(b);
  });
  console.log(sortedRatings);
  // var sorted = cats.sort();
  // console.log(sorted);
  var prev = sortedRatings[0][0]
  var count = 1;
  var named = [];
  var counted = [];
  var averaged = [];
  var averagedNum = [];
  var ratTot = sortedRatings[0][1];
  var numRatTot = sortedRatings[0][2];
  var ratTotCount = 0;
  for (var index = 0; index < sortedRatings.length; index++){
    // console.log(sortedRatings[index][0])
    if (sortedRatings[index][0] == prev){
      count ++;
      ratTotCount++;
      ratTot = ratTot + sortedRatings[index][1];
      numRatTot = numRatTot + sortedRatings[index][2];
    }
    else{
      // console.log(ratTot);
      avg = (ratTot / ratTotCount);
      avgNum = (numRatTot / ratTotCount);
      ratTot = sortedRatings[index][1];
      numRatTot = sortedRatings[index][2];
      named.push(prev);
      counted.push(count);
      averaged.push(avg);
      averagedNum.push(avgNum);
      prev = sortedRatings[index][0];
      count = 1;
      ratTotCount = 1;
    }
  }
  // console.log(named);
  // console.log(counted);
  // console.log(averaged);
  // console.log(averagedNum);
  
  var keyed = named.map(function(e, i) {
    return [e, counted[i], averaged[i], averagedNum[i]];
  });

  console.log(keyed)
  var sortedArray = keyed.sort(function(a, b) {
    return b[1] - a[1];
  });
  console.log(sortedArray);
  titles = sortedArray.map(e => e[0]);
  count = sortedArray.map(e => e[1]);
  avgRating = sortedArray.map(e => e[2]);
  avgNumRating = sortedArray.map(e => e[3]);
  // console.log(titles)
  // circleChart(counted);
  var bubbleTrace = setBubbleTrace(titles, count, avgRating, avgNumRating, layout);
  window.addEventListener('resize', setBubbleTrace(titles, count, avgRating, avgNumRating,layout));
  // Plotly.newPlot("bubble", bubbleTrace, layout);

  var topTitles = []
  var topCounts = []

  for (var index = 0; index < 20; index++) {
    var topTitle = titles[index];
    var topCount = +count[index];
    topTitles.push(topTitle)
    topCounts.push(topCount)
  }
  console.log(topTitles)
  console.log(topCounts)

  new Chart(document.getElementById("bar-chart-horizontal"), {
    type: 'horizontalBar',
    data: {
      labels: topTitles,
      datasets: [
        {
          label: "Number of Bars in Category",
          backgroundColor: ["#5c3cba", "#643cba","#683cba","#6e3cba","#733cba","#773cba","#7b3cba","#7f3cba","#833cba","#8a3cba","#8a3cba","#903cba","#963cba","#9b3cba","#a13cba","#a33cba","#ab3cba","#b23cba","#b83cba","#ba3cb6"],
          data: topCounts
        }
      ]
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: 'SF Bars by Category'
      }
    }
});
  }


// Perform an API call to the Yelp API to get station information. Call createMarkers when complete
d3.json('bars_data_output.json', createMarkers);