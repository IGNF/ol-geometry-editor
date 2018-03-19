var ol = require('openlayers');

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
var ModifySquareInteraction = function (opt_options) {

    opt_options = $.extend({
        features: null
    }, opt_options);

    ol.interaction.Pointer.call(this, {
        handleDownEvent: ModifySquareInteraction.prototype.handleDownEvent,
        handleDragEvent: ModifySquareInteraction.prototype.handleDragEvent,
        handleMoveEvent: ModifySquareInteraction.prototype.handleMoveEvent,
        handleUpEvent: ModifySquareInteraction.prototype.handleUpEvent
    });

    this.features = opt_options.features;

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.grabCursor_ = 'grab';
    /**
     * @type {string|undefined}
     * @private
     */
    this.grabbingCursor_ = 'grabbing';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;



    /**
     * Draw overlay where sketch features are drawn.
     * @type {ol.layer.Vector}
     * @private
     */
    this.overlay_ = new ol.layer.Vector({
        source: new ol.source.Vector({
            useSpatialIndex: false,
            wrapX: !!opt_options.wrapX
        }),
        style: opt_options.style,
        updateWhileAnimating: true,
        updateWhileInteracting: true
    });

    this.overlayPoints_ = [];

};

ol.inherits(ModifySquareInteraction, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ModifySquareInteraction.prototype.handleDownEvent = function (evt) {
    this.deltaX = 0;
    this.deltaY = 0;

    var feature = this.getFeatureUnderMouse_(evt);

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;

        var element = evt.map.getTargetElement();

        if (element.style.cursor !== this.grabbingCursor_) {
            element.style.cursor = this.grabbingCursor_;
        }

    }

    return !!feature;
};



/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
ModifySquareInteraction.prototype.handleDragEvent = function (evt) {
    var feature = this.getFeature_(evt);

    this.deltaX = evt.coordinate[0] - this.coordinate_[0];
    this.deltaY = evt.coordinate[1] - this.coordinate_[1];

    feature.getGeometry().translate(this.deltaX, this.deltaY);

    var element = evt.map.getTargetElement();
    element.style.cursor = this.grabbingCursor_;

    this.handleModify_(evt);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
ModifySquareInteraction.prototype.handleMoveEvent = function (evt) {
    var feature = this.getFeatureUnderMouse_(evt);

    var element = evt.map.getTargetElement();

    if (feature) {
        if (element.style.cursor !== this.grabCursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.grabCursor_;
        }
    } else if (this.previousCursor_ !== undefined) {
        element.style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
    }
};


/**
 * @return {boolean} `false` to stop the drag sequence.
 */
ModifySquareInteraction.prototype.handleUpEvent = function (evt) {

    this.deltaX = 0;
    this.deltaY = 0;

    var element = evt.map.getTargetElement();

    if (this.feature_) {
        element.style.cursor = this.grabCursor_;
    } else {
        element.style.cursor = undefined;
    }

    this.dispatchEvent({type: "modifyend", feature: this.feature_});


    this.coordinate_ = null;
    this.feature_ = null;
    return false;
};



/**
 * @inheritDoc
 */
ModifySquareInteraction.prototype.handleModify_ = function (e) {
    var featureModifiedByModifyPoint = this.getFeatureOfModifyPoint_(this.feature_);

    // cas d'une feature hors point modifié par un de ses points de modification
    if (featureModifiedByModifyPoint) {

        this.setFeatureByModifyPoints_(featureModifiedByModifyPoint);

        // cas d'une feature autre qu'un point pour bouger ses points de modification
    } else {
        this.moveModifyPointsWithFeature_();

    }

};

/**
 * @inheritDoc
 */
ModifySquareInteraction.prototype.setActive = function (active) {
    ol.interaction.Pointer.prototype.setActive.call(this, active);

    if (active) {
        this.enableModificationPoints(this.features);
    } else {
        this.disableModificationPoints(this.features);
    }
};

//activer les points de modification
ModifySquareInteraction.prototype.enableModificationPoints = function (featuresCollection) {
    this.getMap().addLayer(this.overlay_);
    this.overlayPoints_ = [];

    featuresCollection.forEach(function (feature) {
        this.addModificationPoints_(feature);

    }.bind(this));
};

//desactiver les points de modification
ModifySquareInteraction.prototype.disableModificationPoints = function (featuresCollection) {
    this.removeModificationPoints_(featuresCollection);
};


ModifySquareInteraction.prototype.removeModificationPoints_ = function (featuresCollection) {
    // retirer les interractions sur les points de modification
    for (var i in this.overlayPoints_) {
        for (var u in this.overlayPoints_[i].modificationPoints) {
            featuresCollection.remove(this.overlayPoints_[i].modificationPoints[u]);
        }
    }

    this.overlay_.getSource().clear();
    this.getMap().removeLayer(this.overlay_);
    this.overlayPoints_ = [];


};

ModifySquareInteraction.prototype.addModificationPoints_ = function (feature) {

    var coordsOfBoxCorners = feature.getGeometry().getCoordinates()[0];

    var modificationPoints = [];

    for (var i in coordsOfBoxCorners) {
        if (i === "4") {
            modificationPoints[i] = modificationPoints[0];
            continue;
        }

        var modificationPoint = new ol.Feature({geometry: new ol.geom.Point(coordsOfBoxCorners[i])});
        this.overlay_.getSource().addFeature(modificationPoint);

        modificationPoints[i] = modificationPoint;
        this.features.push(modificationPoint);
    }

    this.overlayPoints_.push({feature: feature, modificationPoints: modificationPoints});
};


//desactiver les points de modification
ModifySquareInteraction.prototype.getFeatureUnderMouse_ = function (evt) {
    return evt.map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));
};

ModifySquareInteraction.prototype.getFeature_ = function (evt) {
    return this.feature_;
};

/*
 * Lorsqu'on fait glisser un des points de modification :
 * - met à jour la position de tous les points de modification
 * - met à jour la feature modifiée en se basant sur la position des points de modification
 */
ModifySquareInteraction.prototype.setFeatureByModifyPoints_ = function (feature) {

    var modifyPoints = this.getModifyPointsOfFeature_(feature);


    // modifie la position des points de modification restant pour former un rectangle
    this.updateLinkedModifyPointForBBox(this.feature_, modifyPoints);

    // met à jour les coordonnées de la feature à partir des coordonées de ses points de modification
    this.redrawFeatureByModificationPointsPosition(feature, modifyPoints);

};

ModifySquareInteraction.prototype.updateLinkedModifyPointForBBox = function (modifyPointChanged, modifyPointsToUpdate) {
    
    var indice;
    for (var i in modifyPointsToUpdate) {
        if (modifyPointChanged === modifyPointsToUpdate[i]) {
            indice = parseInt(i);
            break;
        }
    }

    var indicePointBefore = indice - 1;
    var indicePointAfter = indice + 1;

    if (indice === 0) {
        indicePointBefore = 3;
    }

    if (indice === 3) {
        indicePointAfter = 0;
    }

    if (indice % 2 !== 0) {
        modifyPointsToUpdate[indicePointBefore].getGeometry().translate(0, this.deltaY);
        modifyPointsToUpdate[indicePointAfter].getGeometry().translate(this.deltaX, 0);
    } else {
        modifyPointsToUpdate[indicePointBefore].getGeometry().translate(this.deltaX, 0);
        modifyPointsToUpdate[indicePointAfter].getGeometry().translate(0, this.deltaY);
    }


    modifyPointsToUpdate[4].getGeometry().setCoordinates(modifyPointsToUpdate[0].getGeometry().getCoordinates());

};

ModifySquareInteraction.prototype.redrawFeatureByModificationPointsPosition = function (feature, modifyPoints) {

    var newCoords = [];
    for (var j in modifyPoints) {
        newCoords.push(modifyPoints[j].getGeometry().getCoordinates());

    }
    feature.getGeometry().setCoordinates([newCoords]);
};

ModifySquareInteraction.prototype.moveModifyPointsWithFeature_ = function () {

    var modifyPoints = this.getModifyPointsOfFeature_(this.feature_);
    var coords;
    switch (this.feature_.getGeometry().getType()) {
        case "Polygon":
            coords = this.feature_.getGeometry().getCoordinates()[0];
            coords.pop();
            break;

        default:

            break;
    }

    for (var j in coords) {
        modifyPoints[j].getGeometry().setCoordinates(coords[j]);
    }
};




ModifySquareInteraction.prototype.getFeatureOfModifyPoint_ = function (modifyPoint) {
    for (var i in this.overlayPoints_) {
        for (var u in this.overlayPoints_[i].modificationPoints) {

            if (this.overlayPoints_[i].modificationPoints[u] === modifyPoint) {
                return this.overlayPoints_[i].feature;
            }
        }
    }
};

ModifySquareInteraction.prototype.getModifyPointsOfFeature_ = function (feature) {
    for (var i in this.overlayPoints_) {
        if (this.overlayPoints_[i].feature === feature) {
            return this.overlayPoints_[i].modificationPoints;
        }
    }
};



module.exports = ModifySquareInteraction;