var ol = require('openlayers');

/**
 *
 * @constructor
 * @extends {ol.control.Control}
 * 
 * @param {object} options
 * @param {String} options.type le type d'élément dessiné ('Point', 'LineString', 'Polygon' ou 'Rectangle')
 * 
 */
var DrawControl = function (options) {

    this.featuresCollection = options.featuresCollection;
    this.type = options.type || "Point";
    this.style = options.style;
    this.multiple = options.multiple;

    var element = $("<div>").addClass('ol-draw-' + this.type.toLowerCase() + ' ol-unselectable ol-control');

    $("<button>").attr('title', 'Draw a ' + this.type.toLowerCase())
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

ol.inherits(DrawControl, ol.control.Control);


DrawControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

DrawControl.prototype.initControl = function () {
    this.addInteraction();
    this.active = false;
    this.setActive(this.active);
};

DrawControl.prototype.getActive = function () {
    return this.active;
};

DrawControl.prototype.setActive = function (active) {

    this.getInteraction().setActive(active);

    if (active && !this.getActive()) {
        this.dispatchEvent('draw:active');
        $(this.element).addClass('active');
        this.active = true;
    }

    if (!active && this.getActive()) {
        this.dispatchEvent('draw:inactive');
        $(this.element).removeClass('active');
        this.active = false;
    }
};

DrawControl.prototype.addInteraction = function () {

    var drawParams = {
        type: this.type,
        style: this.style,
        features: this.featuresCollection
    };

    if (this.type === 'Square') {
        drawParams.type = "Circle";
        drawParams.geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
    }

    if (this.type === 'Rectangle') {
        drawParams.type = "Circle";
        drawParams.geometryFunction = ol.interaction.Draw.createBox();
    }


    var drawInteraction = new ol.interaction.Draw(drawParams);


    drawInteraction.on('drawend', function (e) {
        
        if(!this.multiple){
            this.featuresCollection.clear();
        }
        
        e.feature.set('type', this.type);
        e.feature.setStyle(this.style);
    }.bind(this));

    this.featuresCollection.on('add', function (e) {
        
        this.getMap().dispatchEvent($.extend(e, {
            type: "draw:created"
        }));
        
    }.bind(this));

    this.getInteraction = function () {
        return drawInteraction;
    };

    this.getMap().addInteraction(drawInteraction);
};


module.exports = DrawControl;
