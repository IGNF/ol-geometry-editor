var markerShadowUrl = require('../../../images/marker-shadow.png');
var markerIconUrl = require('../../../images/marker-icon.png');

var getDefaultStyle = function () {


    var fill = new ol.style.Fill({
        color: 'rgba(255,255,255,0.4)'
    });

    var stroke = new ol.style.Stroke({
        color: '#3399CC',
        width: 1.25
    });

    var image = new ol.style.Circle({
        fill: fill,
        stroke: stroke,
        radius: 5
    });

    return [
        new ol.style.Style({
            image: image,
            fill: fill,
            stroke: stroke
        })
    ];
};


var defaultStyleDrawFunction = function (type) {

    switch (type) {
        case "Point":
        case "MultiPoint":
            var markerStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 41],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                      src: markerIconUrl
                })
            });
            var shadowMarker = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [14, 41],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                      src: markerShadowUrl
                })
            });
            return [shadowMarker, markerStyle];
    }

    return getDefaultStyle();

};

module.exports = defaultStyleDrawFunction;
