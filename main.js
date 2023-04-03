// Selectors
const baseMap = document.querySelector("#selectbox");
const searchbox = document.querySelector("#place");
const radiustb = document.querySelector("#radius");
const submitBtn = document.querySelector("#submit");
const searchForm = document.querySelector("form");
const searchList = document.querySelector("#results-list");
const searchDiv = document.querySelector(".search-results");
var clearbtn = document.querySelector("#clear");
// default date values
let enddate = new Date(); //Today's date
let startdate = new Date(new Date().setDate(enddate.getDate() - 30)); //30 days ago
let startdatevalue = startdate.toISOString().slice(0, 10);
let enddatevalue = enddate.toISOString().slice(0, 10);
document.querySelector("#startdate").value = startdatevalue;
document.querySelector("#enddate").value = enddatevalue;
// Globals
let radius;
let timer;
let pinLocation;
let placeFeature;
///

///
// ---------------------North Button------------------------
class RotateNorthControl extends ol.control.Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};
    const button = document.createElement("button");
    button.innerHTML = "N";
    const element = document.createElement("div");
    element.className = "rotate-north ol-unselectable ol-control";
    element.appendChild(button);
    super({
      element: element,
      target: options.target,
    });
    button.addEventListener("click", this.handleRotateNorth.bind(this), false);
  }
  handleRotateNorth() {
    this.getMap().getView().setRotation(0);
  }
}
const Nbtn = new RotateNorthControl();
//////////------------------Map and Base Maps-------------------////////////////////
// Intial openlayer map
const map = new ol.Map({
  controls: ol.control.defaults
    .defaults()
    .extend([new ol.control.FullScreen()]),
  target: "map",
  view: new ol.View({
    center: [3600000, 3000000],
    zoom: 5,
  }),
  layers: [],
});
const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: true,
  title: "OSM",
  layerName: "OSMbase",
  layerType: "base",
});
const worldImagery = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
  }),
  visible: false,
  title: "Esri",
  layerName: "ESRIbase",
  layerType: "base",
});
const natGeoLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://services.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
  }),
  visible: false,
  title: "NatGeo",
  layerName: "NATGEObase",
  layerType: "base",
});
const pinLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  layerName: "pinLayer",
});
map.addLayer(osmLayer);
map.addLayer(worldImagery);
map.addLayer(natGeoLayer);
map.addLayer(pinLayer);

// ---------------------Controls----------------------////
// Zoom Control
const zoomslider = new ol.control.ZoomSlider();
map.addControl(zoomslider);
// Rotate Controls-----------------Rotate Right-------------------------
var button = document.createElement("button");
button.innerHTML = "R";
var handleRotateRight = function (e) {
  var rotation = map.getView().getRotation();
  map.getView().setRotation(rotation + Math.PI / 6);
};
button.addEventListener("click", handleRotateRight);
var element = document.createElement("div");
element.className = "rotate-right ol-control"; // taking style of defult conrols ol-conrol
element.appendChild(button);
var RotateRightControl = new ol.control.Control({
  //creating new control
  element: element,
});

////-------------------------------Rotate Left------------------------------------------
var buttn = document.createElement("button");
buttn.innerHTML = "L";
var handleRotateLeft = function (e) {
  var rot = map.getView().getRotation();
  map.getView().setRotation(rot - Math.PI / 6);
};
buttn.addEventListener("click", handleRotateLeft, false);
var elm = document.createElement("div");
elm.className = "rotate-left ol-unselectable ol-control";
elm.appendChild(buttn);
var RotateLeftControl = new ol.control.Control({
  element: elm,
});
map.addControl(RotateLeftControl);
map.addControl(RotateRightControl);
map.addControl(Nbtn);

////////////functions//////////////
//---------> to shortn the name in the search options-------
function shortNameMaking(str) {
  const parts = str.split(",");
  const result = parts.slice(0, 2).concat(parts[parts.length - 1]);
  return result.join(",");
}

// Function to handle dropdown list item click that puts a pin on selected location
function clickPlaceListHandler(e, features) {
  let id = e.target.id;
  placeFeature = features.find((feature) => feature.properties.osm_id == id);
  searchbox.value = placeFeature.properties.display_name;
  searchList.innerHTML = "";
  let pinSrc = "imgs/earthQuakespin.png";
  let coords = epsg4326to3857(placeFeature.geometry.coordinates);
  let popUpContent = placeFeature.properties.display_name
    .split(",")
    .join("<br>");
  map.getView().animate({ zoom: 5 }, { center: coords });
  showPopup(coords, popUpContent, true, pinSrc);
}

// Function for fetching geocoding data depending on user text input
async function getGeocondingData(searchInput) {
  return fetch(
    "https://nominatim.openstreetmap.org/search?q=" +
      searchInput +
      "&format=geojson"
  )
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
}

// Function to show popUp on hover and adds overlay
const pppcontainer = document.createElement("div");
function showPopup(coordinates, popupContent, isPin, pinSrc) {
  let layerType;
  let container;
  const popup = document.createElement("div");
  popup.innerHTML = popupContent;
  popup.classList.add("popup-content");

  if (isPin) {
    let pinPopUpContainer = document.createElement("div");
    container = pinPopUpContainer;
    const pin = document.createElement("img");
    pin.src = pinSrc;
    pin.classList.add("pin-image");
    container.appendChild(pin);
    layerType = "pinPopUp";
  } else {
    container = pppcontainer;
    container.innerHTML = "   ";
    layerType = "pointPopUp";
  }
  container.classList.add("popup-container");
  container.appendChild(popup);
  const overlay = new ol.Overlay({
    position: coordinates,
    element: container,
    layerType: layerType,
  });
  map.addOverlay(overlay);

  // hover popup on mouse events
  let isHovering = false;
  container.addEventListener("mouseover", () => {
    isHovering = true;
    popup.style.display = "block";
  });
  container.addEventListener("mouseout", () => {
    isHovering = false;
    popup.style.display = "none";
  });
  map.on("click", () => {
    if (!isHovering) {
      popup.style.display = "none";
    }
  });
}

// Function to handle search queries and fetch city data
function getLocationByCoords(coordsLonLat4326) {
  let coordsLatLon4326 = [coordsLonLat4326[1], coordsLonLat4326[0]];
  console.log(coordsLatLon4326);
  let pinSrc = "imgs/mouseclickpin.png";
  var apiKey = "c3c9deea645a4d38b38b68e2a8203c71";
  var url;
  url =
    "https://api.opencagedata.com/geocode/v1/json?q=" +
    coordsLatLon4326[0] +
    "+" +
    coordsLatLon4326[1] +
    "&key=" +
    apiKey;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      var result = data.results[0];
      popup_data = [
        result.components.continent,
        result.components.country,
        result.components.province,
        result.components.county,
        result.components.town,
        result.components.postcode,
        result.components.district,
        result.components.region,
        result.components.state,
        result.components.village,
        result.components.road,
      ]
        .filter((prop) => prop != null)
        .join("<br>");
      var coordsLonLat3857 = epsg4326to3857([
        coordsLonLat4326[0],
        coordsLonLat4326[1],
      ]);

      map.getView().animate({ center: coordsLonLat3857, zoom: 5 });
      showPopup(coordsLonLat3857, popup_data, true, pinSrc);
      creatClusterLayerOfEarthquake(
        coordsLonLat4326[0],
        coordsLonLat4326[1],
        radius
      );
    });
}

// Function to transfrom coords from Web Merctaor to WGS84 >>>No use
function epsg3857to4326(coordinates) {
  return ol.proj.transform(coordinates, "EPSG:3857", "EPSG:4326");
}
// Function to transfrom coords from Web Merctaor to WGS84 >>>No use
function epsg4326to3857(coordinates) {
  return ol.proj.transform(coordinates, "EPSG:4326", "EPSG:3857");
}

// Function to create point features of the locations retrived from the api
function creatFeaturesOfEarthquake(listOfEarthquake) {
  let listFeaturesOfEarthquake = [];
  listOfEarthquake.forEach((feature) => {
    let title = feature.properties.title;
    let lon = feature.geometry.coordinates[0];
    let lat = feature.geometry.coordinates[1];
    let place = feature.properties.place;
    let mag = feature.properties.mag;
    let url = feature.properties.url;
    let magType = feature.properties.magType;
    // let distancs = feature.properties.distance;
    let featurePoint = new ol.Feature({
      geometry: new ol.geom.Point(epsg4326to3857([lon, lat])),
      title,
      place,
      mag,
      url,
      magType,
    });
    listFeaturesOfEarthquake.push(featurePoint);
  });
  return listFeaturesOfEarthquake;
}

// Function to call the api and add the points layer to the map
async function creatClusterLayerOfEarthquake(lon, lat, rad) {
  let startDate = document.querySelector("#startdate").value;
  let endDate = document.querySelector("#enddate").value;
  let mag = document.querySelector("#mag").value;
  let res = fetch(
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=
      ${lat}&longitude=${lon}&starttime=${startDate}&endtime=${endDate}&maxradiuskm=${rad}&minmagnitude=${mag}`
  )
    .then((res) => {
      console.log(res);
      return res.json();
    })
    .then((data) => {
      let listFeaturesOfEarthquake = creatFeaturesOfEarthquake(data.features);
      let earthquakeVectorSource = new ol.source.Vector({
        features: listFeaturesOfEarthquake,
      });
      earthquakeVectorSource.set("layerName", "earthquakeVectorSource");
      const clusterSourceOfEarthquake = new ol.source.Cluster({
        distance: 100,
        minDistance: 10,
        source: earthquakeVectorSource,
      });
      clusterSourceOfEarthquake.set("layerName", "clusterSource");
      let earthqauakePointLayer = new ol.layer.Vector({
        source: earthquakeVectorSource,
        layerName: "earthquakePointLayer",
        layerType: "point",
        visible: false,
        style: function (feature) {
          let pointMag = feature.values_.mag;
          let color = "#3399CC";
          if (pointMag < 4) {
            color = "rgb(0, 128, 0,.4)";
          } else if (pointMag < 6) {
            color = "rgb(255, 255, 0, 0.4)";
          } else {
            color = "rgb(255, 0, 0,.4)";
          }
          style = new ol.style.Style({
            image: new ol.style.Circle({
              radius: 10,
              stroke: new ol.style.Stroke({
                color: "black",
              }),
              fill: new ol.style.Fill({
                color: color,
              }),
            }),
            // text: new ol.style.Text({
            //   text: "" + pointMag,
            //   fill: new ol.style.Fill({
            //     color: "black",
            //   }),
            // }),
          });
          return style;
        },
      });
      let earthquakeClusterLayer = new ol.layer.Vector({
        visible: true,
        source: clusterSourceOfEarthquake,
        layerNmae: "earthquakeClusterLayer",
        layerType: "cluster",
        style: function (source) {
          let sumMag = 0;
          features = source.get("features");
          features.forEach((feat) => {
            sumMag += +feat.values_.mag;
          });

          let avgMag = (sumMag / features.length).toFixed(1);
          let color = "#3399CC";
          if (avgMag < 4) {
            color = "rgb(0, 128, 0,.4)";
          } else if (avgMag < 6) {
            color = "rgb(255, 255, 0, 0.4)";
          } else {
            color = "rgb(255, 0, 0,.4)";
          }
          style = new ol.style.Style({
            image: new ol.style.Circle({
              radius: 15,
              stroke: new ol.style.Stroke({
                color: "#fff",
              }),
              fill: new ol.style.Fill({
                color: color,
              }),
            }),
            text: new ol.style.Text({
              text: "" + avgMag,
              fill: new ol.style.Fill({
                color: "black",
              }),
            }),
          });
          return style;
        },
      });
      const heatblur = document.getElementById("heatblur");
      const heatradius = document.getElementById("heatradius");
      const distanceInput = document.getElementById("distance");
      const minDistanceInput = document.getElementById("min-distance");
      let earthquakeHeatLayer = new ol.layer.Heatmap({
        visible: false,
        source: earthquakeVectorSource,
        blur: parseInt(heatblur.value, 10),
        radius: parseInt(heatradius.value, 10),
        weight: function (feature) {
          let pointMag = feature.values_.mag;
          return pointMag;
        },
        layerType: "heat",
      });
      // Event listeners for heat map controls
      heatblur.addEventListener("input", function () {
        earthquakeHeatLayer.setBlur(parseInt(heatblur.value, 10));
      });
      heatradius.addEventListener("input", function () {
        earthquakeHeatLayer.setRadius(parseInt(heatradius.value, 10));
      });
      // Event listeners for cluster map controls
      distanceInput.addEventListener("input", function () {
        clusterSourceOfEarthquake.setDistance(
          parseInt(distanceInput.value, 10)
        );
      });
      minDistanceInput.addEventListener("input", function () {
        clusterSourceOfEarthquake.setMinDistance(
          parseInt(minDistanceInput.value, 10)
        );
      });
      map.addLayer(earthquakeHeatLayer);
      map.addLayer(earthquakeClusterLayer);
      map.addLayer(earthqauakePointLayer);
      layerTypeSelector();
    });
}

// Function that draws geodesic circle buffer feature and add map layer
function drawCircleBuffer(coordinates, radius) {
  radius = document.querySelector("#radius").value;
  if (radius === "") {
    radius = 1000;
  }
  radius = radius * 1000;
  let createGeodesicCircleFeature = function (center, radius) {
    // Transform center to Geodesic
    const newCenter = epsg3857to4326(center);
    // Create circular (Spherical) polygon geometry with 360 vertices
    const circularPolygonGeometry = ol.geom.Polygon.circular(
      newCenter,
      radius,
      360 // optional number of sides to approximate the circle
    );
    // Transform output polygon coordinates to WebMercator
    circularPolygonGeometry.transform("EPSG:4326", "EPSG:3857");
    // Create a feature with the circular polygon geometry
    const circularPolygonFeature = new ol.Feature({
      geometry: circularPolygonGeometry,
    });
    // Return feature of circualr polygon
    return circularPolygonFeature;
  };

  // Create geodesic circle feature
  let geodesicCircleFeature = createGeodesicCircleFeature(coordinates, radius);
  // Create a vector layer to show geodesic circle feature
  let geodesicLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [geodesicCircleFeature],
    }),
    layerName: "geodesicLayer",
  });
  // Add geodesic layer to the map
  map.addLayer(geodesicLayer);
  bufferSwitcher();
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

////////////////------------------Measurements--------------/////////////////
let draw;
let sketch;

// Source for measurement vectors
let mSource;

// Creating measuremnet vector layer
let mLayer;

// Line String formatting
const formatLength = function (line) {
  const length = ol.sphere.getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + " " + "km";
  } else {
    output = Math.round(length * 100) / 100 + " " + "m";
  }
  return output;
};

// Polygon formatting
const formatArea = function (polygon) {
  const area = ol.sphere.getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
  } else {
    output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
  }
  return output;
};

// Function to start draw interactions
function changeInteraction() {
  mSource = new ol.source.Vector();

  // Creating measuremnet vector layer
  mLayer = new ol.layer.Vector({
    source: mSource,
    style: {
      "stroke-color": "blue",
      "stroke-width": 1,
    },
  });
  map.addLayer(mLayer);
  map.removeInteraction(draw);
  let type = document.getElementById("type").value;
  if (type === "area") {
    type = "Polygon";
  } else if (type === "length") {
    type = "LineString";
  } else {
    return;
  }
  draw = new ol.interaction.Draw({
    source: mSource,
    type: type,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(255, 255, 255, 0.2)",
      }),
      stroke: new ol.style.Stroke({
        color: "rgba(0, 0, 240, 0.5)",
        lineDash: [10, 10],
        width: 2,
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 240, 0.7)",
        }),
        fill: new ol.style.Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
      }),
    }),
  });
  map.addInteraction(draw);
  createMeasureTooltip();

  //start measuring with draw
  let listener;
  draw.on("drawstart", function (evt) {
    // set sketch
    sketch = evt.feature;

    let tooltipCoord = evt.coordinate;

    listener = sketch.getGeometry().on("change", function (evt) {
      const geom = evt.target;
      let output;
      if (geom instanceof ol.geom.Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof ol.geom.LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltipElement.style =
        "color:black;border: 1px solid black;background-color: white;border-radius: 5px 5px 5px 5px;padding: 2px;";
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  //setting measure on line end
  draw.on("drawend", function () {
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
  });
}

//create new measure tool tip
let measureTooltipElement;
let measureTooltip;
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement("div");
  measureTooltipElement.style =
    "border: 1px solid black;background-color: white;border-radius: 5px 5px 5px 5px;padding: 2px;";
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: "bottom-center",
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
}

///////---------------Events Listners and handlers-----------------//////

// Measure Handlers for tyep change and checkbox
document.getElementById("type").addEventListener("change", changeInteraction);
document
  .querySelector("#drawormeasure")
  .addEventListener("click", function (e) {
    if (e.target.checked) {
      document.getElementById("type").value = "choose";
      changeInteraction();
      document.querySelector(".measuregroup").style.display = "None";
    } else {
      document.querySelector(".measuregroup").style.display = "block";
    }
  });

// Event Handler for clear button
clearbtn.addEventListener("click", (e) => {
  // let layers = map.getLayers();
  let layers = [...map.getLayers().getArray()];
  let overlays = [...map.getOverlays().getArray()];
  // pinLayer.getSource().clear();
  overlays.forEach((layer) => {
    map.removeOverlay(layer);
  });
  layers.forEach((layer) => {
    if (layer.getProperties().layerType !== "base") {
      map.removeLayer(layer);
    }
  });
  if (!document.querySelector("#drawormeasure").checked) {
    changeInteraction();
  }
});
// Searchbox event handler to display locations suggestions
searchbox.addEventListener("input", (e) => {
  let text = e.target.value;
  clearTimeout(timer);
  timer = setTimeout(() => {
    let dataPromise = getGeocondingData(text);
    dataPromise.then((data) => {
      searchList.innerHTML = "";
      searchDiv.style.display = "block";
      data.features.slice(0, 5).forEach((f) => {
        let name = f.properties.display_name;
        let li = document.createElement("li");
        li.style.listStyle = "none";
        // li.style.padding = "7px"; //new-----
        li.innerHTML = "<br>" + shortNameMaking(name) + "<br>"; //-------> new
        li.id = f.properties.osm_id;
        //--------------------hover list hand-------------
        // hover on list
        li.addEventListener("mouseover", () => {
          li.style.cursor = "pointer";
          li.style.backgroundColor = "lightgray";
          li.style.transition =
            "transform .25s ease-in-out, background-color .25s ease-in-out";
        });
        li.style.borderRadius = "20px";
        li.addEventListener("mouseout", () => {
          li.style.backgroundColor = "";
        });

        li.addEventListener("click", (e) =>
          clickPlaceListHandler(e, data.features)
        );
        searchList.append(li);
      });
    });
  }, 500);
});

// Form event handler for submit action
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  radius = radiustb.value;
  let coordsLonLat4326 = placeFeature.geometry.coordinates;
  let coordsLonLat3857 = epsg4326to3857(placeFeature.geometry.coordinates);
  creatClusterLayerOfEarthquake(
    coordsLonLat4326[0],
    coordsLonLat4326[1],
    radius
  );
  drawCircleBuffer(coordsLonLat3857, radius);
});

// Map click event handler that search by click coordinates
map.on("click", function (event) {
  if (document.querySelector("#drawormeasure").checked) {
    var coordinates = event.coordinate;
    console.log(coordinates);
    let geoCoords = epsg3857to4326(coordinates);

    //---------------Handel rotation of the globe---------
    if (geoCoords[0] < -180) {
      while (geoCoords[0] < -180) {
        geoCoords[0] = geoCoords[0] + 360;
      }
      getLocationByCoords(geoCoords);
    } else if (geoCoords[0] > 180) {
      while (geoCoords[0] > 180) {
        geoCoords[0] = geoCoords[0] - 360;
      }
      getLocationByCoords(geoCoords);
    } else {
      getLocationByCoords(geoCoords);
    }
    radius = document.querySelector("#radius").value;
    if (radius === "") {
      radius = 1000;
    }
    let projCoordinates = epsg4326to3857(geoCoords);
    drawCircleBuffer(projCoordinates, radius);
  }
});

// Handler for basemap change >>>>>>>>>>>>>>>>> TO DO
const baseMapSelector = document.querySelector(".basemapselector");
baseMapSelector.addEventListener("change", function (e) {
  const mapTitle = e.target.value;
  const baseMaps = [osmLayer, natGeoLayer, worldImagery];
  baseMaps.forEach((base) => {
    if (base.getProperties().title === mapTitle) {
      base.setVisible(true);
    } else {
      base.setVisible(false);
    }
  });
});

// Handler for map type change
document
  .querySelectorAll('input[name="layerselector"]')
  .forEach((elem) => elem.addEventListener("change", layerTypeSelector));
// Function to handle default layer type drawing (point, cluster,heat)
function layerTypeSelector() {
  document.querySelectorAll('input[name="layerselector"]').forEach((radio) => {
    if (radio.checked) {
      const layerToShow = radio.value;
      // const layerToRemove = layerToShow === "point" ? "cluster" : "point";
      const layers = [...map.getLayers().getArray()];
      layers.forEach((layer) => {
        if (layer.getProperties().layerType) {
          if (layer.getProperties().layerType === layerToShow) {
            layer.setVisible(true);
          } else {
            if (layer.getProperties().layerType !== "base") {
              layer.setVisible(false);
            }
          }
        }
      });
      if (radio.value === "heat") {
        document.querySelector(".heatmapcontrols").style.display = "block";
      } else {
        document.querySelector(".heatmapcontrols").style.display = "none";
      }
      if (radio.value === "cluster") {
        document.querySelector(".clustermapcontrols").style.display = "block";
      } else {
        document.querySelector(".clustermapcontrols").style.display = "none";
      }
    }
  });
}
// Handler to show point details on hover
map.on("pointermove", function (evt) {
  if (
    document.querySelector("#point").checked &&
    document.querySelector("#drawormeasure").checked
  ) {
    const coordinate = evt.coordinate;
    const pixel = map.getEventPixel(evt.originalEvent);
    const features = map.getFeaturesAtPixel(pixel);
    features.forEach(function (feature) {
      if (feature.getGeometry().getType() === "Point") {
        let popupContent;
        if (feature.values_.features) {
          popupContent =
            "Point holds multiple events. You can use narrower date range.";
        } else {
          const mag = feature.values_.mag;
          const magType = feature.values_.magType;
          const title = feature.values_.title;
          const url = feature.values_.url;
          const place = feature.values_.place;
          popupContent = `${title}<br>Magnitude: ${mag}<br>Magnitude Type: ${magType}<br>Place: ${place}<br>URL:<a href="${url}">Event Link</a>`;
        }
        showPopup(coordinate, popupContent, false);
      }
    });
  }
});
// Handler to show or hide buffer layers
document
  .querySelector("#bufferswitcher")
  .addEventListener("change", bufferSwitcher);
function bufferSwitcher() {
  let layers = [...map.getLayers().getArray()];
  if (document.querySelector("#bufferswitcher").checked) {
    layers.forEach((layer) => {
      if (layer.getProperties().layerName === "geodesicLayer") {
        layer.setVisible(true);
      }
    });
  } else {
    layers.forEach((layer) => {
      if (layer.getProperties().layerName === "geodesicLayer") {
        layer.setVisible(false);
      }
    });
  }
}
// Functions to handle mis-choice of start and end dates
function dateStrToObj(dateStr) {
  const [year, month, date] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, date);
}

function onDateChange() {
  const startDateStr = document.querySelector("#startdate").value;
  const endDateStr = document.querySelector("#enddate").value;

  if (!startDateStr || !endDateStr) return;

  const startDate = dateStrToObj(startDateStr);
  const endDate = dateStrToObj(endDateStr);
  if (endDate.valueOf() < startDate.valueOf()) {
    alert("End date is before start date!");
  }
}
for (const dateInput of document.querySelectorAll("input[type=date]")) {
  dateInput.addEventListener("change", onDateChange);
}
