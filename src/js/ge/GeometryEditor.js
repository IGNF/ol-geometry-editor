import bboxPolygon from 'turf-bbox-polygon';
import extent from 'turf-extent';

import defaultParams from './defaultParams.js';
import geometryToSimpleGeometries from './util/geometryToSimpleGeometries.js';
import isValidGeometry from './util/isValidGeometry.js';

import Viewer from './Viewer.js';

/**
 * GeometryEditor constructor from a dataElement containing a serialized geometry
 * @param {Object} dataElement
 * @param {Object} options
 */
var GeometryEditor = function (dataElement, options) {

    this.settings = {
        dataElement: $(dataElement)
    };

    $.extend(true, this.settings, defaultParams, options); // deep copy


    // init viewer
    this.viewer = new Viewer({
        geometryType: this.settings.geometryType
    });

    // init map
    this.map = this.initMap();

    // init tileLayerSwitcher
    this.tileLayerSwitcher = null;
    if (this.settings.tileLayerSwitcher) {
        this.tileLayerSwitcher = this.viewer.initTreeLayerSwitcher(this.settings);
    }

    // init draw features
    this.drawLayer = this.initDrawLayer();

    // draw controls
    if (this.settings.editable) {
        this.drawToolsControl = this.initDrawControls();
    }

    // hide data
    if (this.settings.hide) {
        this.settings.dataElement.hide();
    }

    // export to image control
    if (this.settings.allowCapture) {
        this.viewer.initExportToPngControl();
    }

};


/**
 * Init map
 *
 * @return ol.Map
 */
GeometryEditor.prototype.initMap = function () {
    this.viewer.initMap(this.settings);
    return this.viewer.getMap();
};

/**
 * Get map object
 * @public
 */
GeometryEditor.prototype.getMap = function () {
    return this.map;
};

/**
 * Get draw layer object
 * @public
 */
GeometryEditor.prototype.getGeometryLayer = function () {
    return this.drawLayer;
};

/**
 * Indicates if data element is an input field (<input>, <textarea>, etc.)
 * @private
 */
GeometryEditor.prototype.isDataElementAnInput = function () {
    return this.settings.dataElement.is('input') || this.settings.dataElement.is('textarea');
};

/**
 * Get raw data from the dataElement
 * @returns {String}
 */
GeometryEditor.prototype.getRawData = function () {
    if (this.isDataElementAnInput()) {
        return $.trim(this.settings.dataElement.val());
    } else {
        return $.trim(this.settings.dataElement.html());
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
        this.settings.dataElement.val(value);
    } else {
        this.settings.dataElement.html(value);
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

    if(!isValidGeometry(geometry)){
        return;
    }

    var geometries = geometryToSimpleGeometries(geometry);

    this.viewer.setGeometries(this.featuresCollection, geometries);

    if (this.settings.centerOnResults && 0 < geometries.length) {
        this.viewer.fitViewToFeaturesCollection(this.featuresCollection);
    }

    //this.serializeGeometry(); // doublon avec le serializeGeometry après la modification d'un dessin
};


/**
 * Init map from dataElement data
 */
GeometryEditor.prototype.initDrawLayer = function () {
    this.featuresCollection = this.viewer.createFeaturesCollection();
    var drawLayer = this.viewer.addLayer(this.featuresCollection, this.settings.style);
    this.updateDrawLayer();
    this.settings.dataElement.on('change', this.updateDrawLayer.bind(this));
    return drawLayer;
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
            console.error(err);
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
        // featuresCollection: this.featuresCollection,
        layer: this.drawLayer,
        translations: this.settings.translations,
        style: this.settings.style
    };

    var drawToolsControl = this.viewer.addDrawToolsControl(drawOptions);

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

    return drawToolsControl;
};


/**
 * get Serialized geometrie(s)
 *
 * @public
 */
GeometryEditor.prototype.getSerializedGeometry = function () {
    var geometry = this.viewer.getGeometryByFeaturesCollection(this.featuresCollection, this.settings.precision);

    let geometryGeoJson = "";
    if (geometry) {
        if ('Rectangle' === this.getGeometryType()) {
            geometryGeoJson = JSON.stringify(extent(geometry));
        } else {
            geometryGeoJson = JSON.stringify(geometry);
        }
    }
    return geometryGeoJson;
};

/**
 * Serialize geometry to dataElement
 *
 * @private
 */
GeometryEditor.prototype.serializeGeometry = function () {

    var geometryGeoJson = this.getSerializedGeometry();

    this.getMap().dispatchEvent({ type: 'change:geometry', 'geometry': geometryGeoJson });

    this.setRawData(geometryGeoJson);
};


export default GeometryEditor;
