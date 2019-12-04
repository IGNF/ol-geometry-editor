
var DrawToolsControl = require('./controls/DrawToolsControl');
var TileLayerSwitcher = require('./controls/TileLayerSwitcherControl');
var ExportToPngControl = require('./controls/ExportToPngControl');

var guid = require('./util/guid');
var featureCollectionToGeometry = require('./util/featureCollectionToGeometry.js');
var isSingleGeometryType = require('./util/isSingleGeometryType.js');
var defaultStyleLayerFunction = require('./util/defaultStyleLayerFunction');

var TileLayer = require('./models/TileLayer');




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
};

/**
 * Initialise a map
 * @param {Object} params - params are :
 *
 * @param {string|int} params.height - map height
 * @param {string|int} params.width - map width
 * @param {float} params.lat - latitude at start for map center
 * @param {float} params.lon - longitude at start for map center
 * @param {float} params.zoom - map zoom
 *
 * @param {Object[]} params.tileLayers - array of layer configurations
 * @param {string} params.tileLayers[].url - url
 * @param {string} params.tileLayers[].attribution - attribution
 * @param {string} params.tileLayers[].title - titre
 *
 */
Viewer.prototype.initMap = function (params) {

    // create map div
    var mapTargetId = 'map-' + guid();
    var $mapDiv = $('<div id="' + mapTargetId + '"></div>');
    $mapDiv.addClass('map');
    $mapDiv.css('width', params.width);
    $mapDiv.css('height', params.height);
    $mapDiv.insertAfter(params.dataElement);

    // create map
    this.map = this.createMap(mapTargetId, params);

    this.layers = this.createLayersFromTileLayersConfig(params.tileLayers);
    this.addLayersToMap(this.layers);

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
 * init TreeLayerSwitcher
 *
 * @param {array|null} switchableLayers
 * @param {array} tileCoordinates
 * @param {string|int} defaultSwitchableTile
 *
 * return TreeLayerSwitcher
 */
Viewer.prototype.initTreeLayerSwitcher = function (params) {
    var tileLayerSwitcherControl = this.addTileLayerSwitcher(this.layers, params);
    tileLayerSwitcherControl.setFondCartoByTilePosition(params.defaultSwitchableTile);
    return tileLayerSwitcherControl;
};

/**
 * Init control export to png
 */
Viewer.prototype.initExportToPngControl = function(){
    var exportToPngControl = new ExportToPngControl();
    this.addControl(exportToPngControl);
};

/**
 * Add layers to Viewer map
 *
 * @param {array<ol.layer.Layer>} layers - array of layer configurations
 *
 */
Viewer.prototype.addLayersToMap = function (layers) {
    for (var i in layers) {
        if (layers[i] !== null) {
            this.getMap().addLayer(layers[i]);
        }
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

        var type = this.settings.geometryType;

        if (type === "Geometry") {
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
    var geometries = [];
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

    var drawToolsControl = new DrawToolsControl(drawControlOptions);

    this.getMap().on('set:geometries', function () {
        drawToolsControl.deactivateControls();
    });

    this.addControl(drawToolsControl);

    return drawToolsControl;
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


/**
 * tileLayers to [ol.layer.Layer]
 *
 * @private
 */
Viewer.prototype.createLayersFromTileLayersConfig = function (tileLayersConfig) {


    var extractTileLayerFromTileLayerConfig = function (tileLayerConfig) {
        var url = tileLayerConfig.url;
        var title = tileLayerConfig.title;
        var options = {
            minResolution: tileLayerConfig.minResolution,
            maxResolution: tileLayerConfig.maxResolution,
            opacity: tileLayerConfig.opacity,
            attributions: [tileLayerConfig.attribution],
            minZoom: tileLayerConfig.minZoom,
            maxZoom: tileLayerConfig.maxZoom,
            projection: tileLayerConfig.projection,
            opaque: tileLayerConfig.opaque,
            cacheSize: tileLayerConfig.cacheSize,
            transition: tileLayerConfig.transition,
            wrapX: tileLayerConfig.wrapX
        };
        return new TileLayer(url, title, options);
    };

    var layers = [];

    for (var i in tileLayersConfig) {
        var tileLayer = extractTileLayerFromTileLayerConfig(tileLayersConfig[i]);
        layers[tileLayer.getTitle()] = (tileLayer.getLayer());
    }

    return layers;
};


/**
 * @param {array} layers Liste sous la forme {'couche 1': layer1 },{...}
 * @param {object} params parametres
 * @param {object} params.tileCoordinates coordonnées pour l'image tuile
 * @param {object} params.switchableLayers Mapping des couches pour chaque tuile en fonction du title
 */
Viewer.prototype.addTileLayerSwitcher = function (layers, params) {

    var tileLayerSwitcherControl = new TileLayerSwitcher({
        tileCoord: params.tileCoordinates
    });


    var switchableLayers = params.switchableLayers

    // switchableLayers not renseigned
    if (switchableLayers === null || switchableLayers.length === 0) {

        for (var title in layers) {
            if (layers[title] === null) {
                tileLayerSwitcherControl.addTile([], title);
            } else {
                tileLayerSwitcherControl.addTile([layers[title]], title);
            }
        };

    // switchableLayers renseigned
    } else {
        for (var i in switchableLayers) {

            // switchableLayers [["titre1","titre2"]]
            if (Array.isArray(switchableLayers[i])) {
                var groupedTitle = switchableLayers[i].join(' & ');
                var groupedLayers = [];
                for (var u in switchableLayers[i]) {

                    if(layers[switchableLayers[i][u]] !== null){
                        groupedLayers.push(layers[switchableLayers[i][u]]);
                    }
                }
                tileLayerSwitcherControl.addTile(groupedLayers, groupedTitle);

            // switchableLayers ["titre3"]
            } else {
                if(layers[switchableLayers[i]] === null){
                    tileLayerSwitcherControl.addTile([], switchableLayers[i]);
                }else{
                    tileLayerSwitcherControl.addTile([layers[switchableLayers[i]]], switchableLayers[i]);
                }
            }
        }
    }

    tileLayerSwitcherControl.on('change:tile', function (e) {
        this.getMap().dispatchEvent({ type: 'change:tile', tile: e.tile });
    }.bind(this));

    this.addControl(tileLayerSwitcherControl);


    return tileLayerSwitcherControl;
};


module.exports = Viewer;
