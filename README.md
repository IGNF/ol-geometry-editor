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
* `ge.TileLayer` : class model for layer construction in get.GeometryEditor
* `$.geometryEditor` : jQuery plugin


## Options

| Option                 | Description                                             | Default                  |
| ---------------------- | ------------------------------------------------------- | ------------------------ |
| `geometryType`         | Restrict geometry type                                  | `Geometry`               |
| `hide`                 | true to hide form input                                 | `true`                   |
| `editable`             | Allows to enable a viewer mode without geometry edition | `true`                   |
| `tileLayers`           | init background map                                     | `tile.openstreetmap.org` |
| `switchableLayers`     | List of layer groups to allow to change map background  | `{}`                     |
| `coordSwitchableLayers`| Coordinates of the image for the layer switcher         | `[9,269,-189]` (corse)   |
| `width`                | Map width                                               | `100%`                   |
| `height`               | Map height                                              | `500`                    |
| `lon`                  | Longitude for initial view                              | `2.0`                    |
| `lat`                  | Latitude for initial view                               | `45.0`                   |
| `zoom`                 | Zoom for initial view                                   | `4`                      |
| `maxZoom`              | Maximum zoom level                                      | `20`                     |
| `centerOnResults`      | Zoom to geometry after each edition                     | `true`                   |
| `onResult`             | Callback function for geometry edition                  | `null`                   |
| `precision`            | Maximum number of decimal for coordinates               | `7`                      |

## Initialise the background layers and the layer switcher

First, create layers (ol.layer.Tile)

```javascript
    var layer = ge.createTileLayer("https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png");
    var layer2 = ge.createTileLayer("https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png");
```

Then configure your geometry editor :

```javascript
 $('.geometry').geometryEditor({
    // Background layers
    'tileLayers': [
        tileLayer1,
        tileLayer2
    ],
    // layer switcher
    'switchableLayers': {
        "Layer 1" : [tileLayer1],
        "Layer 2" : [tileLayer2],
        "Both Layers" : [tileLayer1,tileLayer2],
        "White": []
    },
    // Tile (of layers) active by default by position
    defaultSwitchableTile: 1,
    // coordinates for the image representing each layer
    'coordSwitchableLayers': [9,269,-189]
});
```


## Get the map object and custom events:

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

See [example/geometry-types.html](example/geometry-types.html)

## Dependencies

* jQuery >= 1.12.0
* openlayers >= 4.6.4 and openlayers < 5.0.0

## License

See [LICENCE.md](LICENCE.md)
