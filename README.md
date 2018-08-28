# ol-geometry-editor

## Description

> Ce composant fournit un moyen simple d'intégrer une composante géométrique dans les formulaires HTML. 
> Nul besoin de révolutionner votre architecture, d'intégrer des `Feature` et `FeatureCollection` : 
> Une géométrie est un champ comme un autre qui peut être formaté en texte et éditer à l'aide d'une carte.

This components provides an easy way to integrate geometry edition in HTML forms.

## How to enable a geometry editor?

Given "the_geom" input in a form :

```html
<textarea class="geometry" name="the_geom" style="width: 400px;">
{"type":"Point","coordinates":[2.33,48.85]}
</textarea>
```

Either use jQuery plugin :

```javascript
$('.geometry').geometryEditor({
    geometryType: 'Point',
    editable: true
});
```

Or the `GeometryEditor` class :

```javascript
var editor = new ge.GeometryEditor($('.geometry').get(0), {
    geometryType: 'Point',
    editable: true
});
```

=> GeoJSON geometry will be hidden and a map will be provided as edition widget



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

## Supported geometry types

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
* openlayers >= 4.6.4

