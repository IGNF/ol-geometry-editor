var ol = require('openlayers');

var DrawControl = require('./DrawControl');
var EditControl = require('./EditControl');
var TranslateControl = require('./TranslateControl');
var RemoveControl = require('./RemoveControl');
var defaultStyleDrawFunction = require('../util/defaultStyleDrawFunction');
//var defaultStyleEditFunction = require('./util/defaultStyleEditFunction');



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

    this.featuresCollection = options.featuresCollection || new ol.Collection();
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
    this.addTranslateControl();
    this.addRemoveControl();

};


DrawToolsControl.prototype.addDrawControls = function () {
    if (this.type === "Geometry") {

        this.addDrawControl({type: "MultiPoint", multiple: true});
        this.addDrawControl({type: "MultiLineString", multiple: true});
        this.addDrawControl({type: "MultiPolygon", multiple: true});
//        this.addDrawControl({type: "Rectangle", multiple: true}); // nope
//        this.addDrawControl({type: "Square", multiple: true}); // TODO modify interaction for square
    } else {
        this.addDrawControl({type: this.type, multiple: this.multiple});
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
        multiple: options.multiple
    });

    drawControl.on('draw:active', function () {
        this.deactivateControls(drawControl);
    }.bind(this));

    this.getMap().addControl(drawControl);
    this.controls.push(drawControl);
};

DrawToolsControl.prototype.addEditControl = function () {
    var editControl = new EditControl({
        featuresCollection: this.featuresCollection,
        target: this.element,
        style: function(feature, resolution){
            
            var pixel = this.getMap().getPixelFromCoordinate(feature.getGeometry().getCoordinates());
            var features = this.getMap().getFeaturesAtPixel(pixel);
            var type;
            
            for (var i in features){
                if(features[i] !== feature){
                   type = features[i].get("type");
                   continue;
                }
            }
            
            return defaultStyleDrawFunction(feature,resolution, type);
        }.bind(this)
    });

    editControl.on('edit:active', function () {
        this.deactivateControls(editControl);
    }.bind(this));

    this.getMap().addControl(editControl);
    this.controls.push(editControl);
};

DrawToolsControl.prototype.addTranslateControl = function () {
    var translateControl = new TranslateControl({
        featuresCollection: this.featuresCollection,
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
        featuresCollection: this.featuresCollection,
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


module.exports = DrawToolsControl;
