var ol = require('openlayers');

var DrawControl = require('./DrawControl');
var EditControl = require('./EditControl');
var TranslateControl = require('./TranslateControl');
var RemoveControl = require('./RemoveControl');


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

    var settings = {
        features: null,
        type: "",
        title: "",
        multiple: null
    };

    this.settings = $.extend(settings, options);
    this.controls = [];

    var drawBar = $("<div>").addClass('ol-draw-tools ol-unselectable ol-control');

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

    this.addLayer();

    this.addDrawControls();
    this.addEditControl();
    this.addTranslateControl();
    this.addRemoveControl();

};



DrawToolsControl.prototype.addLayer = function () {

    this.settings.features.forEach(function (feature) {
        feature.setStyle(this.getFeatureStyleByGeometryType(feature.getGeometry().getType()));
    }, this);

    var layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: this.settings.features
        })
    });

    this.getMap().addLayer(layer);

    this.getLayer = function () {
        return layer;
    };

};


DrawToolsControl.prototype.addDrawControls = function () {
    if (this.settings.type !== "Geometry") {
        this.addDrawControl();
    } else {
        this.addDrawControl({type: "MultiPoint"});
        this.addDrawControl({type: "MultiLineString"});
        this.addDrawControl({type: "MultiPolygon"});
        this.addDrawControl({type: "Rectangle", multiple: true});
//        this.addDrawControl({type: "Square", multiple: true}); // TODO modify interaction for square
    }

};

DrawToolsControl.prototype.addDrawControl = function (options) {
    options = options || {};

    var drawControl = new DrawControl({
        featuresCollection: this.getLayer().getSource().getFeaturesCollection(),
        type: options.type || this.settings.type,
        target: this.element,
        style: this.getFeatureStyleByGeometryType(this.settings.type),
        multiple: options.multiple || this.settings.multiple
    });


    drawControl.on('draw:active', function () {
        this.deactivateControls(drawControl);
    }.bind(this));

    this.getMap().addControl(drawControl);
    this.controls.push(drawControl);
};

DrawToolsControl.prototype.addEditControl = function () {
    var editControl = new EditControl({
        featuresCollection: this.getLayer().getSource().getFeaturesCollection(),
        target: this.element,
        style: this.getFeatureStyleByGeometryType(this.settings.type)
    });


    editControl.on('edit:active', function () {
        this.deactivateControls(editControl);
    }.bind(this));

    this.getMap().addControl(editControl);
    this.controls.push(editControl);
};

DrawToolsControl.prototype.addTranslateControl = function () {
    var translateControl = new TranslateControl({
        featuresCollection: this.getLayer().getSource().getFeaturesCollection(),
        target: this.element
    });

    translateControl.on('translate:active', function () {
        this.deactivateControls(translateControl);
    }.bind(this));

    this.getMap().addControl(translateControl);
    this.controls.push(translateControl);
};

DrawToolsControl.prototype.addRemoveControl = function () {
    var removeControl = new RemoveControl({
        featuresCollection: this.getLayer().getSource().getFeaturesCollection(),
        target: this.element
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


DrawToolsControl.prototype.getFeatureStyleByGeometryType = function (geometryType) {

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


module.exports = DrawToolsControl;
