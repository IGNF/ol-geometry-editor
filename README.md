# ol-geometry-editor

## Description

> Ce composant fournit un moyen simple d'intégrer une composante géométrique dans les formulaires HTML.
> Nul besoin de révolutionner votre architecture, d'intégrer des `Feature` et `FeatureCollection` :
> Une géométrie est un champ comme un autre qui peut être formaté en texte et éditer à l'aide d'une carte.

This components provides an easy way to integrate geometry edition in HTML forms.

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

| Option            | Description                                             | Default                  |
| ----------------- | ------------------------------------------------------- | ------------------------ |
| `geometryType`    | Restrict geometry type                                  | `Geometry`               |
| `hide`            | true to hide form input                                 | `true`                   |
| `editable`        | Allows to enable a viewer mode without geometry edition | `true`                   |
| `tileLayers`      | Allows to change background map                         | `tile.openstreetmap.org` |
| `width`           | Map width                                               | `100%`                   |
| `height`          | Map height                                              | `500`                    |
| `lon`             | Longitude for initial view                              | `2.0`                    |
| `lat`             | Latitude for initial view                               | `45.0`                   |
| `zoom`            | Zoom for initial view                                   | `4`                      |
| `maxZoom`         | Maximum zoom level                                      | `20`                     |
| `centerOnResults` | Zoom to geometry after each edition                     | `true`                   |
| `onResult`        | Callback function for geometry edition                  | `null`                   |
| `precision`       | Maximum number of decimal for coordinates               | `7`                      |


## Supported geometry types (option "geometryType")

* `Point`
* `LineString`
* `Polygon`
* `MultiPoint`
* `MultiLineString`
* `MultiPolygon`
* `Rectangle`
* `Geometry` (no restriction, `GeometryCollection` if required)

![Supported geometry types](doc/images/geometry-types.png)

## Get started

See [public/geometry-types.html](public/geometry-types.html)

## Dependencies

* jQuery >= 1.12.0
* openlayers >= 4.6.4 and openlayers < 5.0.0

## License

See [LICENCE.md](LICENCE.md)
