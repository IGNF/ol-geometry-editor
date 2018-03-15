(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var polygon = require('turf-polygon');

/**
 * Takes a bbox and returns an equivalent {@link Polygon|polygon}.
 *
 * @module turf/bbox-polygon
 * @category measurement
 * @param {Array<number>} bbox an Array of bounding box coordinates in the form: ```[xLow, yLow, xHigh, yHigh]```
 * @return {Feature<Polygon>} a Polygon representation of the bounding box
 * @example
 * var bbox = [0, 0, 10, 10];
 *
 * var poly = turf.bboxPolygon(bbox);
 *
 * //=poly
 */

module.exports = function(bbox) {
  var lowLeft = [bbox[0], bbox[1]];
  var topLeft = [bbox[0], bbox[3]];
  var topRight = [bbox[2], bbox[3]];
  var lowRight = [bbox[2], bbox[1]];

  var poly = polygon([[
    lowLeft,
    lowRight,
    topRight,
    topLeft,
    lowLeft
  ]]);
  return poly;
};

},{"turf-polygon":4}],2:[function(require,module,exports){
var each = require('turf-meta').coordEach;

/**
 * Takes any {@link GeoJSON} object, calculates the extent of all input features, and returns a bounding box.
 *
 * @module turf/extent
 * @category measurement
 * @param {GeoJSON} input any valid GeoJSON Object
 * @return {Array<number>} the bounding box of `input` given
 * as an array in WSEN order (west, south, east, north)
 * @example
 * var input = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.175329, 22.2524]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.170007, 22.267969]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.200649, 22.274641]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [114.186744, 22.265745]
 *       }
 *     }
 *   ]
 * };
 *
 * var bbox = turf.extent(input);
 *
 * var bboxPolygon = turf.bboxPolygon(bbox);
 *
 * var resultFeatures = input.features.concat(bboxPolygon);
 * var result = {
 *   "type": "FeatureCollection",
 *   "features": resultFeatures
 * };
 *
 * //=result
 */
module.exports = function(layer) {
    var extent = [Infinity, Infinity, -Infinity, -Infinity];
    each(layer, function(coord) {
      if (extent[0] > coord[0]) extent[0] = coord[0];
      if (extent[1] > coord[1]) extent[1] = coord[1];
      if (extent[2] < coord[0]) extent[2] = coord[0];
      if (extent[3] < coord[1]) extent[3] = coord[1];
    });
    return extent;
};

},{"turf-meta":3}],3:[function(require,module,exports){
/**
 * Lazily iterate over coordinates in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @param {boolean=} excludeWrapCoord whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @example
 * var point = { type: 'Point', coordinates: [0, 0] };
 * coordEach(point, function(coords) {
 *   // coords is equal to [0, 0]
 * });
 */
function coordEach(layer, callback, excludeWrapCoord) {
  var i, j, k, g, geometry, stopG, coords,
    geometryMaybeCollection,
    wrapShrink = 0,
    isGeometryCollection,
    isFeatureCollection = layer.type === 'FeatureCollection',
    isFeature = layer.type === 'Feature',
    stop = isFeatureCollection ? layer.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (i = 0; i < stop; i++) {

    geometryMaybeCollection = (isFeatureCollection ? layer.features[i].geometry :
        (isFeature ? layer.geometry : layer));
    isGeometryCollection = geometryMaybeCollection.type === 'GeometryCollection';
    stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

    for (g = 0; g < stopG; g++) {

      geometry = isGeometryCollection ?
          geometryMaybeCollection.geometries[g] : geometryMaybeCollection;
      coords = geometry.coordinates;

      wrapShrink = (excludeWrapCoord &&
        (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon')) ?
        1 : 0;

      if (geometry.type === 'Point') {
        callback(coords);
      } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
        for (j = 0; j < coords.length; j++) callback(coords[j]);
      } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
        for (j = 0; j < coords.length; j++)
          for (k = 0; k < coords[j].length - wrapShrink; k++)
            callback(coords[j][k]);
      } else if (geometry.type === 'MultiPolygon') {
        for (j = 0; j < coords.length; j++)
          for (k = 0; k < coords[j].length; k++)
            for (l = 0; l < coords[j][k].length - wrapShrink; l++)
              callback(coords[j][k][l]);
      } else {
        throw new Error('Unknown Geometry Type');
      }
    }
  }
}
module.exports.coordEach = coordEach;

/**
 * Lazily reduce coordinates in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all coordinates is unnecessary.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (memo, value) and returns
 * a new memo
 * @param {boolean=} excludeWrapCoord whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @param {*} memo the starting value of memo: can be any type.
 */
function coordReduce(layer, callback, memo, excludeWrapCoord) {
  coordEach(layer, function(coord) {
    memo = callback(memo, coord);
  }, excludeWrapCoord);
  return memo;
}
module.exports.coordReduce = coordReduce;

/**
 * Lazily iterate over property objects in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (value)
 * @example
 * var point = { type: 'Feature', geometry: null, properties: { foo: 1 } };
 * propEach(point, function(props) {
 *   // props is equal to { foo: 1}
 * });
 */
function propEach(layer, callback) {
  var i;
  switch (layer.type) {
      case 'FeatureCollection':
        features = layer.features;
        for (i = 0; i < layer.features.length; i++) {
            callback(layer.features[i].properties);
        }
        break;
      case 'Feature':
        callback(layer.properties);
        break;
  }
}
module.exports.propEach = propEach;

/**
 * Lazily reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (memo, coord) and returns
 * a new memo
 * @param {*} memo the starting value of memo: can be any type.
 */
function propReduce(layer, callback, memo) {
  propEach(layer, function(prop) {
    memo = callback(memo, prop);
  });
  return memo;
}
module.exports.propReduce = propReduce;

},{}],4:[function(require,module,exports){
/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a GeoJSON {@link Polygon} feature.
 *
 * @module turf/polygon
 * @category helper
 * @param {Array<Array<Number>>} rings an array of LinearRings
 * @param {Object} properties an optional properties object
 * @return {Polygon} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the
 * beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *  [-2.275543, 53.464547],
 *  [-2.275543, 53.489271],
 *  [-2.215118, 53.489271],
 *  [-2.215118, 53.464547],
 *  [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */
module.exports = function(coordinates, properties){

  if (coordinates === null) throw new Error('No coordinates passed');

  for (var i = 0; i < coordinates.length; i++) {
    var ring = coordinates[i];
    for (var j = 0; j < ring[ring.length - 1].length; j++) {
      if (ring.length < 4) {
        throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
      }
      if (ring[ring.length - 1][j] !== ring[0][j]) {
        throw new Error('First and last Position are not equivalent.');
      }
    }
  }

  var polygon = {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": coordinates
    },
    "properties": properties
  };

  if (!polygon.properties) {
    polygon.properties = {};
  }

  return polygon;
};

},{}],5:[function(require,module,exports){
var bboxPolygon = require('turf-bbox-polygon');
var extent = require('turf-extent');

var defaultParams = require('./defaultParams.js');
var geometryToSimpleGeometries = require('./util/geometryToSimpleGeometries');

var Viewer = require('./Viewer');

/**
 * GeometryEditor constructor from a dataElement containing a serialized geometry
 * @param {Object} dataElement
 * @param {Object} options
 */
var GeometryEditor = function (dataElement, options) {

    this.dataElement = dataElement;
    this.settings = {};
    $.extend(true, this.settings, defaultParams, options); // deep copy

    this.viewer = new Viewer({
        techno: this.settings.techno,
        geometryType: this.settings.geometryType
    });

    // init map
    var map = this.initMap();
    
    this.getMap = function(){
        return map;
    };    

    // init features
    this.initDrawLayer();
    
    // draw controls
    if (this.settings.editable) {
        this.initDrawControls();
    }

    // hide data
    if (this.settings.hide) {
        this.dataElement.hide();
    }

};


/**
 * Init map
 *
 * @return ol.Map
 */
GeometryEditor.prototype.initMap = function () {
    return this.viewer.initMap({
        width: this.settings.width,
        height: this.settings.height,
        dataElement: this.dataElement,
        layers: this.settings.tileLayers,
        lon: this.settings.lon,
        lat: this.settings.lat,
        zoom: this.settings.zoom,
        maxZoom: this.settings.maxZoom,
        minZoom: this.settings.minZoom
    });
};

/**
 * Indicates if data element is an input field (<input>, <textarea>, etc.)
 * @private
 */
GeometryEditor.prototype.isDataElementAnInput = function () {
    return typeof this.dataElement.val !== 'undefined';
};

/**
 * Get raw data from the dataElement
 * @returns {String}
 */
GeometryEditor.prototype.getRawData = function () {
    if (this.isDataElementAnInput()) {
        return $.trim(this.dataElement.val());
    } else {
        return $.trim(this.dataElement.html());
    }
};

/**
 * Set raw data to the dataElement
 * @param {String} value
 */
GeometryEditor.prototype.setRawData = function (value) {
    var currentData = this.getRawData();
    if (currentData === value) {
        return;
    }
    
    if (this.isDataElementAnInput()) {
        this.dataElement.val(value);
    } else {
        this.dataElement.html(value);
    }
};

/**
 * Set the geometry
 * @param {Array|Object} geometry either a GeoJSON geometry or a bounding box
 */
GeometryEditor.prototype.setGeometry = function (geometry) {

    // hack to accept bbox
    if (geometry instanceof Array && geometry.length === 4) {
        geometry = bboxPolygon(geometry).geometry;
    }

    this.viewer.removeFeatures(this.featuresCollection);

    var geometries = geometryToSimpleGeometries(geometry);

    this.viewer.setGeometries(this.featuresCollection, geometries);

    if (this.settings.centerOnResults && geometries.length > 0) {
        this.viewer.fitViewToFeaturesCollection(this.featuresCollection);
    }

    this.serializeGeometry();
};



/**
 * Init map from dataElement data
 */
GeometryEditor.prototype.initDrawLayer = function () {
    this.featuresCollection = this.viewer.createFeaturesCollection();
    this.updateDrawLayer();
    this.dataElement.on('change', this.updateDrawLayer.bind(this));
};

/**
 * Update draw layer from data
 */
GeometryEditor.prototype.updateDrawLayer = function () {
    var data = this.getRawData();
    var geometry;
    if (data !== '') {
        try {
            geometry = JSON.parse(data);
            this.setGeometry(geometry);
        } catch (err) {
            this.viewer.removeFeatures(this.featuresCollection);
            return;
        }
    }else{
        this.viewer.removeFeatures(this.featuresCollection);
    }
};

/**
 * Get output geometry type
 * @returns {String}
 */
GeometryEditor.prototype.getGeometryType = function () {
    return this.settings.geometryType;
};



/**
 * Init draw controls
 *  
 * @private
 */
GeometryEditor.prototype.initDrawControls = function () {

    var drawOptions = {
        geometryType: this.getGeometryType(),
        features: this.featuresCollection
    };

    this.viewer.addDrawControl(drawOptions);

    var events = {
        onDrawCreated: function (e) {

            this.viewer.drawCreatedHandler(this.featuresCollection, e);

            if (this.settings.centerOnResults && this.viewer.getFeaturesCount(this.featuresCollection) > 0) {
                this.viewer.fitViewToFeaturesCollection(this.featuresCollection);
            }
            this.serializeGeometry();
        }.bind(this),
        onDrawModified: function (e) {
            if (this.settings.centerOnResults && this.viewer.getFeaturesCount(this.featuresCollection) > 0) {
                this.viewer.fitViewToFeaturesCollection(this.featuresCollection);
            }
            this.serializeGeometry();
        }.bind(this),
        onDrawDeleted: function (e) {
            this.serializeGeometry();
        }.bind(this)
    };

    this.viewer.addDrawEvents(events);
};


/**
 * Serialize geometry to dataElement
 * 
 * @private
 */
GeometryEditor.prototype.serializeGeometry = function () {
    var geometry = this.viewer.getGeometryByFeaturesCollection(this.featuresCollection);
    
    var geometryGeoJson = "";
    if (geometry) {
        if (this.getGeometryType() === 'Rectangle') {
            geometryGeoJson = JSON.stringify(extent(geometry));
        } else {
            geometryGeoJson = JSON.stringify(geometry);
        }
    } 
    
    this.settings.onResult(geometryGeoJson);
    this.setRawData(geometryGeoJson);
};


module.exports = GeometryEditor;

},{"./Viewer":6,"./defaultParams.js":7,"./util/geometryToSimpleGeometries":10,"turf-bbox-polygon":1,"turf-extent":2}],6:[function(require,module,exports){
(function (global){
var guid = require('./util/guid');


var ol = (typeof window !== "undefined" ? window['ol'] : typeof global !== "undefined" ? global['ol'] : null);
var DrawControl = require('./util/openlayers/DrawControl');
var featureCollectionToGeometry = require('./util/featureCollectionToGeometry.js');
var isSingleGeometryType = require('./util/isSingleGeometryType.js');



/**
 * Geometry editor backend 
 * Class doing link between GeometryEditor and
 *
 * @param {Object} options
 * @param {Object} options.geometryType
 */
var Viewer = function (options) {

    this.settings = {
        dataProjection: "EPSG:4326",
        mapProjection: "EPSG:3857"
    };

    $.extend(this.settings, options); // deep copy

    this.initMap(this.settings);
};

/**
 * Initialise a map
 * @param {Object} options - options are :
 * 
 * @param {string|int} options.height - map height
 * @param {string|int} options.width - map width
 * @param {float} options.lat - latitude at start for map center
 * @param {float} options.lon - longitude at start for map center
 * @param {float} options.zoom - map zoom
 * 
 * @param {Object[]} options.layers - array of layer configurations 
 * @param {string} options.layers[].url - url
 * @param {string} options.layers[].attribution - attribution
 *
 */
Viewer.prototype.initMap = function (options) {
    // create map div
    var mapTargetId = 'map-' + guid();
    var $mapDiv = $('<div id="' + mapTargetId + '"></div>');
    $mapDiv.addClass('map');
    $mapDiv.css('width', options.width);
    $mapDiv.css('height', options.height);
    $mapDiv.insertAfter(options.dataElement);

    // create map
    this.map = this.createMap(mapTargetId, options);

    this.addLayersToMap(options.layers);

};

Viewer.prototype.getMap = function (options) {
    return this.map;
};

/**
 * Add control to map
 * @param {ol.control} control
 */
Viewer.prototype.addControl = function (control) {
    this.getMap().addControl(control);
};


/**
 * Create map
 * @param {string} target - Emplacement cible (id)
 * @param {object} options - options (zoom, minZooom, maxZoom, lon, lat)
 * 
 * @return {ol.Map}
 */
Viewer.prototype.createMap = function (target, options) {
    options = options || {};

    return new ol.Map({
        target: target,
        view: new ol.View({
            center: ol.proj.transform([options.lon, options.lat], this.settings.dataProjection, this.settings.mapProjection),
            zoom: options.zoom,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom,
            projection: this.settings.mapProjection
        }),
        controls: [new ol.control.Zoom(), new ol.control.Attribution()]
    });

};

/**
 * Add layers to Viewer map
 * 
 * @param {Object[]} layers - array of layer configurations 
 * @param {string} layers[].url - url
 * @param {string} layers[].attribution - attribution
 * @param {Object} options - Options. Default : maxZoom = 18 
 * 
 * @return L.Map
 */
Viewer.prototype.addLayersToMap = function (layers, options) {

    options = options || {};

    // init layers
    for (var i in layers) {

        this.getMap().addLayer(new ol.layer.Tile({
            source: new ol.source.XYZ({
                attributions: [layers[i].attribution],
                url: layers[i].url,
                crossOrigin: "Anonymous"
            })
        }));

    }

};

/**
 * Ajoute des features dans une feature collection à partir d'un tableau de géométries GeoJson
 * 
 * @param {ol.featureCollection} featuresCollection
 * @param {array} geometries - simple geometries
 */
Viewer.prototype.setGeometries = function (featuresCollection, geometries) {
    for (var i in geometries) {
        var geom;

        switch (geometries[i].type) {
            case "Point":
                geom = new ol.geom.Point(geometries[i].coordinates);
                break;
            case "LineString":
                geom = new ol.geom.LineString(geometries[i].coordinates);
                break;
            case "Polygon":
                geom = new ol.geom.Polygon(geometries[i].coordinates);
                break;
        }


        var feature = new ol.Feature({
            geometry: geom.transform(this.settings.dataProjection, this.settings.mapProjection)
        });

        feature.set('type', this.settings.geometryType);
        featuresCollection.push(feature);
    }
};

/**
 * Recentre la vue de la carte sur la collection de features
 * @param {ol.featureCollection} featuresCollection
 */
Viewer.prototype.fitViewToFeaturesCollection = function (featuresCollection) {
    var geometries = [];
    featuresCollection.forEach(function (feature) {
        geometries.push(feature.getGeometry());
    });

    this.getMap().getView().fit((new ol.geom.GeometryCollection(geometries)).getExtent(), {
        size: this.getMap().getSize(),
        duration: 100
    });
};

Viewer.prototype.createFeaturesCollection = function () {
    return new ol.Collection();
};

/**
 * @description Supprime les features de la collection de feature
 * @param {ol.FeaturesCollection} featuresCollection - Collection de features
 * 
 * @returns {undefined}
 */
Viewer.prototype.removeFeatures = function (featuresCollection) {
    featuresCollection.clear();
};

Viewer.prototype.drawCreatedHandler = function (featuresCollection, e) {
    if (isSingleGeometryType(this.getGeometryType())) {
        this.removeFeatures(featuresCollection);
        featuresCollection.push(e.feature);
    }

};

/**
 * Get output geometry type
 * @returns {String}
 */
Viewer.prototype.getGeometryType = function () {
    return this.settings.geometryType;
};

Viewer.prototype.addDrawControl = function (drawOptions) {


    var drawControlOptions = {
        features: drawOptions.features,
        type: drawOptions.geometryType
    };

    var drawControl = new DrawControl(drawControlOptions);
    this.addControl(drawControl);
};


/**
 * addDrawEvents
 * @param {Object} events
 */
Viewer.prototype.addDrawEvents = function (events) {
    this.getMap().on('draw:created', events.onDrawCreated);
    this.getMap().on('draw:edited', events.onDrawModified);
    this.getMap().on('draw:deleted', events.onDrawDeleted);
};


Viewer.prototype.getGeometryByFeaturesCollection = function (featuresCollection) {

    var featuresGeoJson = (new ol.format.GeoJSON()).writeFeatures(
            featuresCollection.getArray(),
            {
                featureProjection: this.settings.mapProjection,
                dataProjection: this.settings.dataProjection
            });

    return featureCollectionToGeometry(JSON.parse(featuresGeoJson));

};

Viewer.prototype.getFeaturesCount = function (featuresCollection) {
    return featuresCollection.getLength();
};



module.exports = Viewer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./util/featureCollectionToGeometry.js":8,"./util/guid":11,"./util/isSingleGeometryType.js":12,"./util/openlayers/DrawControl":13}],7:[function(require,module,exports){

/**
 * Default GeometryEditor parameters
 */
var defaultParams = {
    tileLayers: [
       {
           url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
           attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
       }
    ],
    /*
     * display or hide corresponding form item
     */
    hide: true,
    editable: true,
    width: '100%',
    height: '500',
    lon: 2.0,
    lat: 45.0,
    zoom: 4,
    maxZoom: 18,
    geometryType: 'Geometry',
    centerOnResults: true,
    onResult: function(){}
} ;

module.exports = defaultParams ;

},{}],8:[function(require,module,exports){

var geometriesToCollection = require('./geometriesToCollection.js') ;

/**
 * Converts FeatureCollection to a normalized geometry
 */
var featureCollectionToGeometry = function(featureCollection){
    var geometries = [] ;
    featureCollection.features.forEach(function(feature){
        geometries.push( feature.geometry ) ;
    });

    if ( geometries.length === 0 ){
        return null ;
    }

    if ( geometries.length == 1 ){
        return geometries[0];
    }else{
        return geometriesToCollection(geometries) ;
    }
} ;

module.exports = featureCollectionToGeometry ;

},{"./geometriesToCollection.js":9}],9:[function(require,module,exports){

/**
 * Converts an array of geometries to a collection (MultiPoint, MultiLineString,
 * MultiPolygon, GeometryCollection).
 */
var geometriesToCollection = function(geometries){
    // count by geometry type
    var counts = {};
    geometries.forEach(function(geometry){
        if ( typeof counts[geometry.type] === 'undefined' ){
            counts[geometry.type] = 1 ;
        }else{
            counts[geometry.type]++ ;
        }
    }) ;

    var geometryTypes = Object.keys(counts) ;
    if ( geometryTypes.length > 1 ){
        return {
            "type": "GeometryCollection",
            "geometries": geometries
        } ;
    }else{
        var multiType = "Multi"+Object.keys(counts)[0] ;
        var coordinates = [];
        geometries.forEach(function(geometry){
            coordinates.push(geometry.coordinates);
        }) ;
        return {
            "type": multiType,
            "coordinates": coordinates
        } ;
    }
} ;

module.exports = geometriesToCollection ;

},{}],10:[function(require,module,exports){

/**
 * Converts a multi-geometry to an array of geometries
 * @param {MultiPoint|MultiPolygon|MultiLineString} multi-geometry
 * @returns {Geometry[]} simple geometries
 */
var multiToGeometries = function(multiGeometry){
    var geometries = [] ;

    var simpleType = multiGeometry.type.substring("Multi".length) ;
    multiGeometry.coordinates.forEach(function(subCoordinates){
        geometries.push(
            {
                "type": simpleType,
                "coordinates": subCoordinates
            }
        );
    });

    return geometries ;
} ;

/**
 * Converts a geometry collection to an array of geometries
 * @param {GeometryCollection} geometry collection
 * @returns {Geometry[]} simple geometries
 */
var geometryCollectionToGeometries = function(geometryCollection){
    var geometries = [] ;
    geometryCollection.geometries.forEach(function(geometry){
        geometries.push(geometry);
    });
    return geometries ;
} ;


/**
 *
 * Converts a geometry to an array of single geometries. For
 * example, MultiPoint is converted to Point[].
 *
 * @param {Geometry} geometry
 * @returns {Geometry[]} simple geometries
 */
var geometryToSimpleGeometries = function(geometry){
    switch (geometry.type){
    case "Point":
    case "LineString":
    case "Polygon":
        return [geometry];
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
        return multiToGeometries(geometry);
    case "GeometryCollection":
        return geometryCollectionToGeometries(geometry);
    default:
        throw "unsupported geometry type : "+geometry.type;
    }
} ;

module.exports = geometryToSimpleGeometries ;

},{}],11:[function(require,module,exports){

/**
 * Generates uuidv4
 * @return {String} the generated uuid
 */
var guid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
} ;

module.exports = guid ;

},{}],12:[function(require,module,exports){

/**
 * Indicates if the given type corresponds to a mutli geometry
 * @param {String} geometryType tested geometry type
 */
var isSingleGeometryType = function(geometryType) {
    return ["Point","LineString","Polygon","Rectangle"].indexOf(geometryType) !== -1 ;
};

module.exports = isSingleGeometryType ;

},{}],13:[function(require,module,exports){
(function (global){
var ol = (typeof window !== "undefined" ? window['ol'] : typeof global !== "undefined" ? global['ol'] : null);
var DeleteInteraction = require('./customInteractions/DeleteInteraction');
var ModifyBoxInteraction = require('./customInteractions/ModifyBoxInteraction');


/**
 * Contrôle de création d'une feature de type
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 * @param {String} options.type le type d'élément dessiné ('Text', 'Point', 'LineString' ou 'Polygon')
 * 
 * @alias gpu.control.DrawControl
 */
var DrawControl = function (options) {

    var settings = {
        layer: null,
        features: null,
        type: "",
        title: "",
    };

    this.settings = $.extend(settings, options);

    this.active = false;

    this.drawBar = $("<div>").addClass('ol-draw ol-unselectable ol-control');


    ol.control.Control.call(this, {
        element: this.drawBar.get(0),
        target: options.target
    });
};

ol.inherits(DrawControl, ol.control.Control);


DrawControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

DrawControl.prototype.initControl = function () {
    this.createDrawLayer();
    this.addDrawInteraction();
    this.addModifyInteraction();
    this.addDeleteInteraction();
    this.configureInteractionSwitching();
};



DrawControl.prototype.createDrawLayer = function () {

    this.settings.features.forEach(function (feature) {
        feature.setStyle(this.getFeatureStyleByGeometryType(feature.getGeometry().getType()));
    }, this);


    this.layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: this.settings.features
        })
    });

    this.getMap().addLayer(this.layer);

};

DrawControl.prototype.getDrawLayer = function () {
    return this.layer;
};


DrawControl.prototype.addDrawInteraction = function () {
    var featuresCollection = new ol.Collection();

    var drawParams = {
        type: this.settings.type,
        style: this.getFeatureStyleByGeometryType(this.settings.type),
        features: featuresCollection
    };


    if (this.settings.type === 'Square') {
        drawParams.type = "Circle";
        drawParams.geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
    }
    if (this.settings.type === 'Rectangle') {
        drawParams.type = "Circle";
        drawParams.geometryFunction = ol.interaction.Draw.createBox();
    }

    this.drawInteraction = new ol.interaction.Draw(drawParams);

    this.drawInteraction.on('drawend', function (e) {

        e.feature.set('type', this.settings.type);
        e.feature.setStyle(this.getFeatureStyleByGeometryType(this.settings.type));

        this.settings.features.push(e.feature);

        this.getMap().dispatchEvent($.extend(e, {
            type: "draw:created",
            layer: this.getDrawLayer()
        }));

    }.bind(this));


    this.getMap().addInteraction(this.drawInteraction);


    this.setDrawInteractionActive = function (active) {
        this.drawInteraction.setActive(active);

        if (active) {
            drawButton.addClass("active");
            this.dispatchEvent('draw:active');
        } else {
            drawButton.removeClass("active");
            this.dispatchEvent('draw:inactive');
        }

    }.bind(this);


    // creation du bouton activant l'interaction
    var drawButton = $("<button>").attr('title', 'Draw a ' + this.settings.type.toLowerCase())
            .addClass('ol-draw-' + this.settings.type.toLowerCase())
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setDrawInteractionActive(!this.drawInteraction.getActive());

            }.bind(this))
            .appendTo(this.drawBar);

    this.setDrawInteractionActive(false);

};

DrawControl.prototype.getDrawInteraction = function () {
    return this.drawInteraction;
};


/**
 * Prepare des ol.Collections de features afin d'appliquer chaque groupe 
 * de features à une interaction de modification
 * 
 * @returns {undefined}
 */
DrawControl.prototype.prepareFeatureGroup = function () {

    this.featuresBasic = new ol.Collection();
    this.featuresBox = new ol.Collection();
    this.featuresSquare = new ol.Collection();

    var addFeatureOnRightCollection = function (feature) {
        switch (feature.get('type')) {
            case "Rectangle":
                this.featuresBox.push(feature);
                break;
            case "Square":
                this.featuresSquare.push(feature);
                break;

            default:
                this.featuresBasic.push(feature);
                break;
        }
    }.bind(this);

    var removeFeatureOnRightCollection = function (feature) {
        switch (feature.get('type')) {
            case "Rectangle":
                this.featuresBox.remove(feature);
                break;
            case "Square":
                this.featuresSquare.remove(feature);
                break;

            default:
                this.featuresBasic.remove(feature);
                break;
        }
    }.bind(this);

    this.settings.features.forEach(addFeatureOnRightCollection.bind(this));

    this.settings.features.on('add', function (e) {
        addFeatureOnRightCollection(e.element);
    });
    this.settings.features.on('remove', function (e) {
        removeFeatureOnRightCollection(e.element);
    });

};

DrawControl.prototype.addModifyInteraction = function () {


    this.prepareFeatureGroup();

    this.modifyInteractionBox = new ModifyBoxInteraction({
        features: this.featuresBox,
        type: this.settings.type
    });

    this.modifyInteractionSquare = new ol.interaction.Modify({
        features: this.featuresSquare,
        insertVertexCondition: function () {
            return false;
        }
    });

    this.modifyInteractionBasic = new ol.interaction.Modify({
        features: this.featuresBasic
    });


    this.translateInteractionSquare = new ol.interaction.Translate({
        features: this.featuresSquare,
        hitTolerance:10
    });
    this.translateInteractionBasic = new ol.interaction.Translate({
        features: this.featuresBasic,
        hitTolerance:10
    });

    this.modifyInteractions = [
        this.modifyInteractionBasic,
        this.modifyInteractionBox,
        this.modifyInteractionSquare
    ];





    var modifyend = function (e) {
        this.getMap().dispatchEvent($.extend(e, {type: "draw:edited"}));
    }.bind(this);

    for (var i in this.modifyInteractions) {
        this.modifyInteractions[i].on('modifyend', modifyend);
        this.getMap().addInteraction(this.modifyInteractions[i]);
    }

    this.getMap().addInteraction(this.translateInteractionSquare);
    this.getMap().addInteraction(this.translateInteractionBasic);

    this.setModifyInteractionsActive = function (active) {

        for (var j in this.modifyInteractions) {
            this.modifyInteractions[j].setActive(active);
        }
        this.translateInteractionBasic.setActive(active);
        this.translateInteractionSquare.setActive(active);


        if (active) {
            modifyButton.addClass("active");
            this.dispatchEvent('edit:active');
        } else {
            modifyButton.removeClass("active");
            this.dispatchEvent('edit:inactive');
        }
        this.modifyInteractionsActive = active;
    }.bind(this);


    var modifyButton = $("<button>").attr('title', 'Modify a ' + this.settings.type.toLowerCase())
            .addClass('ol-edit')
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setModifyInteractionsActive(!this.modifyInteractionsActive);

            }.bind(this))
            .appendTo(this.drawBar);

    this.setModifyInteractionsActive(false);

};


DrawControl.prototype.getModifyInteraction = function () {
    return this.modifyInteraction;
};




DrawControl.prototype.addDeleteInteraction = function () {

    this.deleteInteraction = new DeleteInteraction({
        features: this.settings.features
    });

    this.deleteInteraction.on('deleteend', function (e) {
        this.getMap().dispatchEvent($.extend(e, {type: "draw:deleted"}));
    }.bind(this));


    this.getMap().addInteraction(this.deleteInteraction);

    this.setDeleteInteractionActive = function (active) {
        this.deleteInteraction.setActive(active);

        if (active) {
            deleteButton.addClass("active");
            this.dispatchEvent('remove:active');
        } else {
            deleteButton.removeClass("active");
            this.dispatchEvent('remove:inactive');
        }
    }.bind(this);


    // creation du bouton activant l'interaction
    var deleteButton = $("<button>").attr('title', 'Delete a feature')
            .addClass('ol-delete')
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setDeleteInteractionActive(!this.deleteInteraction.getActive());

            }.bind(this))
            .appendTo(this.drawBar);

    this.setDeleteInteractionActive(false);

};

DrawControl.prototype.getDeleteInteraction = function () {
    return this.deleteInteraction;
};

DrawControl.prototype.configureInteractionSwitching = function () {
    this.on('draw:active', function () {
        this.setModifyInteractionsActive(false);
        this.setDeleteInteractionActive(false);
    }.bind(this));
    this.on('edit:active', function () {
        this.setDrawInteractionActive(false);
        this.setDeleteInteractionActive(false);
    }.bind(this));
    this.on('remove:active', function () {
        this.setDrawInteractionActive(false);
        this.setModifyInteractionsActive(false);
    }.bind(this));

};

DrawControl.prototype.getFeatureStyleByGeometryType = function (geometryType) {

    switch (geometryType) {
        case "Point":
            var markerStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 41],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: '../dist/images/marker-icon.png'
                })
            });
            var shadowMarker = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [14, 41],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: '../dist/images/marker-shadow.png'
                })
            });

            return [shadowMarker, markerStyle];

        default:
            break;
    }

};


module.exports = DrawControl;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./customInteractions/DeleteInteraction":14,"./customInteractions/ModifyBoxInteraction":15}],14:[function(require,module,exports){
(function (global){
var ol = (typeof window !== "undefined" ? window['ol'] : typeof global !== "undefined" ? global['ol'] : null);

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
var DeleteInteraction = function (opt_options) {

    opt_options = $.extend({
        features: null,
    }, opt_options);

    ol.interaction.Pointer.call(this, {
        handleDownEvent: DeleteInteraction.prototype.handleDownEvent,
        handleDragEvent: DeleteInteraction.prototype.handleDragEvent,
        handleMoveEvent: DeleteInteraction.prototype.handleMoveEvent,
        handleUpEvent: DeleteInteraction.prototype.handleUpEvent
    });

    this.features = opt_options.features;


    /**
     * @type {string|undefined}
     * @private
     */
    this.pointerCursor_ = 'pointer';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;

};
ol.inherits(DeleteInteraction, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
DeleteInteraction.prototype.handleDownEvent = function (evt) {
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));

    this.feature_ = feature;
    return !!feature;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
DeleteInteraction.prototype.handleDragEvent = function (evt) {
    var map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));
    var element = evt.map.getTargetElement();

    if (feature) {
        if (element.style.cursor != this.pointerCursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.pointerCursor_;
        }
        // gerer curseur ici
    } else if (this.previousCursor_ !== undefined) {
        element.style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
    }
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
DeleteInteraction.prototype.handleMoveEvent = function (evt) {
    var map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));
    var element = evt.map.getTargetElement();

    if (feature) {
        if (element.style.cursor != this.pointerCursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.pointerCursor_;
        }
        // gerer curseur ici
    } else if (this.previousCursor_ !== undefined) {
        element.style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
    }


};


/**
 * @return {boolean} `false` to stop the drag sequence.
 */
DeleteInteraction.prototype.handleUpEvent = function (evt) {

    var map = evt.map;

    var deletedFeature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature && this.feature_ === feature) {
                        this.features.remove(feature);
                    }
                }
            }.bind(this));

    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));

    var element = evt.map.getTargetElement();

    if (feature) {
        element.style.cursor = this.pointerCursor_;

        // gerer curseur ici
    } else if (element.style.cursor !== undefined) {
        element.style.cursor = undefined;
    }

    this.dispatchEvent({type: "deleteend"});
    return false;
};



module.exports = DeleteInteraction;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],15:[function(require,module,exports){
(function (global){
var ol = (typeof window !== "undefined" ? window['ol'] : typeof global !== "undefined" ? global['ol'] : null);

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
var ModifyBoxInteraction = function (opt_options) {

    opt_options = $.extend({
        features: null,
        type: "Rectangle"
    }, opt_options);

    ol.interaction.Pointer.call(this, {
        handleDownEvent: ModifyBoxInteraction.prototype.handleDownEvent,
        handleDragEvent: ModifyBoxInteraction.prototype.handleDragEvent,
        handleMoveEvent: ModifyBoxInteraction.prototype.handleMoveEvent,
        handleUpEvent: ModifyBoxInteraction.prototype.handleUpEvent
    });

    this.features = opt_options.features;
    this.type = opt_options.type;


    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.grabCursor_ = 'grab';
    /**
     * @type {string|undefined}
     * @private
     */
    this.grabbingCursor_ = 'grabbing';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;



    /**
     * Draw overlay where sketch features are drawn.
     * @type {ol.layer.Vector}
     * @private
     */
    this.overlay_ = new ol.layer.Vector({
        source: new ol.source.Vector({
            useSpatialIndex: false,
            wrapX: !!opt_options.wrapX
        }),
        style: opt_options.style,
        updateWhileAnimating: true,
        updateWhileInteracting: true
    });

    this.overlayPoints_ = [];

};

ol.inherits(ModifyBoxInteraction, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ModifyBoxInteraction.prototype.handleDownEvent = function (evt) {
    this.deltaX = 0;
    this.deltaY = 0;

    var feature = this.getFeatureUnderMouse_(evt);

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;

        var element = evt.map.getTargetElement();

        if (element.style.cursor !== this.grabbingCursor_) {
            element.style.cursor = this.grabbingCursor_;
        }

    }

    return !!feature;
};



/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ModifyBoxInteraction.prototype.handleDragEvent = function (evt) {
    var feature = this.getFeature_(evt);

    this.deltaX = evt.coordinate[0] - this.coordinate_[0];
    this.deltaY = evt.coordinate[1] - this.coordinate_[1];

    feature.getGeometry().translate(this.deltaX, this.deltaY);

    var element = evt.map.getTargetElement();
    element.style.cursor = this.grabbingCursor_;

    this.handleModify_(evt);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ModifyBoxInteraction.prototype.handleMoveEvent = function (evt) {
    var feature = this.getFeatureUnderMouse_(evt);

    var element = evt.map.getTargetElement();

    if (feature) {
        if (element.style.cursor !== this.grabCursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.grabCursor_;
        }
    } else if (this.previousCursor_ !== undefined) {
        element.style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
    }
};


/**
 * @return {boolean} `false` to stop the drag sequence.
 */
ModifyBoxInteraction.prototype.handleUpEvent = function (evt) {

    this.deltaX = 0;
    this.deltaY = 0;

    var element = evt.map.getTargetElement();

    if (this.feature_) {
        element.style.cursor = this.grabCursor_;
    } else {
        element.style.cursor = undefined;
    }

    this.dispatchEvent({type: "modifyend", feature: this.feature_});


    this.coordinate_ = null;
    this.feature_ = null;
    return false;
};



/**
 * @inheritDoc
 */
ModifyBoxInteraction.prototype.handleModify_ = function (e) {
    var featureModifiedByModifyPoint = this.getFeatureOfModifyPoint_(this.feature_);

    // cas d'une feature hors point modifié par un de ses points de modification
    if (featureModifiedByModifyPoint) {

        this.setFeatureByModifyPoints_(featureModifiedByModifyPoint);

        // cas d'une feature autre qu'un point pour bouger ses points de modification
    } else {
        this.moveModifyPointsWithFeature_();

    }

};

/**
 * @inheritDoc
 */
ModifyBoxInteraction.prototype.setActive = function (active) {
    ol.interaction.Pointer.prototype.setActive.call(this, active);

    if (active) {
        this.enableModificationPoints(this.features);
    } else {
        this.disableModificationPoints(this.features);
    }
};

//activer les points de modification
ModifyBoxInteraction.prototype.enableModificationPoints = function (featuresCollection) {
    this.getMap().addLayer(this.overlay_);
    this.overlayPoints_ = [];

    featuresCollection.forEach(function (feature) {
        this.addModificationPoints_(feature);

    }.bind(this));
};

//desactiver les points de modification
ModifyBoxInteraction.prototype.disableModificationPoints = function (featuresCollection) {
    this.removeModificationPoints_(featuresCollection);
};


ModifyBoxInteraction.prototype.removeModificationPoints_ = function (featuresCollection) {
    // retirer les interractions sur les points de modification
    for (var i in this.overlayPoints_) {
        for (var u in this.overlayPoints_[i].modificationPoints) {
            featuresCollection.remove(this.overlayPoints_[i].modificationPoints[u]);
        }
    }

    this.overlay_.getSource().clear();
    this.getMap().removeLayer(this.overlay_);
    this.overlayPoints_ = [];


};

ModifyBoxInteraction.prototype.addModificationPoints_ = function (feature) {

    var coordsOfBoxCorners = feature.getGeometry().getCoordinates()[0];

    var modificationPoints = [];

    for (var i in coordsOfBoxCorners) {
        if (i === "4") {
            modificationPoints[i] = modificationPoints[0];
            continue;
        }

        var modificationPoint = new ol.Feature({geometry: new ol.geom.Point(coordsOfBoxCorners[i])});
        this.overlay_.getSource().addFeature(modificationPoint);

        modificationPoints[i] = modificationPoint;
        this.features.push(modificationPoint);
    }

    this.overlayPoints_.push({feature: feature, modificationPoints: modificationPoints});
};


//desactiver les points de modification
ModifyBoxInteraction.prototype.getFeatureUnderMouse_ = function (evt) {
    return evt.map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));
};

ModifyBoxInteraction.prototype.getFeature_ = function (evt) {
    return this.feature_;
};

/*
 * Lorsqu'on fait glisser un des points de modification :
 * - met à jour la position de tous les points de modification
 * - met à jour la feature modifiée en se basant sur la position des points de modification
 */
ModifyBoxInteraction.prototype.setFeatureByModifyPoints_ = function (feature) {

    var modifyPoints = this.getModifyPointsOfFeature_(feature);


    // modifie la position des points de modification restant pour former un rectangle
    this.updateLinkedModifyPointForBBox(this.feature_, modifyPoints);

    // met à jour les coordonnées de la feature à partir des coordonées de ses points de modification
    this.redrawFeatureByModificationPointsPosition(feature, modifyPoints);

};

ModifyBoxInteraction.prototype.updateLinkedModifyPointForBBox = function (modifyPointChanged, modifyPointsToUpdate) {
    
    var indice;
    for (var i in modifyPointsToUpdate) {
        if (modifyPointChanged === modifyPointsToUpdate[i]) {
            indice = parseInt(i);
            break;
        }
    }

    var indicePointBefore = indice - 1;
    var indicePointAfter = indice + 1;

    if (indice === 0) {
        indicePointBefore = 3;
    }

    if (indice === 3) {
        indicePointAfter = 0;
    }

    if (indice % 2 !== 0) {
        modifyPointsToUpdate[indicePointBefore].getGeometry().translate(0, this.deltaY);
        modifyPointsToUpdate[indicePointAfter].getGeometry().translate(this.deltaX, 0);
    } else {
        modifyPointsToUpdate[indicePointBefore].getGeometry().translate(this.deltaX, 0);
        modifyPointsToUpdate[indicePointAfter].getGeometry().translate(0, this.deltaY);
    }


    modifyPointsToUpdate[4].getGeometry().setCoordinates(modifyPointsToUpdate[0].getGeometry().getCoordinates());

};

ModifyBoxInteraction.prototype.redrawFeatureByModificationPointsPosition = function (feature, modifyPoints) {

    var newCoords = [];
    for (var j in modifyPoints) {
        newCoords.push(modifyPoints[j].getGeometry().getCoordinates());

    }
    feature.getGeometry().setCoordinates([newCoords]);
};

ModifyBoxInteraction.prototype.moveModifyPointsWithFeature_ = function () {

    var modifyPoints = this.getModifyPointsOfFeature_(this.feature_);
    var coords;
    switch (this.feature_.getGeometry().getType()) {
        case "Polygon":
            coords = this.feature_.getGeometry().getCoordinates()[0];
            coords.pop();
            break;

        default:

            break;
    }

    for (var j in coords) {
        modifyPoints[j].getGeometry().setCoordinates(coords[j]);
    }
};




ModifyBoxInteraction.prototype.getFeatureOfModifyPoint_ = function (modifyPoint) {
    for (var i in this.overlayPoints_) {
        for (var u in this.overlayPoints_[i].modificationPoints) {

            if (this.overlayPoints_[i].modificationPoints[u] === modifyPoint) {
                return this.overlayPoints_[i].feature;
            }
        }
    }
};

ModifyBoxInteraction.prototype.getModifyPointsOfFeature_ = function (feature) {
    for (var i in this.overlayPoints_) {
        if (this.overlayPoints_[i].feature === feature) {
            return this.overlayPoints_[i].modificationPoints;
        }
    }
};



module.exports = ModifyBoxInteraction;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
(function (global){
// TODO check browserify usage (http://dontkry.com/posts/code/browserify-and-the-universal-module-definition.html)

var jQuery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var ge = {
    defaultParams: require('./ge/defaultParams'),
    GeometryEditor: require('./ge/GeometryEditor')
} ;

/**
 * Expose jQuery plugin
 */
jQuery.fn.geometryEditor = function( options ){
    return this.each(function() {
        var elem = $(this) ;
        var editor = new ge.GeometryEditor(elem,options);
        elem.data('editor',editor);
    });
} ;

global.ge = ge ;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ge/GeometryEditor":5,"./ge/defaultParams":7}]},{},[16]);
