var createTileLayer = require('./util/createTileLayer');
/**
 * Default GeometryEditor parameters
 */
var defaultParams = {
    tileLayers: [
        createTileLayer("https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
            attributions: ['©<a href="http://openstreetmap.org">OpenStreetMap contributors</a>']
        })
    ],
    switchableLayers: {},
    coordSwitchableLayers: [9,269,-189],
    defaultSwitchableTile: 1,
    hide: true,
    editable: true,
    width: '100%',
    height: '500',
    lon: 2.0,
    lat: 45.0,
    zoom: 4,
    maxZoom: 19,
    geometryType: 'Geometry',
    centerOnResults: true,
    precision: 7,
    onResult: function(){}
} ;

module.exports = defaultParams ;
