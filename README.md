# USGS earthquake data api implementation with Openlayers Library for JS

## About The Project
This projet consists of 3 main parts:
1) Openlayers library
2) USGS API for earthquake data
3) Opencage API & Nominatim API

## About The Project
Try the app on github pages: https://ahmedh7.github.io/USGS-earthquake-data-api-implementation-with-openlayers/

### 1) Openlayers library:
- To provide the mapping services and visulaziation. Openlayers provide a highly customizable and high performance web mapping service.
- For the full documentation: https://openlayers.org/


### 2) USGS API for earthquake Data:
- To provide points data depending on coordintaes obtained form the geocoding services. Data depends mainly on 4 parameters: Coordinates [Lon, Lat] , Minimum magnitude, Search Radius (in KM), Date Range
- We provided the users with the needed parameters to customize the search. Also we provided a click-on-map as well as a search-by-place name search options.

### 3) Opencage API & Nominatim API:
- To provide geocoding services. As we're using free API Keys, these providers support limited requests per tmie unit, so we're using opencage for map-clicking search and Nominatim for place-depndent search. 
- For Opencage, get your free API Key here: https://opencagedata.com/guides/how-to-create-a-new-api-key
- For Nominatim Openstreet: https://nominatim.org/

## User Interface and options: 
- After specifying the required parameters to search in USGS earthquake data, the geocoding services run in the background to complete the request.
- Users have the option to view a geodesic circle buffer with the specified radius on the map.
- Three options are provided for visualization:
    1) Cluster Map that averages the magnitudes for points cluster with Minimum Distance and Cluster Distance options
    2) Point Map with information for each point that appear on hovering over each point
    3) Heat Map that shows the density of the points with Radius size and Blur size controls
- A (Clear Map) button is provided to clear all map layers
- Three base maps options: OSM, Esri World Imagery, National Geographic

