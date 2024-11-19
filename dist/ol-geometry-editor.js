/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 1:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var polygon = __webpack_require__(825);

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


/***/ }),

/***/ 841:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var each = (__webpack_require__(632)/* .coordEach */ .Fh);

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


/***/ }),

/***/ 632:
/***/ ((module) => {

var __webpack_unused_export__;
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
module.exports.Fh = coordEach;

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
__webpack_unused_export__ = coordReduce;

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
__webpack_unused_export__ = propEach;

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
__webpack_unused_export__ = propReduce;


/***/ }),

/***/ 825:
/***/ ((module) => {

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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";

// UNUSED EXPORTS: default

;// ./src/js/ge/defaultParams.js

/**
 * Default GeometryEditor parameters
 */
var defaultParams = {
    tileLayers: [
       {
           url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
           attribution: '©<a href="http://openstreetmap.org">OpenStreetMap contributors</a>'
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
    maxZoom: 19,
    geometryType: 'Geometry',
    centerOnResults: true,
    precision: 7,
    onResult: function(){}
} ;

/* harmony default export */ const ge_defaultParams = (defaultParams);

// EXTERNAL MODULE: ./node_modules/turf-bbox-polygon/index.js
var turf_bbox_polygon = __webpack_require__(1);
// EXTERNAL MODULE: ./node_modules/turf-extent/index.js
var turf_extent = __webpack_require__(841);
;// ./src/js/ge/util/geometryToSimpleGeometries.js

/**
 * Converts a multi-geometry to an array of geometries
 * @param {MultiPoint|MultiPolygon|MultiLineString} multi-geometry
 * @returns {Geometry[]} simple geometries
 */
var multiToGeometries = function(multiGeometry){
    let geometries = [] ;

    let simpleType = multiGeometry.type.substring("Multi".length) ;
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
    let geometries = [] ;
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

/* harmony default export */ const util_geometryToSimpleGeometries = (geometryToSimpleGeometries);

;// ./src/js/ge/translations/translation.fr.json
const translation_fr_namespaceObject = /*#__PURE__*/JSON.parse('{"draw":{"point":"Ajouter un point","multipoint":"Ajouter un ou plusieurs points","linestring":"Dessiner un chemin","multilinestring":"Ajouter un ou plusieurs chemins","polygon":"Dessiner un polygone","multipolygon":"Dessiner un ou plusieurs polygones","rectangle":"Dessiner une emprise"},"edit":{"point":"Modifier un point","multipoint":"Modifier un point","linestring":"Modifier un chemin","multilinestring":"Modifier un chemin","polygon":"Modifier un polygone","multipolygon":"Modifier un polygone","rectangle":"Modifier une emprise","geometry":"Modifier une géométrie"},"translate":{"point":"Déplacer un point","multipoint":"Déplacer un point","linestring":"Déplacer un chemin","multilinestring":"Déplacer un chemin","polygon":"Déplacer un polygone","multipolygon":"Déplacer un polygone","rectangle":"Déplacer une emprise","geometry":"Déplacer une géométrie"},"remove":{"point":"Supprimer un point","multipoint":"Supprimer un point","linestring":"Supprimer un chemin","multilinestring":"Supprimer un chemin","polygon":"Supprimer un polygone","multipolygon":"Supprimer un polygone","rectangle":"Supprimer une emprise","geometry":"Supprimer une géométrie"}}');
;// ./src/js/ge/controls/DrawControl.js

/**
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 * @param {String} options.type le type d'élément dessiné ('Point', 'LineString', 'Polygon' ou 'Rectangle')
 * 
 */
var DrawControl = function (options) {

    this.featuresCollection = options.featuresCollection;
    this.type = options.type || "Point";
    this.style = options.style;
    this.multiple = options.multiple;
    this.title = options.title || 'Draw a ' + this.type.toLowerCase();

    let element = $("<div>").addClass('ol-draw-' + this.type.toLowerCase() + ' ol-unselectable ol-control');

    $("<button>").attr('title', this.title)
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setActive(!this.active);

            }.bind(this))
            .appendTo(element);



    ol.control.Control.call(this, {
        element: element.get(0),
        target: options.target
    });
};

ol.inherits(DrawControl, ol.control.Control);


DrawControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

DrawControl.prototype.initControl = function () {
    this.addInteraction();
    this.active = false;
    this.setActive(this.active);
};

DrawControl.prototype.getActive = function () {
    return this.active;
};

DrawControl.prototype.setActive = function (active) {

    this.getInteraction().setActive(active);

    if (active && !this.getActive()) {
        this.dispatchEvent('draw:active');
        $(this.element).addClass('active');
        this.active = true;
    }

    if (!active && this.getActive()) {
        this.dispatchEvent('draw:inactive');
        $(this.element).removeClass('active');
        this.active = false;
    }
};

DrawControl.prototype.addInteraction = function () {

    var drawParams = {
        type: this.type,
        style: this.style,
        features: this.featuresCollection
    };

    if ('Square' === this.type) {
        drawParams.type = "Circle";
        drawParams.geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
    }

    if ('Rectangle' === this.type) {
        drawParams.type = "Circle";
        drawParams.geometryFunction = ol.interaction.Draw.createBox();
    }


    let drawInteraction = new ol.interaction.Draw(drawParams);


    drawInteraction.on('drawend', function (e) {

        if (!this.multiple) {
            this.featuresCollection.clear();
        }

        e.feature.set('type', this.type);
//        e.feature.setStyle(this.style);
    }.bind(this));

    this.featuresCollection.on('add', function (e) {

        this.getMap().dispatchEvent($.extend(e, {
            type: "draw:created"
        }));

    }.bind(this));

    this.getInteraction = function () {
        return drawInteraction;
    };

    this.getMap().addInteraction(drawInteraction);
};


/* harmony default export */ const controls_DrawControl = (DrawControl);

;// ./src/js/ge/interactions/ModifyBoxInteraction.js

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
var ModifyBoxInteraction = function (opt_options) {

    opt_options = $.extend({
        features: null
    }, opt_options);


    this.features = opt_options.features;

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


    let white = [255, 255, 255, 1];
    let blue = [0, 153, 255, 1];
    let width = 3;

    var fill = new ol.style.Fill({
        color: blue
    });

    var stroke = new ol.style.Stroke({
        color: white,
        width: width / 2
    });

    var image = new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: width * 2
    });

    var style = new ol.style.Style({
        image: image,
        fill: fill,
        stroke: stroke
    });
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
        style: opt_options.style || style,
        updateWhileAnimating: true,
        updateWhileInteracting: true
    });


    this.overlayPoints_ = [];

    ol.interaction.Pointer.call(this, {
        handleDownEvent: ModifyBoxInteraction.prototype.handleDownEvent,
        handleDragEvent: ModifyBoxInteraction.prototype.handleDragEvent,
        handleMoveEvent: ModifyBoxInteraction.prototype.handleMoveEvent,
        handleUpEvent: ModifyBoxInteraction.prototype.handleUpEvent
    });

};

ol.inherits(ModifyBoxInteraction, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ModifyBoxInteraction.prototype.handleDownEvent = function (evt) {
    this.deltaX = 0;
    this.deltaY = 0;

    let feature = this.getFeatureUnderMouse_(evt);

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;

        let element = evt.map.getTargetElement();

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
    let feature = this.getFeature_(evt);

    this.deltaX = evt.coordinate[0] - this.coordinate_[0];
    this.deltaY = evt.coordinate[1] - this.coordinate_[1];

    feature.getGeometry().translate(this.deltaX, this.deltaY);

    let element = evt.map.getTargetElement();
    element.style.cursor = this.grabbingCursor_;

    this.handleModify_(evt);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ModifyBoxInteraction.prototype.handleMoveEvent = function (evt) {
    let feature = this.getFeatureUnderMouse_(evt);

    let element = evt.map.getTargetElement();

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

    let element = evt.map.getTargetElement();

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
ModifyBoxInteraction.prototype.handleModify_ = function () {
    let featureModifiedByModifyPoint = this.getFeatureOfModifyPoint_(this.feature_);

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
    if (null !== this.getMap()) {
        this.getMap().addLayer(this.overlay_);
    }
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
    if (null !== this.getMap()) {
        this.getMap().removeLayer(this.overlay_);
    }
    this.overlayPoints_ = [];


};

ModifyBoxInteraction.prototype.addModificationPoints_ = function (feature) {

    let coordsOfBoxCorners = feature.getGeometry().getCoordinates()[0];

    let modificationPoints = [];

    for (var i in coordsOfBoxCorners) {
        if ("4" === i) {
            modificationPoints[i] = modificationPoints[0];
            continue;
        }

        let modificationPoint = new ol.Feature({geometry: new ol.geom.Point(coordsOfBoxCorners[i])});
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

ModifyBoxInteraction.prototype.getFeature_ = function () {
    return this.feature_;
};

/*
 * Lorsqu'on fait glisser un des points de modification :
 * - met à jour la position de tous les points de modification
 * - met à jour la feature modifiée en se basant sur la position des points de modification
 */
ModifyBoxInteraction.prototype.setFeatureByModifyPoints_ = function (feature) {

    let modifyPoints = this.getModifyPointsOfFeature_(feature);


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

    let indicePointBefore = indice - 1;
    let indicePointAfter = indice + 1;

    if (0 === indice) {
        indicePointBefore = 3;
    }

    if (3 === indice) {
        indicePointAfter = 0;
    }

    if (0 !== indice % 2) {
        modifyPointsToUpdate[indicePointBefore].getGeometry().translate(0, this.deltaY);
        modifyPointsToUpdate[indicePointAfter].getGeometry().translate(this.deltaX, 0);
    } else {
        modifyPointsToUpdate[indicePointBefore].getGeometry().translate(this.deltaX, 0);
        modifyPointsToUpdate[indicePointAfter].getGeometry().translate(0, this.deltaY);
    }


    modifyPointsToUpdate[4].getGeometry().setCoordinates(modifyPointsToUpdate[0].getGeometry().getCoordinates());

};

ModifyBoxInteraction.prototype.redrawFeatureByModificationPointsPosition = function (feature, modifyPoints) {

    let newCoords = [];
    for (var j in modifyPoints) {
        newCoords.push(modifyPoints[j].getGeometry().getCoordinates());

    }
    feature.getGeometry().setCoordinates([newCoords]);
};

ModifyBoxInteraction.prototype.moveModifyPointsWithFeature_ = function () {

    let modifyPoints = this.getModifyPointsOfFeature_(this.feature_);
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



/* harmony default export */ const interactions_ModifyBoxInteraction = (ModifyBoxInteraction);
;// ./src/js/ge/interactions/ModifySquareInteraction.js

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
var ModifySquareInteraction = function (opt_options) {

    opt_options = $.extend({
        features: null
    }, opt_options);

    this.features = opt_options.features;

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

    ol.interaction.Pointer.call(this, {
        handleDownEvent: ModifySquareInteraction.prototype.handleDownEvent,
        handleDragEvent: ModifySquareInteraction.prototype.handleDragEvent,
        handleMoveEvent: ModifySquareInteraction.prototype.handleMoveEvent,
        handleUpEvent: ModifySquareInteraction.prototype.handleUpEvent
    });


};

ol.inherits(ModifySquareInteraction, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ModifySquareInteraction.prototype.handleDownEvent = function (evt) {
    this.deltaX = 0;
    this.deltaY = 0;

    let feature = this.getFeatureUnderMouse_(evt);

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;

        let element = evt.map.getTargetElement();

        if (element.style.cursor !== this.grabbingCursor_) {
            element.style.cursor = this.grabbingCursor_;
        }

    }

    return !!feature;
};



/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ModifySquareInteraction.prototype.handleDragEvent = function (evt) {
    let feature = this.getFeature_(evt);

    this.deltaX = evt.coordinate[0] - this.coordinate_[0];
    this.deltaY = evt.coordinate[1] - this.coordinate_[1];

    feature.getGeometry().translate(this.deltaX, this.deltaY);

    let element = evt.map.getTargetElement();
    element.style.cursor = this.grabbingCursor_;

    this.handleModify_(evt);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ModifySquareInteraction.prototype.handleMoveEvent = function (evt) {
    let feature = this.getFeatureUnderMouse_(evt);

    let element = evt.map.getTargetElement();

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
ModifySquareInteraction.prototype.handleUpEvent = function (evt) {

    this.deltaX = 0;
    this.deltaY = 0;

    let element = evt.map.getTargetElement();

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
ModifySquareInteraction.prototype.handleModify_ = function () {
    let featureModifiedByModifyPoint = this.getFeatureOfModifyPoint_(this.feature_);

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
ModifySquareInteraction.prototype.setActive = function (active) {
    ol.interaction.Pointer.prototype.setActive.call(this, active);

    if (active) {
        this.enableModificationPoints(this.features);
    } else {
        this.disableModificationPoints(this.features);
    }
};

//activer les points de modification
ModifySquareInteraction.prototype.enableModificationPoints = function (featuresCollection) {
    if (null !== this.getMap()) {
        this.getMap().addLayer(this.overlay_);
    }

    this.overlayPoints_ = [];

    featuresCollection.forEach(function (feature) {
        this.addModificationPoints_(feature);

    }.bind(this));
};

//desactiver les points de modification
ModifySquareInteraction.prototype.disableModificationPoints = function (featuresCollection) {
    this.removeModificationPoints_(featuresCollection);
};


ModifySquareInteraction.prototype.removeModificationPoints_ = function (featuresCollection) {
    // retirer les interractions sur les points de modification
    for (var i in this.overlayPoints_) {
        for (var u in this.overlayPoints_[i].modificationPoints) {
            featuresCollection.remove(this.overlayPoints_[i].modificationPoints[u]);
        }
    }

    this.overlay_.getSource().clear();
    if (null !== this.getMap()) {
        this.getMap().removeLayer(this.overlay_);
    }
    this.overlayPoints_ = [];


};

ModifySquareInteraction.prototype.addModificationPoints_ = function (feature) {

    let coordsOfBoxCorners = feature.getGeometry().getCoordinates()[0];

    let modificationPoints = [];

    for (var i in coordsOfBoxCorners) {
        if ("4" === i) {
            modificationPoints[i] = modificationPoints[0];
            continue;
        }

        let modificationPoint = new ol.Feature({geometry: new ol.geom.Point(coordsOfBoxCorners[i])});
        this.overlay_.getSource().addFeature(modificationPoint);

        modificationPoints[i] = modificationPoint;
        this.features.push(modificationPoint);
    }

    this.overlayPoints_.push({feature: feature, modificationPoints: modificationPoints});
};


//desactiver les points de modification
ModifySquareInteraction.prototype.getFeatureUnderMouse_ = function (evt) {
    return evt.map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));
};

ModifySquareInteraction.prototype.getFeature_ = function () {
    return this.feature_;
};

/*
 * Lorsqu'on fait glisser un des points de modification :
 * - met à jour la position de tous les points de modification
 * - met à jour la feature modifiée en se basant sur la position des points de modification
 */
ModifySquareInteraction.prototype.setFeatureByModifyPoints_ = function (feature) {

    let modifyPoints = this.getModifyPointsOfFeature_(feature);


    // modifie la position des points de modification restant pour former un rectangle
    this.updateLinkedModifyPointForBBox(this.feature_, modifyPoints);

    // met à jour les coordonnées de la feature à partir des coordonées de ses points de modification
    this.redrawFeatureByModificationPointsPosition(feature, modifyPoints);

};

ModifySquareInteraction.prototype.updateLinkedModifyPointForBBox = function (modifyPointChanged, modifyPointsToUpdate) {

    var indice;
    for (var i in modifyPointsToUpdate) {
        if (modifyPointChanged === modifyPointsToUpdate[i]) {
            indice = parseInt(i);
            break;
        }
    }

    let indicePointBefore = indice - 1;
    let indicePointAfter = indice + 1;

    if (0 === indice) {
        indicePointBefore = 3;
    }

    if (3 === indice) {
        indicePointAfter = 0;
    }

    if (0 !== indice % 2) {
        modifyPointsToUpdate[indicePointBefore].getGeometry().translate(0, this.deltaY);
        modifyPointsToUpdate[indicePointAfter].getGeometry().translate(this.deltaX, 0);
    } else {
        modifyPointsToUpdate[indicePointBefore].getGeometry().translate(this.deltaX, 0);
        modifyPointsToUpdate[indicePointAfter].getGeometry().translate(0, this.deltaY);
    }


    modifyPointsToUpdate[4].getGeometry().setCoordinates(modifyPointsToUpdate[0].getGeometry().getCoordinates());

};

ModifySquareInteraction.prototype.redrawFeatureByModificationPointsPosition = function (feature, modifyPoints) {

    let newCoords = [];
    for (var j in modifyPoints) {
        newCoords.push(modifyPoints[j].getGeometry().getCoordinates());

    }
    feature.getGeometry().setCoordinates([newCoords]);
};

ModifySquareInteraction.prototype.moveModifyPointsWithFeature_ = function () {

    let modifyPoints = this.getModifyPointsOfFeature_(this.feature_);
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




ModifySquareInteraction.prototype.getFeatureOfModifyPoint_ = function (modifyPoint) {
    for (var i in this.overlayPoints_) {
        for (var u in this.overlayPoints_[i].modificationPoints) {

            if (this.overlayPoints_[i].modificationPoints[u] === modifyPoint) {
                return this.overlayPoints_[i].feature;
            }
        }
    }
};

ModifySquareInteraction.prototype.getModifyPointsOfFeature_ = function (feature) {
    for (var i in this.overlayPoints_) {
        if (this.overlayPoints_[i].feature === feature) {
            return this.overlayPoints_[i].modificationPoints;
        }
    }
};



/* harmony default export */ const interactions_ModifySquareInteraction = (ModifySquareInteraction);
;// ./src/js/ge/controls/EditControl.js




/**
 * Contrôle de modification de feature
 *
 * @constructor
 * @extends {ol.control.Control}
 *
 * @param {object} options
 *
 */
var EditControl = function (options) {

//    this.style = options.style;
    this.featuresCollection = options.featuresCollection;
    this.title = options.title || 'Edit a feature';

    let element = $("<div>").addClass('ol-edit ol-unselectable ol-control');

    $("<button>").attr('title', this.title)
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setActive(!this.active);

            }.bind(this))
            .appendTo(element);


    ol.control.Control.call(this, {
        element: element.get(0),
        target: options.target
    });
};

ol.inherits(EditControl, ol.control.Control);


EditControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

EditControl.prototype.initControl = function () {
    this.addInteractions();
    this.active = false;
    this.setActive(this.active);
};

EditControl.prototype.getActive = function () {
    return this.active;
};

EditControl.prototype.setActive = function (active) {

    this.getInteractions().forEach(function (interaction) {
        interaction.setActive(active);
    });


    if (active && !this.getActive()) {
        this.dispatchEvent('edit:active');
        $(this.element).addClass('active');
        this.active = true;
    }

    if (!active && this.getActive()) {
        this.dispatchEvent('edit:inactive');
        $(this.element).removeClass('active');
        this.active = false;
    }
};


EditControl.prototype.addInteractions = function () {

    this.reorganiseFeaturesCollectionByType();

    var modifyInteractionBasic = new ol.interaction.Modify({
        features: this.getFeaturesCollectionBasic(),
//        style: this.style
    });

    var modifyInteractionBox = new interactions_ModifyBoxInteraction({
        features: this.getFeaturesCollectionBox()
    });

    var modifyInteractionSquare = new interactions_ModifySquareInteraction({
        features: this.getFeaturesCollectionSquare()
    });

    this.getInteractions = function () {
        return [
            modifyInteractionBasic,
            modifyInteractionBox,
            modifyInteractionSquare
        ];
    };


    var modifyEnd = function (e) {
        this.getMap().dispatchEvent($.extend(e, {type: "draw:edited"}));
    }.bind(this);


    this.getInteractions().forEach(function (interaction) {
        interaction.on('modifyend', modifyEnd);
        this.getMap().addInteraction(interaction);
    }.bind(this));

};



/**
 * Prepare des ol.Collections de features afin d'appliquer chaque groupe 
 * de features à une interaction de modification
 * 
 * @returns {undefined}
 */
EditControl.prototype.reorganiseFeaturesCollectionByType = function () {

    let featuresCollectionBasic = new ol.Collection();
    this.getFeaturesCollectionBasic = function () {
        return featuresCollectionBasic;
    };

    let featuresCollectionBox = new ol.Collection();
    this.getFeaturesCollectionBox = function () {
        return featuresCollectionBox;
    };

    let featuresCollectionSquare = new ol.Collection();
    this.getFeaturesCollectionSquare = function () {
        return featuresCollectionSquare;
    };

    var addFeatureOnMatchedCollection = function (feature) {
        switch (feature.get('type')) {
            case "Rectangle":
                featuresCollectionBox.push(feature);
                break;
            case "Square":
                featuresCollectionSquare.push(feature);
                break;
            default:
                featuresCollectionBasic.push(feature);
                break;
        }
    };

    var removeFeatureOnMatchedCollection = function (feature) {
        switch (feature.get('type')) {
            case "Rectangle":
                featuresCollectionBox.remove(feature);
                break;
            case "Square":
                featuresCollectionSquare.remove(feature);
                break;

            default:
                featuresCollectionBasic.remove(feature);
                break;
        }
    };

    this.featuresCollection.forEach(addFeatureOnMatchedCollection);

    this.featuresCollection.on('add', function (e) {
        addFeatureOnMatchedCollection(e.element);
    });

    this.featuresCollection.on('remove', function (e) {
        removeFeatureOnMatchedCollection(e.element);
    });

};


/* harmony default export */ const controls_EditControl = (EditControl);

;// ./src/js/ge/controls/TranslateControl.js

/**
 * Contrôle de création d'une feature de type
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 *
 */
var TranslateControl = function (options) {

    this.title = options.title || 'Move a geometry';

    let element = $("<div>").addClass('ol-translate ol-unselectable ol-control');

    $("<button>").attr('title', this.title)
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setActive(!this.active);

            }.bind(this))
            .appendTo(element);


    ol.control.Control.call(this, {
        element: element.get(0),
        target: options.target
    });
};

ol.inherits(TranslateControl, ol.control.Control);


TranslateControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

TranslateControl.prototype.initControl = function () {
    this.addTranslateInteraction();
    this.active = false;
    this.setActive(this.active);
};


TranslateControl.prototype.getActive = function () {
    return this.active;
};


TranslateControl.prototype.setActive = function (active) {

    this.getInteraction().setActive(active);

    if (active && !this.getActive()) {
        this.dispatchEvent('translate:active');
        $(this.element).addClass('active');
        this.active = true;
    }

    if (!active && this.getActive()) {
        this.dispatchEvent('translate:inactive');
        $(this.element).removeClass('active');
        this.active = false;
    }
};


TranslateControl.prototype.addTranslateInteraction = function () {
    var translateInteraction = new ol.interaction.Translate({
        hitTolerance: 10
    });

    translateInteraction.on('translateend', function (e) {
        this.getMap().dispatchEvent($.extend(e, {type: "draw:edited"}));
    }.bind(this));

    this.getMap().addInteraction(translateInteraction);

    this.getInteraction = function () {
        return translateInteraction;
    };
};


/* harmony default export */ const controls_TranslateControl = (TranslateControl);

;// ./src/js/ge/interactions/RemoveInteraction.js

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
var RemoveInteraction = function (opt_options) {

    opt_options = $.extend({
        features: null
    }, opt_options);

    ol.interaction.Pointer.call(this, {
        handleDownEvent: RemoveInteraction.prototype.handleDownEvent,
        handleDragEvent: RemoveInteraction.prototype.handleDragEvent,
        handleMoveEvent: RemoveInteraction.prototype.handleMoveEvent,
        handleUpEvent: RemoveInteraction.prototype.handleUpEvent
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
ol.inherits(RemoveInteraction, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
RemoveInteraction.prototype.handleDownEvent = function (evt) {
    let map = evt.map;

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
RemoveInteraction.prototype.handleDragEvent = function (evt) {
    let map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));
    let element = evt.map.getTargetElement();

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
RemoveInteraction.prototype.handleMoveEvent = function (evt) {
    let map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));
    let element = evt.map.getTargetElement();

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
RemoveInteraction.prototype.handleUpEvent = function (evt) {

    let map = evt.map;

    // var deletedFeature = map.forEachFeatureAtPixel(evt.pixel,
    //         function (feature) {
    //             for (var i in this.features.getArray()) {
    //                 if (this.features.getArray()[i] === feature && this.feature_ === feature) {
    //                     this.features.remove(feature);
    //                 }
    //             }
    //         }.bind(this));

    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));

    let element = evt.map.getTargetElement();

    if (feature) {
        element.style.cursor = this.pointerCursor_;

        // gerer curseur ici
    } else if (element.style.cursor !== undefined) {
        element.style.cursor = undefined;
    }

    this.dispatchEvent({type: "deleteend"});
    return false;
};



/* harmony default export */ const interactions_RemoveInteraction = (RemoveInteraction);
;// ./src/js/ge/controls/RemoveControl.js



/**
 * Contrôle de création d'une feature de type
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 * @param {String} options.type le type d'élément dessiné ('Text', 'Point', 'LineString' ou 'Polygon')
 *
 */
var RemoveControl = function (options) {

    this.featuresCollection = options.featuresCollection;
    this.title = options.title || 'Remove a geometry';

    let element = $("<div>").addClass('ol-delete ol-unselectable ol-control');

    $("<button>").attr('title', this.title)
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setActive(!this.active);

            }.bind(this))
            .appendTo(element);


    ol.control.Control.call(this, {
        element: element.get(0),
        target: options.target
    });
};

ol.inherits(RemoveControl, ol.control.Control);


RemoveControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

RemoveControl.prototype.initControl = function () {
    this.addInteraction();
    this.active = false;
    this.setActive(this.active);
};


RemoveControl.prototype.getActive = function () {
    return this.active;
};


RemoveControl.prototype.setActive = function (active) {

    this.getInteraction().setActive(active);

    if (active && !this.getActive()) {
        this.dispatchEvent('remove:active');
        $(this.element).addClass('active');
        this.active = true;
    }

    if (!active && this.getActive()) {
        this.dispatchEvent('remove:inactive');
        $(this.element).removeClass('active');
        this.active = false;
    }
};


RemoveControl.prototype.addInteraction = function () {

    var removeInteraction = new interactions_RemoveInteraction({
        features: this.featuresCollection
    });

    this.getInteraction = function () {
        return removeInteraction;
    };

    removeInteraction.on('deleteend', function (e) {
        this.getMap().dispatchEvent($.extend(e, {type: "draw:deleted"}));
    }.bind(this));

    this.getMap().addInteraction(removeInteraction);

};

/* harmony default export */ const controls_RemoveControl = (RemoveControl);

;// ./src/images/marker-shadow.png
/* harmony default export */ const marker_shadow = ("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAYAAACoYAD2AAAC5ElEQVRYw+2YW4/TMBCF45S0S1luXZCABy5CgLQgwf//S4BYBLTdJLax0fFqmB07nnQfEGqkIydpVH85M+NLjPe++dcPc4Q8Qh4hj5D/AaQJx6H/4TMwB0PeBNwU7EGQAmAtsNfAzoZkgIa0ZgLMa4Aj6CxIAsjhjOCoL5z7Glg1JAOkaicgvQBXuncwJAWjksLtBTWZe04CnYRktUGdilALppZBOgHGZcBzL6OClABvMSVIzyBjazOgrvACf1ydC5mguqAVg6RhdkSWQFj2uxfaq/BrIZOLEWgZdALIDvcMcZLD8ZbLC9de4yR1sYMi4G20S4Q/PWeJYxTOZn5zJXANZHIxAd4JWhPIloTJZhzMQduM89WQ3MUVAE/RnhAXpTycqys3NZALOBbB7kFrgLesQl2h45Fcj8L1tTSohUwuxhy8H/Qg6K7gIs+3kkaigQCOcyEXCHN07wyQazhrmIulvKMQAwMcmLNqyCVyMAI+BuxSMeTk3OPikLY2J1uE+VHQk6ANrhds+tNARqBeaGc72cK550FP4WhXmFmcMGhTwAR1ifOe3EvPqIegFmF+C8gVy0OfAaWQPMR7gF1OQKqGoBjq90HPMP01BUjPOqGFksC4emE48tWQAH0YmvOgF3DST6xieJgHAWxPAHMuNhrImIdvoNOKNWIOcE+UXE0pYAnkX6uhWsgVXDxHdTfCmrEEmMB2zMFimLVOtiiajxiGWrbU52EeCdyOwPEQD8LqyPH9Ti2kgYMf4OhSKB7qYILbBv3CuVTJ11Y80oaseiMWOONc/Y7kJYe0xL2f0BaiFTxknHO5HaMGMublKwxFGzYdWsBF174H/QDknhTHmHHN39iWFnkZx8lPyM8WHfYELmlLKtgWNmFNzQcC1b47gJ4hL19i7o65dhH0Negbca8vONZoP7doIeOC9zXm8RjuL0Gf4d4OYaU5ljo3GYiqzrWQHfJxA6ALhDpVKv9qYeZA8eM3EhfPSCmpuD0AAAAASUVORK5CYII=");
;// ./src/images/marker-icon.png
/* harmony default export */ const marker_icon = ("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAGmklEQVRYw7VXeUyTZxjvNnfELFuyIzOabermMZEeQC/OclkO49CpOHXOLJl/CAURuYbQi3KLgEhbrhZ1aDwmaoGqKII6odATmH/scDFbdC7LvFqOCc+e95s2VG50X/LLm/f4/Z7neY/ne18aANCmAr5E/xZf1uDOkTcGcWR6hl9247tT5U7Y6SNvWsKT63P58qbfeLJG8M5qcgTknrvvrdDbsT7Ml+tv82X6vVxJE33aRmgSyYtcWVMqX97Yv2JvW39UhRE2HuyBL+t+gK1116ly06EeWFNlAmHxlQE0OMiV6mQCScusKRlhS3QLeVJdl1+23h5dY4FNB3thrbYboqptEFlphTC1hSpJnbRvxP4NWgsE5Jyz86QNNi/5qSUTGuFk1gu54tN9wuK2wc3o+Wc13RCmsoBwEqzGcZsxsvCSy/9wJKf7UWf1mEY8JWfewc67UUoDbDjQC+FqK4QqLVMGGR9d2wurKzqBk3nqIT/9zLxRRjgZ9bqQgub+DdoeCC03Q8j+0QhFhBHR/eP3U/zCln7Uu+hihJ1+bBNffLIvmkyP0gpBZWYXhKussK6mBz5HT6M1Nqpcp+mBCPXosYQfrekGvrjewd59/GvKCE7TbK/04/ZV5QZYVWmDwH1mF3xa2Q3ra3DBC5vBT1oP7PTj4C0+CcL8c7C2CtejqhuCnuIQHaKHzvcRfZpnylFfXsYJx3pNLwhKzRAwAhEqG0SpusBHfAKkxw3w4627MPhoCH798z7s0ZnBJ/MEJbZSbXPhER2ih7p2ok/zSj2cEJDd4CAe+5WYnBCgR2uruyEw6zRoW6/DWJ/OeAP8pd/BGtzOZKpG8oke0SX6GMmRk6GFlyAc59K32OTEinILRJRchah8HQwND8N435Z9Z0FY1EqtxUg+0SO6RJ/mmXz4VuS+DpxXC3gXmZwIL7dBSH4zKE50wESf8qwVgrP1EIlTO5JP9Igu0aexdh28F1lmAEGJGfh7jE6ElyM5Rw/FDcYJjWhbeiBYoYNIpc2FT/SILivp0F1ipDWk4BIEo2VuodEJUifhbiltnNBIXPUFCMpthtAyqws/BPlEF/VbaIxErdxPphsU7rcCp8DohC+GvBIPJS/tW2jtvTmmAeuNO8BNOYQeG8G/2OzCJ3q+soYB5i6NhMaKr17FSal7GIHheuV3uSCY8qYVuEm1cOzqdWr7ku/R0BDoTT+DT+ohCM6/CCvKLKO4RI+dXPeAuaMqksaKrZ7L3FE5FIFbkIceeOZ2OcHO6wIhTkNo0ffgjRGxEqogXHYUPHfWAC/lADpwGcLRY3aeK4/oRGCKYcZXPVoeX/kelVYY8dUGf8V5EBRbgJXT5QIPhP9ePJi428JKOiEYhYXFBqou2Guh+p/mEB1/RfMw6rY7cxcjTrneI1FrDyuzUSRm9miwEJx8E/gUmqlyvHGkneiwErR21F3tNOK5Tf0yXaT+O7DgCvALTUBXdM4YhC/IawPU+2PduqMvuaR6eoxSwUk75ggqsYJ7VicsnwGIkZBSXKOUww73WGXyqP+J2/b9c+gi1YAg/xpwck3gJuucNrh5JvDPvQr0WFXf0piyt8f8/WI0hV4pRxxkQZdJDfDJNOAmM0Ag8jyT6hz0WGXWuP94Yh2jcfjmXAGvHCMslRimDHYuHuDsy2QtHuIavznhbYURq5R57KpzBBRZKPJi8eQg48h4j8SDdowifdIrEVdU+gbO6QNvRRt4ZBthUaZhUnjlYObNagV3keoeru3rU7rcuceqU1mJBxy+BWZYlNEBH+0eH4vRiB+OYybU2hnblYlTvkHinM4m54YnxSyaZYSF6R3jwgP7udKLGIX6r/lbNa9N6y5MFynjWDtrHd75ZvTYAPO/6RgF0k76mQla3FGq7dO+cH8sKn0Vo7nDllwAhqwLPkxrHwWmHJOo+AKJ4rab5OgrM7rVu8eWb2Pu0Dh4eDgXoOfvp7Y7QeqknRmvcTBEyq9m/HQQSCSz6LHq3z0yzsNySRfMS253wl2KyRDbcZPcfJKjZmSEOjcxyi+Y8dUOtsIEH6R2wNykdqrkYJ0RV92H0W58pkfQk7cKevsLK10Py8SdMGfXNXATY+pPbyJR/ET6n9nIfztNtZYRV9XniQu9IA2vOVgy4ir7GCLVmmd+zjkH0eAF9Po6K61pmCXHxU5rHMYd1ftc3owjwRSVRzLjKvqZEty6cRUD7jGqiOdu5HG6MdHjNcNYGqfDm5YRzLBBCCDl/2bk8a8gdbqcfwECu62Fg/HrggAAAABJRU5ErkJggg==");
;// ./src/js/ge/util/defaultStyleDrawFunction.js



var getDefaultStyle = function () {


    var fill = new ol.style.Fill({
        color: 'rgba(255,255,255,0.4)'
    });

    var stroke = new ol.style.Stroke({
        color: '#3399CC',
        width: 1.25
    });

    var image = new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: 5
    });

    return [
        new ol.style.Style({
            image: image,
            fill: fill,
            stroke: stroke
        })
    ];
};


var defaultStyleDrawFunction = function (feature, resolution, type) {

    switch (type) {
        case "Point":
        case "MultiPoint":
            var markerStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 41],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                      src: marker_icon
                })
            });
            var shadowMarker = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [14, 41],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                      src: marker_shadow
                })
            });
            return [shadowMarker, markerStyle];
    }

    return getDefaultStyle();

};

/* harmony default export */ const util_defaultStyleDrawFunction = (defaultStyleDrawFunction);

;// ./src/js/ge/controls/DrawToolsControl.js











/**
 * Contrôle d'outils de dessins
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 * @param {String} options.type le type d'élément dessiné ('Text', 'Point', 'LineString' ou 'Polygon')
 * 
 */
var DrawToolsControl = function (options) {
    this.translations = $.extend(translation_fr_namespaceObject, options.translations || {});

    this.featuresCollection = options.featuresCollection || new ol.Collection();
    this.type = options.type || "Geometry";
    this.multiple = options.multiple || false;
    this.style = options.style;

    this.controls = [];

    let drawBar = $("<div>").addClass('ol-draw-tools ol-unselectable ol-control');

    ol.control.Control.call(this, {
        element: drawBar.get(0),
        target: options.target
    });
};

ol.inherits(DrawToolsControl, ol.control.Control);


DrawToolsControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

DrawToolsControl.prototype.initControl = function () {

    this.addDrawControls();
    this.addEditControl();
    this.addTranslateControl();
    this.addRemoveControl();

};


DrawToolsControl.prototype.addDrawControls = function () {
    if ("Geometry" === this.type) {
        this.addDrawControl({type: "MultiPoint", multiple: true, title: this.translations.draw.multipoint});
        this.addDrawControl({type: "MultiLineString", multiple: true, title: this.translations.draw.multilinestring});
        this.addDrawControl({type: "MultiPolygon", multiple: true, title: this.translations.draw.multipolygon});
    } else {
        this.addDrawControl({type: this.type, multiple: this.multiple, title: this.translations.draw[this.type.toLowerCase()]});
    }

};

DrawToolsControl.prototype.addDrawControl = function (options) {
    options = options || {};

    var drawControl = new controls_DrawControl({
        featuresCollection: this.featuresCollection,
        type: options.type,
        target: this.element,
        style: function(feature, resolution){
            return util_defaultStyleDrawFunction(feature,resolution, options.type);
        },
        multiple: options.multiple,
        title: options.title
    });

    drawControl.on('draw:active', function () {
        this.deactivateControls(drawControl);
    }.bind(this));

    this.getMap().addControl(drawControl);
    this.controls.push(drawControl);
};

DrawToolsControl.prototype.addEditControl = function () {
    var editControl = new controls_EditControl({
        featuresCollection: this.featuresCollection,
        target: this.element,
        title: this.translations.edit[this.type.toLowerCase()]
    });

    editControl.on('edit:active', function () {
        this.deactivateControls(editControl);
    }.bind(this));

    this.getMap().addControl(editControl);
    this.controls.push(editControl);
};

DrawToolsControl.prototype.addTranslateControl = function () {
    var translateControl = new controls_TranslateControl({
        featuresCollection: this.featuresCollection,
        target: this.element,
        title: this.translations.translate[this.type.toLowerCase()]
    });

    translateControl.on('translate:active', function () {
        this.deactivateControls(translateControl);
    }.bind(this));

    this.getMap().addControl(translateControl);
    this.controls.push(translateControl);
};

DrawToolsControl.prototype.addRemoveControl = function () {
    var removeControl = new controls_RemoveControl({
        featuresCollection: this.featuresCollection,
        target: this.element,
        title: this.translations.remove[this.type.toLowerCase()]
    });

    removeControl.on('remove:active', function () {
        this.deactivateControls(removeControl);
    }.bind(this));

    this.getMap().addControl(removeControl);
    this.controls.push(removeControl);

};

DrawToolsControl.prototype.deactivateControls = function (keepThisOne) {
    this.controls.forEach(function (control) {
        if (control !== keepThisOne) {
            control.setActive(false);
        }
    });
};


/* harmony default export */ const controls_DrawToolsControl = (DrawToolsControl);

;// ./src/js/ge/util/guid.js

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

/* harmony default export */ const util_guid = (guid);

;// ./src/js/ge/util/geometriesToCollection.js

/**
 * Converts an array of geometries to a collection (MultiPoint, MultiLineString,
 * MultiPolygon, GeometryCollection).
 */
var geometriesToCollection = function(geometries){
    // count by geometry type
    let counts = {};
    geometries.forEach(function(geometry){
        if ( 'undefined' === typeof counts[geometry.type] ){
            counts[geometry.type] = 1 ;
        }else{
            counts[geometry.type]++ ;
        }
    }) ;

    let geometryTypes = Object.keys(counts) ;
    if ( 1 < geometryTypes.length ){
        return {
            "type": "GeometryCollection",
            "geometries": geometries
        } ;
    }else{
        let multiType = "Multi"+Object.keys(counts)[0] ;
        let coordinates = [];
        geometries.forEach(function(geometry){
            coordinates.push(geometry.coordinates);
        }) ;
        return {
            "type": multiType,
            "coordinates": coordinates
        } ;
    }
} ;

/* harmony default export */ const util_geometriesToCollection = (geometriesToCollection);

;// ./src/js/ge/util/featureCollectionToGeometry.js



/**
 * Converts FeatureCollection to a normalized geometry
 */
var featureCollectionToGeometry = function(featureCollection){
    let geometries = [] ;
    featureCollection.features.forEach(function(feature){
        geometries.push( feature.geometry ) ;
    });

    if ( 0 === geometries.length ){
        return null ;
    }

    if ( 1 == geometries.length ){
        return geometries[0];
    }else{
        return util_geometriesToCollection(geometries) ;
    }
} ;

/* harmony default export */ const util_featureCollectionToGeometry = (featureCollectionToGeometry);

;// ./src/js/ge/util/isSingleGeometryType.js

/**
 * Indicates if the given type corresponds to a mutli geometry
 * @param {String} geometryType tested geometry type
 */
var isSingleGeometryType = function(geometryType) {
    return -1 !== ["Point","LineString","Polygon","Rectangle"].indexOf(geometryType) ;
};

/* harmony default export */ const util_isSingleGeometryType = (isSingleGeometryType);

;// ./src/js/ge/util/defaultStyleLayerFunction.js



var defaultStyleLayerFunction_getDefaultStyle = function () {


    var fill = new ol.style.Fill({
        color: 'rgba(255,255,255,0.4)'
    });

    var stroke = new ol.style.Stroke({
        color: '#3399CC',
        width: 1.25
    });

    var image = new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: 5
    });

    return [
        new ol.style.Style({
            image: image,
            fill: fill,
            stroke: stroke
        })
    ];
};

var defaultStyleLayerFunction = function (feature) {

    let type = feature.getGeometry().getType();

    switch (type) {
        case "Point":
        case "MultiPoint":
            var markerStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 41],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: marker_icon
//                    src: "../../../images/marker-icon.png"
                })
            });
            var shadowMarker = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [14, 41],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: marker_shadow
//                    src: "../../../images/marker-shadow.png"
                })
            });
            return [shadowMarker, markerStyle];
    }

    return defaultStyleLayerFunction_getDefaultStyle();

};

/* harmony default export */ const util_defaultStyleLayerFunction = (defaultStyleLayerFunction);



;// ./src/js/ge/Viewer.js











/**
 * Geometry editor viewer
 *
 * @param {Object} options
 */
var Viewer = function (options) {

    this.settings = {
        dataProjection: "EPSG:4326",
        mapProjection: "EPSG:3857"
    };

    $.extend(this.settings, options); // deep copy

    this.map = null;
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
    let mapTargetId = 'map-' + util_guid();
    var $mapDiv = $('<div id="' + mapTargetId + '"></div>');
    $mapDiv.addClass('map');
    $mapDiv.css('width', options.width);
    $mapDiv.css('height', options.height);
    $mapDiv.insertAfter(options.dataElement);

    // create map
    this.map = this.createMap(mapTargetId, options);

    this.addLayersToMap(options.layers);

};

Viewer.prototype.getMap = function () {
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
        controls: [new ol.control.Zoom(), new ol.control.Attribution({
            collapsible: false
        })]
    });

};

/**
 * Add layers to Viewer map
 *
 * @param {Object[]} layers - array of layer configurations
 * @param {string} layers[].url - url
 * @param {string} layers[].attribution - attribution
 *
 */
Viewer.prototype.addLayersToMap = function (layers) {

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
 * @param {ol.Collection} featuresCollection
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
            case "MultiPoint":
                geom = new ol.geom.MultiPoint(geometries[i].coordinates);
                break;
            case "MultiLineString":
                geom = new ol.geom.MultiLineString(geometries[i].coordinates);
                break;
            case "MultiPolygon":
                geom = new ol.geom.MultiPolygon(geometries[i].coordinates);
                break;
        }

        var feature = new ol.Feature({
            geometry: geom.transform(this.settings.dataProjection, this.settings.mapProjection)
        });

        let type = this.settings.geometryType;

        if("Geometry" === type){
            type = geometries[i].type;
        }

        feature.set('type', type);
        featuresCollection.push(feature);
    }
    this.getMap().dispatchEvent('set:geometries');
};

/**
 * Recentre la vue de la carte sur la collection de features
 * @param {ol.Collection} featuresCollection
 */
Viewer.prototype.fitViewToFeaturesCollection = function (featuresCollection) {
    let geometries = [];
    featuresCollection.forEach(function (feature) {
        geometries.push(feature.getGeometry());
    });

    this.getMap().getView().fit((new ol.geom.GeometryCollection(geometries)).getExtent(), {
        size: this.getMap().getSize(),
        duration: 100
    });
};


/**
 * 
 * @param {ol.Collection} featuresCollection
 * @returns {ol.layer.Vector}
 */
Viewer.prototype.addLayer = function (featuresCollection) {
    var layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: featuresCollection
        }),
        style: util_defaultStyleLayerFunction
    });

    this.getMap().addLayer(layer);

    return layer;
};

/**
 * 
 * @returns {ol.Collection}
 */
Viewer.prototype.createFeaturesCollection = function () {
    return new ol.Collection();
};

/**
 * @description Supprime les features de la collection de feature
 * @param {ol.Collection} featuresCollection - Collection de features
 */
Viewer.prototype.removeFeatures = function (featuresCollection) {
    featuresCollection.clear();
};

/**
 * Get output geometry type
 * @returns {String}
 */
Viewer.prototype.getGeometryType = function () {
    return this.settings.geometryType;
};

/**
 * @description Ajoute les controles de dessin
 * 
 * @param {object} drawOptions - (featuresCollection, geometryType)
 */
Viewer.prototype.addDrawToolsControl = function (drawOptions) {

    var drawControlOptions = {
        featuresCollection: drawOptions.featuresCollection,
        type: drawOptions.geometryType,
        multiple: !util_isSingleGeometryType(drawOptions.geometryType),
        translations: drawOptions.translations
    };

    let drawToolsControl = new controls_DrawToolsControl(drawControlOptions);

    this.getMap().on('set:geometries',function(){
        drawToolsControl.deactivateControls();
    });

    this.addControl(drawToolsControl);
};


/**
 * addDrawEvents
 * @param {Object} events ({fn} onDrawCreated, {fn} onDrawModified, {fn} onDrawDeleted)
 */
Viewer.prototype.addDrawToolsEvents = function (events) {
    this.getMap().on('draw:created', events.onDrawCreated);
    this.getMap().on('draw:edited', events.onDrawModified);
    this.getMap().on('draw:deleted', events.onDrawDeleted);
};

/**
 * 
 * @param {ol.Collection} featuresCollection
 * @returns {ol.Geometry} 
 */
Viewer.prototype.getGeometryByFeaturesCollection = function (featuresCollection, precision) {

    var featuresGeoJson = (new ol.format.GeoJSON()).writeFeatures(
            featuresCollection.getArray(),
            {
                featureProjection: this.settings.mapProjection,
                dataProjection: this.settings.dataProjection,
                decimals: precision
            });

    return util_featureCollectionToGeometry(JSON.parse(featuresGeoJson));

};

/**
 * 
 * @param {ol.Collection} featuresCollection
 * @returns {number}
 */
Viewer.prototype.getFeaturesCount = function (featuresCollection) {
    return featuresCollection.getLength();
};



/* harmony default export */ const ge_Viewer = (Viewer);

;// ./src/js/ge/GeometryEditor.js








/**
 * GeometryEditor constructor from a dataElement containing a serialized geometry
 * @param {Object} dataElement
 * @param {Object} options
 */
var GeometryEditor = function (dataElement, options) {

    this.dataElement = $(dataElement);
    this.settings = {};
    $.extend(true, this.settings, ge_defaultParams, options); // deep copy

    this.viewer = new ge_Viewer({
        geometryType: this.settings.geometryType
    });

    // init map
    this.map = null;
    this.initMap();

    // init features
    this.drawLayer = null;
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
    this.viewer.initMap({
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

    this.map = this.viewer.getMap();
};

/**
 * Indicates if data element is an input field (<input>, <textarea>, etc.)
 * @private
 */
GeometryEditor.prototype.getMap = function () {
    return this.map;
};

/**
 * Indicates if data element is an input field (<input>, <textarea>, etc.)
 * @private
 */
GeometryEditor.prototype.isDataElementAnInput = function () {
    return 'undefined' !== typeof this.dataElement.attr('value');
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
    let currentData = this.getRawData();
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
    if (geometry instanceof Array && 4 === geometry.length) {
        geometry = turf_bbox_polygon(geometry).geometry;
    }

    this.viewer.removeFeatures(this.featuresCollection);

    let geometries = util_geometryToSimpleGeometries(geometry);

    this.viewer.setGeometries(this.featuresCollection, geometries);

    if (this.settings.centerOnResults && 0 < geometries.length) {
        this.viewer.fitViewToFeaturesCollection(this.featuresCollection);
    }

    this.serializeGeometry();
};


/**
 * Init map from dataElement data
 */
GeometryEditor.prototype.initDrawLayer = function () {
    this.featuresCollection = this.viewer.createFeaturesCollection();
    this.drawLayer = this.viewer.addLayer(this.featuresCollection);
    this.updateDrawLayer();
    this.dataElement.on('change', this.updateDrawLayer.bind(this));
};

/**
 * Update draw layer from data
 */
GeometryEditor.prototype.updateDrawLayer = function () {
    let data = this.getRawData();
    var geometry;
    if ('' !== data) {
        try {
            geometry = JSON.parse(data);
            this.setGeometry(geometry);
        } catch (err) {
            this.viewer.removeFeatures(this.featuresCollection);
            return;
        }
    } else {
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
        featuresCollection: this.featuresCollection,
        translations: this.settings.translations
    };

    this.viewer.addDrawToolsControl(drawOptions);

    var events = {
        onDrawCreated: function () {
            if (this.settings.centerOnResults && 0 < this.viewer.getFeaturesCount(this.featuresCollection)) {
                this.viewer.fitViewToFeaturesCollection(this.featuresCollection);
            }
            this.serializeGeometry();
        }.bind(this),
        onDrawModified: function () {
            if (this.settings.centerOnResults && 0 < this.viewer.getFeaturesCount(this.featuresCollection)) {
                this.viewer.fitViewToFeaturesCollection(this.featuresCollection);
            }
            this.serializeGeometry();
        }.bind(this),
        onDrawDeleted: function () {
            this.serializeGeometry();
        }.bind(this)
    };

    this.viewer.addDrawToolsEvents(events);
};


/**
 * Serialize geometry to dataElement
 *
 * @private
 */
GeometryEditor.prototype.serializeGeometry = function () {
    let geometry = this.viewer.getGeometryByFeaturesCollection(this.featuresCollection, this.settings.precision);

    let geometryGeoJson = "";
    if (geometry) {
        if ('Rectangle' === this.getGeometryType()) {
            geometryGeoJson = JSON.stringify(turf_extent(geometry));
        } else {
            geometryGeoJson = JSON.stringify(geometry);
        }
    }

    this.settings.onResult(geometryGeoJson);
    this.setRawData(geometryGeoJson);
};


/* harmony default export */ const ge_GeometryEditor = (GeometryEditor);

;// ./src/js/ge.js





//import ../images/.css

let ge = {
    defaultParams: ge_defaultParams,
    GeometryEditor: ge_GeometryEditor
};


if (jQuery) {
    /**
     * Expose jQuery plugin
     */
    jQuery.fn.geometryEditor = function (options) {
        return this.each(function () {
            let editor = new ge.GeometryEditor(this, options);
            $(this).data('editor', editor);
        });
    };
}

window.ge = ge;

/* harmony default export */ const js_ge = ((/* unused pure expression or super */ null && (ge)));

})();

/******/ })()
;