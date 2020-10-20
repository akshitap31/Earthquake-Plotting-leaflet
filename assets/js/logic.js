// Creating map object

var key=API_KEY
var myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5
});
  // Adding tile layer
  L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "light-v10",
    accessToken: key
  }).addTo(myMap);
  
  var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: key
  });
  
  var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: key
  });
  var satelite= L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox/satellite-v9",
    accessToken: key
  });
  var outdoors=L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox/outdoors-v11",
    accessToken: key
  });
  // Only one base layer can be shown at a time
  var baseMaps = {
    Light: light,
    Dark: dark,
    Satelite: satelite,
    Outdoors: outdoors
  }; 

  //Overlays
var earthquakes = L.layerGroup();
var faultlines= L.layerGroup();
// Overlays that may be toggled on or off
var overlayMaps = {
  Earthquake: earthquakes,
  FaultLines: faultlines
};

L.control
  .layers(baseMaps, overlayMaps)
  .addTo(myMap);
  // Functions for plotting
  var earthquakeData=[]
function createCircles(data) {   
        // console.log(data)  
        for(var i=0; i< data["features"].length; i++){
          var earthquake= data["features"][i];
          var coord=earthquake["geometry"]["coordinates"];
          var mag=earthquake.properties.mag;
          // Color conditions
          var color="";
          if (mag <= 1){
            color="#80eb34"
          }
          else if(mag <= 2){
            color="#f0fc7e"
          }
          else if(mag <= 3){
            color="#f5e102"
          }
          else if(mag <= 4){
            color="#f5b20a"
          }
          else if(mag <= 5){
            color="#e86835"
          }
          else {
            color="#e63c30"
          }
          // console.log(coord)
          
          earthquakeData.push(L.circle([coord[1], coord[0]], {
            stroke: true,
            weight: 1,
            fillOpacity: 0.75,
            color: color,
            fillColor: color,
            radius: earthquake["properties"]["mag"]*20000
          }).bindPopup("<h1>" + earthquake.properties.place + "</h1> <hr> <h3>Type: " + earthquake.properties.type + "</h3> <h3>Magnitude: " + mag + "</h3>").addTo(earthquakes))
        }
};
earthquakes.addTo(myMap);
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
      // Adding our geoJSON data, along with style information, to the tectonicplates
      // layer.
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(faultlines);

      // Then add the tectonicplates layer to the map.
      faultlines.addTo(myMap);
    });

// Set up the legend
var color = ["#80eb34", "#f0fc7e", "#f5e102", "#f5b20a", "#e86835", "#e63c30" ];
var legend = L.control({
    position: "bottomright"
});

legend.onAdd = function () {
    mags = [0, 1, 2, 3, 4, 5]
    // creates a div in the html with the class "legend"
    var div = L.DomUtil.create("div", "legend");
    // adds heading to legend
    div.innerHTML = "<h5 class='legend-title'>Magnitude</h5>"
    // adds an item to the legend for each color and what magnitude it represents
    for (var i = 0; i < color.length; i++) {
        div.innerHTML +=
            '<svg class="squares" style="background:' + color[i] + '"></svg>' +
            mags[i] + (mags[i+1] ? '-' + mags[i+1] + '<br>' : '+');
    }
    return div;
};
// Adding legend to the map
legend.addTo(myMap);

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", createCircles)
