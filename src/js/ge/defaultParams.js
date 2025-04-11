/**
 * Default GeometryEditor parameters
 */
var defaultParams = {
    tileLayers: [
        {
            'url': 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'attribution': '©<a href="http://openstreetmap.org">OpenStreetMap contributors</a>'
        }
    ],
    tileLayerSwitcher: false,
    switchableLayers: [],
    tileCoordinates: [9, 253, -177],
    defaultSwitchableTile: 1,
    hide: true,
    editable: true,
    width: '100%',
    height: '500',
    lon: 2.0,
    lat: 45.0,
    zoom: 4,
    minZoom: 4,
    maxZoom: 19,
    geometryType: 'Geometry',
    centerOnResults: true,
    precision: 7
};

export default defaultParams ;
