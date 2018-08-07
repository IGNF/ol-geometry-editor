# ol-geometry-editor

## Description

Provides a geometry editor for html inputs to simplify geometry integration in HTML forms.

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

=>

image


## Features

* `ge.GeometryEditor` : class providing a geometry editor
* `$.geometryEditor` : optional jquery plugin

## Options

* `geometryType` : Restrict geometry type
* ...




