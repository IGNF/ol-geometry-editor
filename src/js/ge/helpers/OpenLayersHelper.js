var guid = require('../util/guid');


var ol = require('openlayers');
var DrawControl = require('../util/openlayers/DrawControl');
var extent = require('turf-extent');
var featureCollectionToGeometry = require('./../util/featureCollectionToGeometry.js');
var isSingleGeometryType = require('../util/isSingleGeometryType.js');

/**
 * Openlayers constructor from a dataElement containing a serialized geometry
 * @param {Object} options
 */
var Openlayers = function (options) {

    this.settings = {
        dataProjection: "EPSG:4326",
        mapProjection: "EPSG:3857"
    };

    $.extend(this.settings, options); // deep copy
};


/**
 * Create map
 * @param {string} mapId - div map identifier
 * 
 * @return L.Map
 */
Openlayers.prototype.createMap = function (mapId, options) {
    options = options || {};

    var map = new ol.Map({
        target: mapId,
        view: new ol.View({
            center: ol.proj.transform([options.lon, options.lat], this.settings.dataProjection, this.settings.mapProjection),
            zoom: options.zoom,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom,
            projection: this.settings.mapProjection
        }),
        controls: [new ol.control.Zoom(), new ol.control.Attribution()]
    });

    return map;
};

/**
 * Add layers to Openlayers map
 * @param {ol.Map} map - map Openlayers
 * @param {Object[]} layers - array of layer configurations 
 * @param {string} layers[].url - url
 * @param {string} layers[].attribution - attribution
 * @param {Object} options - Options. Default : maxZoom = 18 
 * 
 * @return L.Map
 */
Openlayers.prototype.addLayersToMap = function (map, layers, options) {

    options = options || {};

    // init layers
    for (var i in layers) {

        map.addLayer(new ol.layer.Tile({
            source: new ol.source.XYZ({
                attributions: [layers[i].attribution],
                url: layers[i].url,
                crossOrigin: "Anonymous"
            })
        }));

    }

};

Openlayers.prototype.addControlToMap = function (map, control) {
    map.addControl(control);
};


Openlayers.prototype.setGeometries = function (featuresCollection, geometries) {
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

Openlayers.prototype.fitBoundsToMap = function (map, featuresCollection) {
    var geometries = [];
    featuresCollection.forEach(function (feature) {
        geometries.push(feature.getGeometry());
    });

    map.getView().fit((new ol.geom.GeometryCollection(geometries)).getExtent(), {
        size: map.getSize(),
        duration: 100
    });
};

Openlayers.prototype.createFeaturesCollection = function (map) {
    return new ol.Collection();
};

Openlayers.prototype.removeFeatures = function (featuresCollection) {
    featuresCollection.clear();
};

Openlayers.prototype.drawCreatedHandler = function (featuresCollection, e) {
    if (isSingleGeometryType(this.getGeometryType())) {
        this.removeFeatures(featuresCollection);
        featuresCollection.push(e.feature);
    }

};

/**
 * Get output geometry type
 * @returns {String}
 */
Openlayers.prototype.getGeometryType = function () {
    return this.settings.geometryType;
};

Openlayers.prototype.addDrawControlToMap = function (map, drawOptions) {


    var drawControlOptions = {
        features: drawOptions.features,
        type: drawOptions.geometryType
    };

    var drawControl = new DrawControl(drawControlOptions);
    map.addControl(drawControl);
};


Openlayers.prototype.addDrawEventsToMap = function (map, events) {
    map.on('draw:created', events.onDrawCreated);
    map.on('draw:edited', events.onDrawModified);
    map.on('draw:deleted', events.onDrawDeleted);
};


Openlayers.prototype.getGeoJsonGeometry = function (featuresCollection, geometryType) {

    var featuresGeoJson = (new ol.format.GeoJSON()).writeFeatures(
            featuresCollection.getArray(),
            {
                featureProjection: this.settings.mapProjection,
                dataProjection: this.settings.dataProjection
            });

    var geometry = featureCollectionToGeometry(JSON.parse(featuresGeoJson));

    if (geometry) {
        if (geometryType === 'Rectangle') {
            return JSON.stringify(extent(geometry));
        } else {
            return JSON.stringify(geometry);
        }
    } else {
        return '';
    }
};

Openlayers.prototype.getFeaturesCount = function (featuresCollection) {
    return featuresCollection.getLength();
};


module.exports = Openlayers;
