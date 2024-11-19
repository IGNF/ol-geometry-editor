
/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
var RemoveInteraction = function (opt_options) {

    opt_options = $.extend({
        features: null
    }, opt_options);

    ol.interaction.Pointer.call(this, {
        handleDownEvent: RemoveInteraction.prototype.handleDownEvent,
        handleDragEvent: RemoveInteraction.prototype.handleDragEvent,
        handleMoveEvent: RemoveInteraction.prototype.handleMoveEvent,
        handleUpEvent: RemoveInteraction.prototype.handleUpEvent
    });

    this.features = opt_options.features;


    /**
     * @type {string|undefined}
     * @private
     */
    this.pointerCursor_ = 'pointer';

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

};
ol.inherits(RemoveInteraction, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
RemoveInteraction.prototype.handleDownEvent = function (evt) {
    let map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));

    this.feature_ = feature;
    return !!feature;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
RemoveInteraction.prototype.handleDragEvent = function (evt) {
    let map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));
    let element = evt.map.getTargetElement();

    if (feature) {
        if (element.style.cursor != this.pointerCursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.pointerCursor_;
        }
        // gerer curseur ici
    } else if (this.previousCursor_ !== undefined) {
        element.style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
    }
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
RemoveInteraction.prototype.handleMoveEvent = function (evt) {
    let map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));
    let element = evt.map.getTargetElement();

    if (feature) {
        if (element.style.cursor != this.pointerCursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.pointerCursor_;
        }
        // gerer curseur ici
    } else if (this.previousCursor_ !== undefined) {
        element.style.cursor = this.previousCursor_;
        this.previousCursor_ = undefined;
    }


};


/**
 * @return {boolean} `false` to stop the drag sequence.
 */
RemoveInteraction.prototype.handleUpEvent = function (evt) {

    let map = evt.map;

    // var deletedFeature = map.forEachFeatureAtPixel(evt.pixel,
    //         function (feature) {
    //             for (var i in this.features.getArray()) {
    //                 if (this.features.getArray()[i] === feature && this.feature_ === feature) {
    //                     this.features.remove(feature);
    //                 }
    //             }
    //         }.bind(this));

    var feature = map.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                for (var i in this.features.getArray()) {
                    if (this.features.getArray()[i] === feature) {
                        return feature;
                    }
                }
            }.bind(this));

    let element = evt.map.getTargetElement();

    if (feature) {
        element.style.cursor = this.pointerCursor_;

        // gerer curseur ici
    } else if (element.style.cursor !== undefined) {
        element.style.cursor = undefined;
    }

    this.dispatchEvent({type: "deleteend"});
    return false;
};



export default RemoveInteraction;