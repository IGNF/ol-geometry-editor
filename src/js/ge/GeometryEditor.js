import bboxPolygon from 'turf-bbox-polygon';
import extent from 'turf-extent';

import defaultParams from './defaultParams.js';
import geometryToSimpleGeometries from './util/geometryToSimpleGeometries.js';

import Viewer from './Viewer.js';

/**
 * GeometryEditor constructor from a dataElement containing a serialized geometry
 * @param {Object} dataElement
 * @param {Object} options
 */
var GeometryEditor = function (dataElement, options) {

    this.dataElement = $(dataElement);
    this.settings = {};
    $.extend(true, this.settings, defaultParams, options); // deep copy

    this.viewer = new Viewer({
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
        geometry = bboxPolygon(geometry).geometry;
    }

    this.viewer.removeFeatures(this.featuresCollection);

    let geometries = geometryToSimpleGeometries(geometry);

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
            geometryGeoJson = JSON.stringify(extent(geometry));
        } else {
            geometryGeoJson = JSON.stringify(geometry);
        }
    }

    this.settings.onResult(geometryGeoJson);
    this.setRawData(geometryGeoJson);
};


export default GeometryEditor;
