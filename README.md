# ol-geometry-editor

## Description

> Ce composant fournit un moyen simple d'intégrer une composante géométrique dans les formulaires HTML.
> Nul besoin de révolutionner votre architecture, d'intégrer des `Feature` et `FeatureCollection` :
> Une géométrie est un champ comme un autre qui peut être formaté en texte et édité à l'aide d'une carte.

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

| Option                 | Description                                                     | Default                  |
| ---------------------- | --------------------------------------------------------------- | ------------------------ |
| `geometryType`         | Restrict geometry type                                          | `Geometry`               |
| `hide`                 | true to hide form input                                         | `true`                   |
| `editable`             | Allows to enable a viewer mode without geometry edition         | `true`                   |
| `tileLayers`           | init background map                                             | `tile.openstreetmap.org` |
| `tileLayerSwitcher`    | true to put layers in a layerSwitcher                           | `false`                  |
| `switchableLayers`     | mapping to put more than one layer by tile in layer switcher    |  []                      |
| `tileCoordinates`      | Coordinates of the image for the layer switcher                 | `[9, 253, -177]`         |
| `width`                | Map width                                                       | `100%`                   |
| `height`               | Map height                                                      | `500`                    |
| `lon`                  | Longitude for initial view                                      | `2.0`                    |
| `lat`                  | Latitude for initial view                                       | `45.0`                   |
| `zoom`                 | Zoom for initial view                                           | `4`                      |
| `maxZoom`              | Maximum zoom level                                              | `20`                     |
| `minZoom`              | Minimum zoom level                                              | `4`                      |
| `centerOnResults`      | Zoom to geometry after each edition                             | `true`                   |
| `precision`            | Maximum number of decimal for coordinates                       | `7`                      |
| `allowCapture`         | Add map control to show and save a capture of the map           | `false`                  |
| `style`                | Custom ol.style.style of geometry layer                         |                          |



## Get the map object and custom events :

```javascript

    var geometryEditor = $(".geometry").data('editor');
    var map = geometryEditor.getMap();

    // when the tile of background layers change
    map.on('change:tile',function(e){
        console.log(e.tile);
    });

    // When the geometry change
    map.on('change:geometry',function(e){
        console.log(e.geometry);
    });

```

## Add a layer switcher :

```javascript
$('.geometry').geometryEditor({
    geometryType: 'Point',

    // add layers to the map with this option
    tileLayers: [
                    {
                        'title': 'OSM',
                        'url': 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        'attribution': '©<a href="http://openstreetmap.org">OpenStreetMap contributors</a>'
                    },
                    {
                        'title': 'Wikipedia',
                        'url': 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
                    }
    ],

    // allow to show the layer switcher
    'tileLayerSwitcher': true,

    // by default, one layer by switch,but you can add multiple layers to one switch with this mapping option
    'switchableLayers': ["OSM","Wikipedia",["OSM","Wikipedia"]]

    // the switch active by default at load
    'defaultSwitchableTile': 1,

    // each switch got an image based on a tile of the layer(s) assigned to him,
    // you can configure the coordinates with this option
    'tileCoordinates': [9, 269, -189], //corse
});
```

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

See [index.html](https://ignf.github.io/ol-geometry-editor/index.html)

## Dependencies

* jQuery >= 1.12.0
* openlayers >= 4.6.4 and openlayers < 5.0.0

## License

See [LICENCE.md](LICENCE.md)
