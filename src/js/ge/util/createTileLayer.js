var TileLayer = require('../models/TileLayer');


/**
 * Utilitaire de création d'une couche TileLayer
 *
 * @param {string} url url de la couche
 * @param {Object} options options
 *
 * @returns ol.layer.Tile
 *
 */
var createTileLayer = function (url, options) {
    var tileLayer = new TileLayer(url, options);
    return tileLayer.getLayer();
};

module.exports = createTileLayer;
