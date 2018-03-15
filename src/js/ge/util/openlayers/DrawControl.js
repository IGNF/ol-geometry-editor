var ol = require('openlayers');
var DeleteInteraction = require('./customInteractions/DeleteInteraction');
var ModifyBoxInteraction = require('./customInteractions/ModifyBoxInteraction');


/**
 * Contrôle de création d'une feature de type
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 * @param {String} options.type le type d'élément dessiné ('Text', 'Point', 'LineString' ou 'Polygon')
 * 
 * @alias gpu.control.DrawControl
 */
var DrawControl = function (options) {

    var settings = {
        layer: null,
        features: null,
        type: "",
        title: "",
    };

    this.settings = $.extend(settings, options);

    this.active = false;

    this.drawBar = $("<div>").addClass('ol-draw ol-unselectable ol-control');


    ol.control.Control.call(this, {
        element: this.drawBar.get(0),
        target: options.target
    });
};

ol.inherits(DrawControl, ol.control.Control);


DrawControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

DrawControl.prototype.initControl = function () {
    this.createDrawLayer();
    this.addDrawInteraction();
    this.addModifyInteraction();
    this.addDeleteInteraction();
    this.configureInteractionSwitching();
};



DrawControl.prototype.createDrawLayer = function () {

    this.settings.features.forEach(function (feature) {
        feature.setStyle(this.getFeatureStyleByGeometryType(feature.getGeometry().getType()));
    }, this);


    this.layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: this.settings.features
        })
    });

    this.getMap().addLayer(this.layer);

};

DrawControl.prototype.getDrawLayer = function () {
    return this.layer;
};


DrawControl.prototype.addDrawInteraction = function () {
    var featuresCollection = new ol.Collection();

    var drawParams = {
        type: this.settings.type,
        style: this.getFeatureStyleByGeometryType(this.settings.type),
        features: featuresCollection
    };


    if (this.settings.type === 'Square') {
        drawParams.type = "Circle";
        drawParams.geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
    }
    if (this.settings.type === 'Rectangle') {
        drawParams.type = "Circle";
        drawParams.geometryFunction = ol.interaction.Draw.createBox();
    }

    this.drawInteraction = new ol.interaction.Draw(drawParams);

    this.drawInteraction.on('drawend', function (e) {

        e.feature.set('type', this.settings.type);
        e.feature.setStyle(this.getFeatureStyleByGeometryType(this.settings.type));

        this.settings.features.push(e.feature);

        this.getMap().dispatchEvent($.extend(e, {
            type: "draw:created",
            layer: this.getDrawLayer()
        }));

    }.bind(this));


    this.getMap().addInteraction(this.drawInteraction);


    this.setDrawInteractionActive = function (active) {
        this.drawInteraction.setActive(active);

        if (active) {
            drawButton.addClass("active");
            this.dispatchEvent('draw:active');
        } else {
            drawButton.removeClass("active");
            this.dispatchEvent('draw:inactive');
        }

    }.bind(this);


    // creation du bouton activant l'interaction
    var drawButton = $("<button>").attr('title', 'Draw a ' + this.settings.type.toLowerCase())
            .addClass('ol-draw-' + this.settings.type.toLowerCase())
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setDrawInteractionActive(!this.drawInteraction.getActive());

            }.bind(this))
            .appendTo(this.drawBar);

    this.setDrawInteractionActive(false);

};

DrawControl.prototype.getDrawInteraction = function () {
    return this.drawInteraction;
};


/**
 * Prepare des ol.Collections de features afin d'appliquer chaque groupe 
 * de features à une interaction de modification
 * 
 * @returns {undefined}
 */
DrawControl.prototype.prepareFeatureGroup = function () {

    this.featuresBasic = new ol.Collection();
    this.featuresBox = new ol.Collection();
    this.featuresSquare = new ol.Collection();

    var addFeatureOnRightCollection = function (feature) {
        switch (feature.get('type')) {
            case "Rectangle":
                this.featuresBox.push(feature);
                break;
            case "Square":
                this.featuresSquare.push(feature);
                break;

            default:
                this.featuresBasic.push(feature);
                break;
        }
    }.bind(this);

    var removeFeatureOnRightCollection = function (feature) {
        switch (feature.get('type')) {
            case "Rectangle":
                this.featuresBox.remove(feature);
                break;
            case "Square":
                this.featuresSquare.remove(feature);
                break;

            default:
                this.featuresBasic.remove(feature);
                break;
        }
    }.bind(this);

    this.settings.features.forEach(addFeatureOnRightCollection.bind(this));

    this.settings.features.on('add', function (e) {
        addFeatureOnRightCollection(e.element);
    });
    this.settings.features.on('remove', function (e) {
        removeFeatureOnRightCollection(e.element);
    });

};

DrawControl.prototype.addModifyInteraction = function () {


    this.prepareFeatureGroup();

    this.modifyInteractionBox = new ModifyBoxInteraction({
        features: this.featuresBox,
        type: this.settings.type
    });

    this.modifyInteractionSquare = new ol.interaction.Modify({
        features: this.featuresSquare,
        insertVertexCondition: function () {
            return false;
        }
    });

    this.modifyInteractionBasic = new ol.interaction.Modify({
        features: this.featuresBasic
    });


    this.translateInteractionSquare = new ol.interaction.Translate({
        features: this.featuresSquare,
        hitTolerance:10
    });
    this.translateInteractionBasic = new ol.interaction.Translate({
        features: this.featuresBasic,
        hitTolerance:10
    });

    this.modifyInteractions = [
        this.modifyInteractionBasic,
        this.modifyInteractionBox,
        this.modifyInteractionSquare
    ];





    var modifyend = function (e) {
        this.getMap().dispatchEvent($.extend(e, {type: "draw:edited"}));
    }.bind(this);

    for (var i in this.modifyInteractions) {
        this.modifyInteractions[i].on('modifyend', modifyend);
        this.getMap().addInteraction(this.modifyInteractions[i]);
    }

    this.getMap().addInteraction(this.translateInteractionSquare);
    this.getMap().addInteraction(this.translateInteractionBasic);

    this.setModifyInteractionsActive = function (active) {

        for (var j in this.modifyInteractions) {
            this.modifyInteractions[j].setActive(active);
        }
        this.translateInteractionBasic.setActive(active);
        this.translateInteractionSquare.setActive(active);


        if (active) {
            modifyButton.addClass("active");
            this.dispatchEvent('edit:active');
        } else {
            modifyButton.removeClass("active");
            this.dispatchEvent('edit:inactive');
        }
        this.modifyInteractionsActive = active;
    }.bind(this);


    var modifyButton = $("<button>").attr('title', 'Modify a ' + this.settings.type.toLowerCase())
            .addClass('ol-edit')
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setModifyInteractionsActive(!this.modifyInteractionsActive);

            }.bind(this))
            .appendTo(this.drawBar);

    this.setModifyInteractionsActive(false);

};


DrawControl.prototype.getModifyInteraction = function () {
    return this.modifyInteraction;
};




DrawControl.prototype.addDeleteInteraction = function () {

    this.deleteInteraction = new DeleteInteraction({
        features: this.settings.features
    });

    this.deleteInteraction.on('deleteend', function (e) {
        this.getMap().dispatchEvent($.extend(e, {type: "draw:deleted"}));
    }.bind(this));


    this.getMap().addInteraction(this.deleteInteraction);

    this.setDeleteInteractionActive = function (active) {
        this.deleteInteraction.setActive(active);

        if (active) {
            deleteButton.addClass("active");
            this.dispatchEvent('remove:active');
        } else {
            deleteButton.removeClass("active");
            this.dispatchEvent('remove:inactive');
        }
    }.bind(this);


    // creation du bouton activant l'interaction
    var deleteButton = $("<button>").attr('title', 'Delete a feature')
            .addClass('ol-delete')
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setDeleteInteractionActive(!this.deleteInteraction.getActive());

            }.bind(this))
            .appendTo(this.drawBar);

    this.setDeleteInteractionActive(false);

};

DrawControl.prototype.getDeleteInteraction = function () {
    return this.deleteInteraction;
};

DrawControl.prototype.configureInteractionSwitching = function () {
    this.on('draw:active', function () {
        this.setModifyInteractionsActive(false);
        this.setDeleteInteractionActive(false);
    }.bind(this));
    this.on('edit:active', function () {
        this.setDrawInteractionActive(false);
        this.setDeleteInteractionActive(false);
    }.bind(this));
    this.on('remove:active', function () {
        this.setDrawInteractionActive(false);
        this.setModifyInteractionsActive(false);
    }.bind(this));

};

DrawControl.prototype.getFeatureStyleByGeometryType = function (geometryType) {

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


module.exports = DrawControl;
