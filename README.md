# ol-geometry-editor

## Description

Provides a geometry editor for html inputs and to simplify geometry integration in HTML forms.

Add an html input (can containt geometry data)

```html
<textarea class="geometry" name="the_geom" style="width: 400px;">
{"type":"Point","coordinates":[2.33,48.85]}
</textarea>
```

Then use geometryEditor 

like this as jquery plugin
```javascript
$('.geometry').geometryEditor({
    'geometryType': 'Point',
    'editable': true
});
```

or like this as javascript plugin
```javascript
var editor =    new ge.GeometryEditor($('.geometry').get(0), {
                    geometryType: 'Point',
                    'editable': true
                });
```


What you got, related to geometryType option passed :

![geometry editor](doc/images/geometry-types.png)



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

## Dependancies

 * openlayers 4.6.4 minimum / 4.6.5 maximum
 * jquery 1.12.0 minimum