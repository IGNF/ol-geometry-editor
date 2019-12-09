var defaultTranslations = require('../translations/translation.fr.json');


var DrawControl = require('./DrawControl');
var EditControl = require('./EditControl');
// var TranslateControl = require('./TranslateControl');
var RemoveControl = require('./RemoveControl');
var defaultStyleSketchFunction = require('../util/defaultStyleSketchFunction');

/**
 * Sketch controls
 *
 * @constructor
 * @extends {ol.control.Control}
 *
 * @param {Object} options - Options
 * @param {Element|string|undefined} options.target - Spécifiez une cible si vous souhaitez que le contrôle soit rendu en dehors de la fenêtre de la carte
 *
 */
var SketchToolsControl = function (options) {
    if (!options) {
        options = {};
    }

    this.translations = $.extend(defaultTranslations, options.translations || {});

    var settings = {};

    this.settings = $.extend(settings, options);

    var element = $("<div>").addClass('ol-sketch-tools ol-unselectable ol-control');

    this.controls = [];

    ol.control.Control.call(this, {
        element: element.get(0),
        target: options.target
    });

};


ol.inherits(SketchToolsControl, ol.control.Control);

SketchToolsControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

SketchToolsControl.prototype.initControl = function () {
    this.sketchLayer = this.addSketchLayer();

    // this.addCustomMarkerControl(); // todo
    // this.addLabelControl(); // todo
    this.addDrawControls();
    this.addEditControl();
    this.addRemoveControl();

    // this.addPopupInteractions(); //todo
};


SketchToolsControl.prototype.addDrawControls = function () {
    var drawSketchTypes = [
        'MultiPoint',
        'MultiLineString',
        'MultiPolygon'
    ];

    drawSketchTypes.forEach(function (type) {
        var drawControl = new DrawControl({
            featuresCollection: this.sketchLayer.getSource().getFeaturesCollection(),
            type: type,
            target: this.element,
            style: function (feature, resolution) {
                return defaultStyleSketchFunction(feature, resolution, type);
            },
            multiple: true,
            title: this.translations.draw[type.toLowerCase()],
            eventBaseName: 'sketch'
        });

        this.controls.push(drawControl);

        drawControl.on('sketch:active', function () {
            this.deactivateControls(drawControl);
            this.dispatchEvent('tool:active');
        }.bind(this));

        this.getMap().addControl(drawControl);
    }.bind(this));
};

SketchToolsControl.prototype.addEditControl = function () {
    var editControl = new EditControl({
        layer: this.sketchLayer,
        target: this.element,
        title: this.translations.edit.geometry
    });

    editControl.on('edit:active', function () {
        this.deactivateControls(editControl);
        this.dispatchEvent('tool:active');
    }.bind(this));

    this.getMap().addControl(editControl);
    this.controls.push(editControl);

};

SketchToolsControl.prototype.addRemoveControl = function () {
    var removeControl = new RemoveControl({
        featuresCollection: this.sketchLayer.getSource().getFeaturesCollection(),
        target: this.element,
        title: this.translations.remove.geometry
    });

    removeControl.on('remove:active', function () {
        this.deactivateControls(removeControl);
        this.dispatchEvent('tool:active');
    }.bind(this));
    this.controls.push(removeControl);
    this.getMap().addControl(removeControl);

};

SketchToolsControl.prototype.deactivateControls = function (keepThisOne) {
    this.controls.forEach(function (control) {
        if (control !== keepThisOne) {
            control.setActive(false);
        }
    });
};


/**
 *
 * @param {ol.Collection} featuresCollection
 * @returns {ol.layer.Vector}
 */
SketchToolsControl.prototype.addSketchLayer = function () {

    var layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: new ol.Collection()
        }),
        style: defaultStyleSketchFunction
    });

    this.getMap().addLayer(layer);

    return layer;
};


SketchToolsControl.prototype.getControls = function () {
    return this.controls;
};

module.exports = SketchToolsControl;