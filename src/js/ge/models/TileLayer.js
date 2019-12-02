/**
 * Représente une couche
 *
 * @constructor
 *
 * @param {string} url Url de la couche
 * @param {Object} options Options
 * @param {string} options.crossOrigin "Anonymous" par defaut
 * @param {string} options.attributions Attributions
 * @param {string} options.logo Logo
 * @param {boolean} options.opaque Whether the layer is opaque.
 * @param {string} options.projection Projection. Default is EPSG:3857.
 * @param {string} options.maxZoom Optional max zoom level. Default is 18.
 * @param {string} options.minZoom Optional min zoom level. Default is 0.
 * @param {string} options.maxResolution The maximum resolution (exclusive) below which this layer will be visible.
 * @param {string} options.minResolution The minimum resolution (inclusive) at which this layer will be visible.
 * @param {string} options.opacity Opacity (0, 1). Default is 1.
 * @param {string} options.cacheSize Cache size. Default is 2048.
 * @param {boolean} options.wrapX Whether to wrap the world horizontally. Default is true.
 * @param {number} options.transition Duration of the opacity transition for rendering. To disable the opacity transition, pass transition: 0.
 */
var TileLayer = function (url, options) {

    this.settings = {
        url: url,
        crossOrigin: "Anonymous"
    };

    $.extend(true, this.settings, options); // deep copy

    this.layer = new ol.layer.Tile({
        source: new ol.source.XYZ(this.settings),
        minResolution: this.settings.minResolution,
        maxResolution: this.settings.maxResolution,
        opacity: this.settings.opacity
    });

    return this;
};

/**
 * get layer
 * Recupération d'une couche ol.Tile.Layer
 *
 * @returns ol.Layer.Tile
 */
TileLayer.prototype.getLayer = function () {
    return this.layer;
};


module.exports = TileLayer;
