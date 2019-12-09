
/**
 * Contrôle de création d'une feature de type
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 *
 */
var TranslateControl = function (options) {

    this.title = options.title || 'Move a geometry';
    this.featuresCollection = options.featuresCollection;

    var element = $("<div>").addClass('ol-translate ol-unselectable ol-control');

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

ol.inherits(TranslateControl, ol.control.Control);


TranslateControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

TranslateControl.prototype.initControl = function () {
    this.addTranslateInteraction();
    this.active = false;
    this.setActive(this.active);
};


TranslateControl.prototype.getActive = function () {
    return this.active;
};


TranslateControl.prototype.setActive = function (active) {

    this.getInteraction().setActive(active);

    if (active && !this.getActive()) {
        this.dispatchEvent('translate:active');
        $(this.element).addClass('active');
        this.active = true;
    }

    if (!active && this.getActive()) {
        this.dispatchEvent('translate:inactive');
        $(this.element).removeClass('active');
        this.active = false;
    }
};


TranslateControl.prototype.addTranslateInteraction = function () {
    var translateInteraction = new ol.interaction.Translate({
        features: this.featuresCollection,
        hitTolerance: 10
    });

    translateInteraction.on('translateend', function (e) {
        this.getMap().dispatchEvent($.extend(e, {type: "draw:edited"}));
    }.bind(this));

    this.getMap().addInteraction(translateInteraction);

    this.getInteraction = function () {
        return translateInteraction;
    };
};


module.exports = TranslateControl;
