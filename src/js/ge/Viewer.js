
import DrawToolsControl from './controls/DrawToolsControl.js';

import guid from './util/guid.js';
import featureCollectionToGeometry from './util/featureCollectionToGeometry.js';
import isSingleGeometryType from './util/isSingleGeometryType.js';
import defaultStyleLayerFunction from './util/defaultStyleLayerFunction.js';




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
    let mapTargetId = 'map-' + guid();
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
        style: defaultStyleLayerFunction
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
        multiple: !isSingleGeometryType(drawOptions.geometryType),
        translations: drawOptions.translations
    };

    let drawToolsControl = new DrawToolsControl(drawControlOptions);

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

    return featureCollectionToGeometry(JSON.parse(featuresGeoJson));

};

/**
 * 
 * @param {ol.Collection} featuresCollection
 * @returns {number}
 */
Viewer.prototype.getFeaturesCount = function (featuresCollection) {
    return featuresCollection.getLength();
};



export default Viewer;
