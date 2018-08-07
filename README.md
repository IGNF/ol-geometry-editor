# ol-geometry-editor

## Description

Provides a geometry editor for html inputs and to simplify geometry integration in HTML forms.

```html
<textarea class="geometry" name="the_geom" style="width: 400px;">
{"type":"Point","coordinates":[2.33,48.85]}
</textarea>
```

+

```javascript
$('.geometry').geometryEditor({
    'geometryType': 'Point',
    'editable': true
});
```


![geometry editor](doc/geometry-types.png)



## Features

* `ge.GeometryEditor` : class providing a geometry editor
* `$.geometryEditor` : optional jquery plugin

## Options

* `geometryType`    : Restrict geometry type (Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, Rectangle, Geometry)
* `hide`            : true to hide form input
* `editable`        : false to only read data (no edition geometry control)
* `tileLayers`      : array of tileLayers to choose different map background
* `width`           : width of map 
* `height`          : height of map
* `lon`             : longitude central point of map view at init
* `lat`             : latitude central point of map view at init
* `zoom`            : level of zoom of map view at init
* `maxZoom`         : level maximum of zoom of map view
* `centerOnResults` : true to auto center the view on geometry edited
* `onResult`        : function to launch when geometry is edited

