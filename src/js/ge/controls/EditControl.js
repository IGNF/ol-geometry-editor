var ol = require('openlayers');
var ModifyBoxInteraction = require('../interactions/ModifyBoxInteraction');
var ModifySquareInteraction = require('../interactions/ModifySquareInteraction');


/**
 * Contrôle de modification de feature
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 * 
 */
var EditControl = function (options) {

    this.style = options.style;
    this.featuresCollection = options.featuresCollection;

    var element = $("<div>").addClass('ol-edit ol-unselectable ol-control');

    $("<button>").attr('title', 'Edit a feature')
            .on("touchstart click", function (e)
            {
                if (e && e.preventDefault)
                    e.preventDefault();

                this.setActive(!this.active);

            }.bind(this))
            .appendTo(element);


    ol.control.Control.call(this, {
        element: element.get(0),
        target: options.target
    });
};

ol.inherits(EditControl, ol.control.Control);


EditControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

EditControl.prototype.initControl = function () {
    this.addInteractions();
    this.active = false;
    this.setActive(this.active);
};

EditControl.prototype.getActive = function () {
    return this.active;
};

EditControl.prototype.setActive = function (active) {

    this.getInteractions().forEach(function (interaction) {
        interaction.setActive(active);
    });


    if (active && !this.getActive()) {
        this.dispatchEvent('edit:active');
        $(this.element).addClass('active');
        this.active = true;
    }

    if (!active && this.getActive()) {
        this.dispatchEvent('edit:inactive');
        $(this.element).removeClass('active');
        this.active = false;
    }
};


EditControl.prototype.addInteractions = function () {

    this.reorganiseFeaturesCollectionByType();

    var modifyInteractionBasic = new ol.interaction.Modify({
        features: this.getFeaturesCollectionBasic(),
        style: this.style
    });

    var modifyInteractionBox = new ModifyBoxInteraction({
        features: this.getFeaturesCollectionBox()
    });

    var modifyInteractionSquare = new ModifySquareInteraction({
        features: this.getFeaturesCollectionSquare()
    });

    this.getInteractions = function () {
        return [
            modifyInteractionBasic,
            modifyInteractionBox,
            modifyInteractionSquare
        ];
    };


    var modifyEnd = function (e) {
        this.getMap().dispatchEvent($.extend(e, {type: "draw:edited"}));
    }.bind(this);


    this.getInteractions().forEach(function (interaction) {
        interaction.on('modifyend', modifyEnd);
        this.getMap().addInteraction(interaction);
    }.bind(this));

};



/**
 * Prepare des ol.Collections de features afin d'appliquer chaque groupe 
 * de features à une interaction de modification
 * 
 * @returns {undefined}
 */
EditControl.prototype.reorganiseFeaturesCollectionByType = function () {

    var featuresCollectionBasic = new ol.Collection();
    this.getFeaturesCollectionBasic = function () {
        return featuresCollectionBasic;
    };

    var featuresCollectionBox = new ol.Collection();
    this.getFeaturesCollectionBox = function () {
        return featuresCollectionBox;
    };

    var featuresCollectionSquare = new ol.Collection();
    this.getFeaturesCollectionSquare = function () {
        return featuresCollectionSquare;
    };

    var addFeatureOnMatchedCollection = function (feature) {
        switch (feature.get('type')) {
            case "Rectangle":
                featuresCollectionBox.push(feature);
                break;
            case "Square":
                featuresCollectionSquare.push(feature);
                break;
            default:
                featuresCollectionBasic.push(feature);
                break;
        }
    };

    var removeFeatureOnMatchedCollection = function (feature) {
        switch (feature.get('type')) {
            case "Rectangle":
                featuresCollectionBox.remove(feature);
                break;
            case "Square":
                featuresCollectionSquare.remove(feature);
                break;

            default:
                featuresCollectionBasic.remove(feature);
                break;
        }
    };

    this.featuresCollection.forEach(addFeatureOnMatchedCollection);

    this.featuresCollection.on('add', function (e) {
        addFeatureOnMatchedCollection(e.element);
    });

    this.featuresCollection.on('remove', function (e) {
        removeFeatureOnMatchedCollection(e.element);
    });

};


module.exports = EditControl;
