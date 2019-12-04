var bboxPolygon = require('turf-bbox-polygon');
var extent = require('turf-extent');

var defaultParams = require('./defaultParams.js');
var geometryToSimpleGeometries = require('./util/geometryToSimpleGeometries');
var isValidGeometry = require('./util/isValidGeometry');

var Viewer = require('./Viewer');

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
        this.initDrawControls();
    }

    // hide data
    if (this.settings.hide) {
        this.settings.dataElement.hide();
    }

    // export control
    this.viewer.initExportToPngControl();

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
    return typeof this.settings.dataElement.attr('value') !== 'undefined';
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
    var currentData = this.getRawData();
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
    if (geometry instanceof Array && geometry.length === 4) {
        geometry = bboxPolygon(geometry).geometry;
    }

    this.viewer.removeFeatures(this.featuresCollection);

    if(!isValidGeometry(geometry)){
        return;
    }

    var geometries = geometryToSimpleGeometries(geometry);

    this.viewer.setGeometries(this.featuresCollection, geometries);

    if (this.settings.centerOnResults && geometries.length > 0) {
        this.viewer.fitViewToFeaturesCollection(this.featuresCollection);
    }

    //this.serializeGeometry(); // doublon avec le serializeGeometry après la modification d'un dessin
};


/**
 * Init map from dataElement data
 */
GeometryEditor.prototype.initDrawLayer = function () {
    this.featuresCollection = this.viewer.createFeaturesCollection();
    var drawLayer = this.viewer.addLayer(this.featuresCollection);
    this.updateDrawLayer();
    this.settings.dataElement.on('change', this.updateDrawLayer.bind(this));
    return drawLayer;
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
            console.log(err);
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
        onDrawCreated: function (e) {
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

    this.viewer.addDrawToolsEvents(events);
};


/**
 * Serialize geometry to dataElement
 *
 * @private
 */
GeometryEditor.prototype.serializeGeometry = function () {
    var geometry = this.viewer.getGeometryByFeaturesCollection(this.featuresCollection, this.settings.precision);

    var geometryGeoJson = "";
    if (geometry) {
        if (this.getGeometryType() === 'Rectangle') {
            geometryGeoJson = JSON.stringify(extent(geometry));
        } else {
            geometryGeoJson = JSON.stringify(geometry);
        }
    }

    this.getMap().dispatchEvent({ type: 'change:geometry', 'geometry': geometryGeoJson });

    this.setRawData(geometryGeoJson);
};




module.exports = GeometryEditor;
