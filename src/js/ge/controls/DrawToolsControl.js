var defaultTranslations = require('../translations/translation.fr.json');


var DrawControl = require('./DrawControl');
var EditControl = require('./EditControl');
var TranslateControl = require('./TranslateControl');
var RemoveControl = require('./RemoveControl');
var defaultStyleDrawFunction = require('../util/defaultStyleDrawFunction');



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
    this.translations = $.extend(defaultTranslations, options.translations || {});

    this.layer = options.layer;
    this.featuresCollection = this.layer.getSource().getFeaturesCollection();
    this.type = options.type || "Geometry";
    this.multiple = options.multiple || false;
    this.style = options.style;

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

    this.addDrawControls();
    this.addEditControl();
    // this.addTranslateControl();
    this.addRemoveControl();

};


DrawToolsControl.prototype.addDrawControls = function () {
    if (this.type === "Geometry") {
        this.addDrawControl({type: "MultiPoint", multiple: true, title: this.translations.draw.multipoint});
        this.addDrawControl({type: "MultiLineString", multiple: true, title: this.translations.draw.multilinestring});
        this.addDrawControl({type: "MultiPolygon", multiple: true, title: this.translations.draw.multipolygon});
    } else {
        this.addDrawControl({type: this.type, multiple: this.multiple, title: this.translations.draw[this.type.toLowerCase()]});
    }

};

DrawToolsControl.prototype.addDrawControl = function (options) {
    options = options || {};

    var drawControl = new DrawControl({
        featuresCollection: this.featuresCollection,
        type: options.type,
        target: this.element,
        style: function(feature, resolution){
            return defaultStyleDrawFunction(feature,resolution, options.type);
        },
        multiple: options.multiple,
        title: options.title
    });

    drawControl.on('draw:active', function () {
        this.deactivateControls(drawControl);
        this.dispatchEvent('tool:active');
    }.bind(this));

    this.getMap().addControl(drawControl);
    this.controls.push(drawControl);
};

DrawToolsControl.prototype.addEditControl = function () {
    var editControl = new EditControl({
        // featuresCollection: this.featuresCollection,
        layer: this.layer,
        target: this.element,
        title: this.translations.edit[this.type.toLowerCase()]
    });

    editControl.on('edit:active', function () {
        this.deactivateControls(editControl);
        this.dispatchEvent('tool:active');
    }.bind(this));

    this.getMap().addControl(editControl);
    this.controls.push(editControl);
};

DrawToolsControl.prototype.addTranslateControl = function () {
    var translateControl = new TranslateControl({
        featuresCollection: this.featuresCollection,
        target: this.element,
        title: this.translations.translate[this.type.toLowerCase()]
    });

    translateControl.on('translate:active', function () {
        this.deactivateControls(translateControl);
        this.dispatchEvent('tool:active');
    }.bind(this));

    this.getMap().addControl(translateControl);
    this.controls.push(translateControl);
};

DrawToolsControl.prototype.addRemoveControl = function () {
    var removeControl = new RemoveControl({
        featuresCollection: this.featuresCollection,
        target: this.element,
        title: this.translations.remove[this.type.toLowerCase()]
    });

    removeControl.on('remove:active', function () {
        this.deactivateControls(removeControl);
        this.dispatchEvent('tool:active');
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

DrawToolsControl.prototype.getControls = function () {
    return this.controls;
};


module.exports = DrawToolsControl;
