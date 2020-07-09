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
      color : titles,
      size: size
    }
  }];
  // return trace;
  Plotly.newPlot("bubble", trace, layout);
}


// function circleChart(data){
//   console.log(data);

//   var margin = {top: 10, right: 10, bottom: 10, left: 10},
//       width = 460 - margin.left - margin.right,
//       height = 460 - margin.top - margin.bottom,
//       innerRadius = 80,
//       outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

//   // append the svg object to the body of the page
//   var svg = d3.select("#circle")
//     .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//       .attr("transform", "translate(" + width / 2 + "," + ( height/2+100 )+ ")"); // Add 100 on Y translation, cause upper bars are longer

//     // X scale
//     var x = d3.scaleBand()
//         .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
//         .align(0)                  // This does nothing ?
//         .domain( data.map(function(d) { return d.Country; }) ); // The domain of the X axis is the list of states.

//     // Y scale
//     var y = d3.scaleRadial()
//         .range([innerRadius, outerRadius])   // Domain will be define later.
//         .domain([0, 10000]); // Domain of Y is from 0 to the max seen in the data

//     // Add bars
//     svg.append("g")
//       .selectAll("path")
//       .data(data)
//       .enter()
//       .append("path")
//         .attr("fill", "#69b3a2")
//         .attr("d", d3.arc()     // imagine your doing a part of a donut plot
//             .innerRadius(innerRadius)
//             .outerRadius(function(d) { return y(d['Value']); })
//             .startAngle(function(d) { return x(d.Country); })
//             .endAngle(function(d) { return x(d.Country) + x.bandwidth(); })
//             .padAngle(0.01)
//             .padRadius(innerRadius))

// }

// function bubbleChart(labels,xAxis,yAxis,zAxis){
// 	$("#bubble").CanvasJSChart({
// 		title: {
// 			text: "Bubble Chart"
// 		},
// 		data: [
// 		{
// 			type: "bubble",
// 			toolTipContent: "x: {x} & y: {y} <br/>Size: {z}",
// 			dataPoints: [
//         {x: xAxis, y: yAxis, z: zAxis}
// 			]
// 		}
// 		]
// 	});
// }


// function createCircle(){

//   for (var index = 0; index < 995; index++) {
//     var bar = response[index];

// }


function createMap(bikeStations, heatArray) {

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

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap,
    "Street Map": streets
  };

  var heat = L.heatLayer(heatArray, {
    radius: 30,
    blur: 15
  });

  // Create an overlayMaps object to hold the bikeStations layer
  var overlayMaps = {
    "Bars": bikeStations,
    "Bar Heatmap" : heat
  };


  // Create the map object with options
  var map = L.map("map-id", {
    center: [37.7749, -122.4194],
    zoom: 12,
    layers: [lightmap, streets, bikeStations, heat]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
    
}

function createMarkers(response) {
  console.log(response);

  // Pull the "stations" property off of response.data
  // var stations = response.data.stations;

  // Initialize an array to hold bike markers
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

  // Loop through the stations array
  for (var index = 0; index < 945; index++) {
    var bar = response[index];
    latLon = [+bar.latitude, +bar.longitude];
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

    // console.log(rats)
    // console.log(numRats)
    

    // For each station, create a marker and bind a popup with the station's name
    var barMarker = L.marker(latLon)
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

  // Create a layer group made from the bike markers array, pass it into the createMap function
  // console.log(heatArray)
  createMap(L.layerGroup(barMarkers),heatArray);
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
}

// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
d3.json('bars_data_output.json', createMarkers);
