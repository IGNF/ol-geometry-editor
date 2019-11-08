# ol-geometry-editor

## Description

> Ce composant fournit un moyen simple d'intégrer une composante géométrique dans les formulaires HTML.
> Nul besoin de révolutionner votre architecture, d'intégrer des `Feature` et `FeatureCollection` :
> Une géométrie est un champ comme un autre qui peut être formaté en texte et éditer à l'aide d'une carte.

This components provides an easy way to integrate geometry edition in HTML forms.


## How to add this in your project ?

To add this in your project, you will need those two dependancies : jQuery ( version >= 1.12.0 ) and openlayers (version >= 4.6.4 and version < 5.0.0 ).

### with npm

1. Get the lastest version of ol-geometry-editor
npm install git+https://github.com/IGNF/ol-geometry-editor.git --save


2. Simply use the content of the dist repertory in node_modules/ol-geometry-editor like this (you have to put them after jQuery and openlayers styles and scripts) :
```html
    <!-- [... openlayers style ...] -->
    <!-- ol-geomettry-editor css : -->
    <link rel="stylesheet" type="text/css" href="./node_modules/ol-geometry-editor/dist/ol-geometry-editor.min.css" />
    <!-- [... your styles ...] -->

    <!-- [... jQuery and openlayers scripts ...] -->
    <!-- ol-geomettry-editor js : -->
    <script type="text/javascript" src="./node_modules/ol-geometry-editor/dist/ol-geometry-editor.min.js"></script>
    <!-- [... your scripts ...] -->
```
A better way is to copy those files in your public directory instead of use them directly (tools like Grunt can do the job).

### by your own hand (not recommanded)
Just copy the dist repertory in your project then call them (you have to put them after jQuery and openlayers styles and scripts) :
```html
    <!-- [... openlayers style ...] -->
    <!-- ol-geomettry-editor css : -->
    <link rel="stylesheet" type="text/css" href="./{relativePathWhereYouPutThem}/dist/ol-geometry-editor.min.css" />
    <!-- [... your styles ...] -->

    <!-- [... jQuery and openlayers scripts ...] -->
    <!-- ol-geomettry-editor js : -->
    <script type="text/javascript" src="./{relativePathWhereYouPutThem}/dist/ol-geometry-editor.min.js"></script>
    <!-- [... your scripts ...] -->
```

## How to enable a geometry editor ?

Given "the_geom" input in a form :

```html
<textarea class="geometry">
{"type":"Point","coordinates":[2.33,48.85]}
</textarea>
```

Either use jQuery plugin :

```javascript
$('.geometry').geometryEditor({
    geometryType: 'Point',
    editable: true
});

var geometryEditor = $("#geometry_pluggin_span").data('editor');

```


Or the `GeometryEditor` class :

```javascript
var geometryEditor = new ge.GeometryEditor(document.getElementById("geometry"), {
    geometryType: 'Point',
    editable: true
});
```

=> GeoJSON geometry will be hidden and a map will be provided as edition widget (option "hide" can change this).

See the list of options below.


## Main components

* `ge.GeometryEditor` : class providing a geometry editor
* `$.geometryEditor` : jQuery plugin


## Options

| Option          | Description                                             | Default                |
|-----------------|---------------------------------------------------------|------------------------|
| geometryType    | Restrict geometry type                                  | Geometry               |
| hide            | true to hide form input                                 | true                   |
| editable        | Allows to enable a viewer mode without geometry edition | true                   |
| tileLayers      | Allows to change background map                         | tile.openstreetmap.org |
| width           | Map width                                               | 100%                   |
| height          | Map height                                              | 500                    |
| lon             | Longitude for initial view                              | 2.0                    |
| lat             | Latitude for initial view                               | 45.0                   |
| zoom            | Zoom for initial view                                   | 4                      |
| maxZoom         | Maximum zoom level                                      | 20                     |
| centerOnResults | Zoom to geometry after each edition                     | true                   |
| onResult        | Callback function for geometry edition                  | null                   |
| precision       | Maximum number of decimal places for coordinates when   | 7                      |
|                 | read from geometry drawing                              |                        |
|----------------------------------------------------------------------------------------------------|

## Supported geometry types (option "geometryType")

* Point
* LineString
* Polygon
* MultiPoint
* MultiLineString
* MultiPolygon
* Rectangle
* Geometry (no restriction, GeometryCollection if required)

![Supported geometry types](doc/geometry-types.png)

## Dependencies

* jQuery >= 1.12.0
* openlayers >= 4.6.4 and opelayers < 5.0.0

