var ol = require('openlayers');

var DrawToolsControl = require('./controls/DrawToolsControl');

var guid = require('./util/guid');
var featureCollectionToGeometry = require('./util/featureCollectionToGeometry.js');
var isSingleGeometryType = require('./util/isSingleGeometryType.js');
var defaultStyleLayerFunction = require('./util/defaultStyleLayerFunction');




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
        
        var type = this.settings.geometryType;
        
        if(type === "Geometry"){
            type = geometries[i].type;
        }
        
        feature.set('type', type);
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



Viewer.prototype.addLayer = function (options) {
    var layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: options.featuresCollection
        }),
        style: defaultStyleLayerFunction
    });

    this.getMap().addLayer(layer);

    return layer;
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

/**
 * Get output geometry type
 * @returns {String}
 */
Viewer.prototype.getGeometryType = function () {
    return this.settings.geometryType;
};

Viewer.prototype.addDrawToolsControl = function (drawOptions) {

    var drawControlOptions = {
        featuresCollection: drawOptions.featuresCollection,
        type: drawOptions.geometryType,
        multiple: !isSingleGeometryType(drawOptions.geometryType)
    };

    var drawControl = new DrawToolsControl(drawControlOptions);
    this.addControl(drawControl);
};


/**
 * addDrawEvents
 * @param {Object} events
 */
Viewer.prototype.addDrawToolsEvents = function (events) {
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
