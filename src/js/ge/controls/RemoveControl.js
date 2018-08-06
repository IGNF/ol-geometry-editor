var RemoveInteraction = require('../interactions/RemoveInteraction');


/**
 * Contrôle de création d'une feature de type
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 * @param {String} options.type le type d'élément dessiné ('Text', 'Point', 'LineString' ou 'Polygon')
 *
 */
var RemoveControl = function (options) {

    this.featuresCollection = options.featuresCollection;
    this.title = options.title || 'Remove a geometry';

    var element = $("<div>").addClass('ol-delete ol-unselectable ol-control');

    $("<button>").attr('title', this.title)
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

ol.inherits(RemoveControl, ol.control.Control);


RemoveControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

RemoveControl.prototype.initControl = function () {
    this.addInteraction();
    this.active = false;
    this.setActive(this.active);
};


RemoveControl.prototype.getActive = function () {
    return this.active;
};


RemoveControl.prototype.setActive = function (active) {

    this.getInteraction().setActive(active);

    if (active && !this.getActive()) {
        this.dispatchEvent('remove:active');
        $(this.element).addClass('active');
        this.active = true;
    }

    if (!active && this.getActive()) {
        this.dispatchEvent('remove:inactive');
        $(this.element).removeClass('active');
        this.active = false;
    }
};


RemoveControl.prototype.addInteraction = function () {

    var removeInteraction = new RemoveInteraction({
        features: this.featuresCollection
    });

    this.getInteraction = function () {
        return removeInteraction;
    };

    removeInteraction.on('deleteend', function (e) {
        this.getMap().dispatchEvent($.extend(e, {type: "draw:deleted"}));
    }.bind(this));

    this.getMap().addInteraction(removeInteraction);

};

module.exports = RemoveControl;
