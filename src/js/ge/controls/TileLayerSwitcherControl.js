
/**
 *
 * Contrôle de gestion de l'arborescence de couches. *
 *
 * @constructor
 * @extends {ol.control.Control}
 *
 * @param {Object} options - options
 * @param {Array} options.tileCoord - [tileMatrix, tileCol, (tileRow *(-1)-1)]
 * @param {string} options.defaultTileImgUrl - Url de l'Image par défaut si pas de tile - non implémenté
 *
 */
var TileLayerSwitcherControl = function (options) {

    var settings = {
        tileCoord: [9, 253, -177], // [tileMatrix,tileCol, (tileRow *(-1)-1)]
        defaultTileImgUrl: null
    };

    this.settings = $.extend(settings, options);

    var element = $("<div>").addClass('ol-tile-layer-switcher ol-unselectable ol-control');

    ol.control.Control.call(this, {
        element: element.get(0),
        target: options.target
    });

    this.tilesToAddWhenSetMap = [];
};

ol.inherits(TileLayerSwitcherControl, ol.control.Control);

TileLayerSwitcherControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();

};


TileLayerSwitcherControl.prototype.initControl = function () {
    this.tiles = {};

    this.addTiles(this.tilesToAddWhenSetMap);
    this.tilesToAddWhenSetMap = [];
};



TileLayerSwitcherControl.prototype.createTile = function (layers, title) {
    return new TileItem(this, layers, title);
};

/**
 * Ajoute une tuile contenant des couches (de 0 à n)
 *
 * @param {Array} layers Couches de l'entrée
 * @param {string} title Titre de l'entrée
 *
 * @returns {TileItem}
 */
TileLayerSwitcherControl.prototype.addTile = function (layers, title) {
    var tile = this.createTile(layers, title);

    if (!this.getMap()) {
        this.tilesToAddWhenSetMap.push(tile);

    } else {

        tile.createElement();

        while (this.isTileExist(tile.id)) {
            tile.changeId(tile.id + "_");
        }

        this.tiles[tile.id] = tile;

        tile.element.appendTo(this.element);
        tile.position = Object.keys(this.tiles).length;
        tile.element.css({ 'z-index': (99 - (Object.keys(this.tiles).length + 1)) });

        var self = this;
        tile.element.on('touchstart click', function () {
            self.setFondCarto(tile.id);
        });
    }

    return tile;
};

/**
 * Ajoute des tuiles
 *
 * @param {Array} tiles tableau de Tiles
 */
TileLayerSwitcherControl.prototype.addTiles = function (tiles) {
    for (var i in tiles) {
        this.addTile(tiles[i].layers, tiles[i].title);
    }
};


/**
 * Permet de garder le tileLayerSwitcher ouvert en ajoutant une classe
 * .deployed (normalement géré par :hover)
 *
 * @param {boolean} deploy True pour déployer, False pour rempiler
 */
TileLayerSwitcherControl.prototype.deploy = function (deploy) {
    if (deploy) {
        $(this.element).addClass("deployed");
    } else {
        $(this.element).removeClass("deployed");
    }

};


/**
 * Active les couches d'une tuile et
 * desactive celles des autres tuiles du TileLayerSwitcher
 *
 * @param {string} tileId - Identifiant de la tuile
 * @param {boolean} triggerEvent - true: Déclanche l'évent 'change:tile'
 *
 */
TileLayerSwitcherControl.prototype.setFondCarto = function (tileId, triggerEvent) {
    this.deactivateAllTiles();
    if (this.isTileExist(tileId)) {
        this.tiles[tileId].setActive(true);
    }

    if (triggerEvent !== false) {
        this.dispatchEvent({ type: 'change:tile', id: tileId, tile: this.tiles[tileId] });
    }
};


/**
 * Active les couches d'une tuile et
 * desactive celles des autres tuiles du TileLayerSwitcher
 *
 * @param {string|int} position - position de la tuile
 * @param {boolean} triggerEvent - true: Déclanche l'évent 'change:tile'
 *
 */
TileLayerSwitcherControl.prototype.setFondCartoByTilePosition = function (position, triggerEvent) {
    this.setFondCarto(this.getTileByPosition(position).getId(), triggerEvent)
};


/**
 * Desactive toutes les couches de chaque Tile
 *
 */
TileLayerSwitcherControl.prototype.deactivateAllTiles = function () {
    for (var id in this.tiles) {
        this.tiles[id].setActive(false);
    }
};

TileLayerSwitcherControl.prototype.isTileExist = function (tileId) {
    return typeof this.tiles[tileId] !== "undefined";
};

TileLayerSwitcherControl.prototype.getTiles = function () {
    return this.tiles;
};

TileLayerSwitcherControl.prototype.getTileById = function (id) {
    return this.tiles[id] || null;
};

TileLayerSwitcherControl.prototype.getTileByPosition = function (position) {
    for (var id in this.tiles) {
        if (this.tiles[id].position === position) {
            return this.tiles[id];
        }
    }

    return null;
};


/**
 * Récupère l'url correspondant à la l'image d'une tuile à un emplacement précis d'une couche
 *
 * @param {ol.layer} layer Couche dont on veut récupérer le lien de l'image
 *
 * @returns {string}
 */
TileLayerSwitcherControl.prototype.getLayerImageUrl = function (layer) {

    var source = layer.getSource();
    if (source.getTileUrlFunction) {
        var tileUrlFunction = source.getTileUrlFunction();
        return tileUrlFunction(this.settings.tileCoord, 1, this.getMap().getView().getProjection());
    }

    return null;
};

module.exports = TileLayerSwitcherControl;



var TileItem = function (tls, layers, title) {
    this.tileLayerSwitcher = tls;
    this.active = false;
    this.title = title;
    this.layers = layers;
    this.position = null;
    this.id = "ol-tile-" + title.toLowerCase().replace(/[.& ]/ig, "_");
};


TileItem.prototype.setActive = function (active) {
    $(this.layers).each(function () {
        if (this.getVisible() !== active) {
            this.setVisible(active);
        }
    });

    this.active = active;

    if (active) {
        this.element.addClass('active');
    } else {
        this.element.removeClass('active');
    }
};

TileItem.prototype.createElement = function () {
    this.element = $('<div class="ol-tile-item">');
    var button = $('<button>').attr('id', this.id).appendTo(this.element);
    var title = $('<label>').html(this.title).appendTo(this.element);
    var buttonContent = $('<div class="tile-images">').appendTo(button);

    var image = $('<img>');

    for (var i in this.layers) {
        image.clone().attr('src', this.tileLayerSwitcher.getLayerImageUrl(this.layers[i]))
            .attr('style', "opacity : " + this.layers[i].getOpacity() + ";")
            .appendTo(buttonContent);
    }

    return this.element;
};

TileItem.prototype.changeId = function (newId) {
    this.id = newId;
    this.element.find('button').attr('id', newId);
};

TileItem.prototype.getPosition = function () {
    return this.position;
};

TileItem.prototype.getId = function () {
    return this.id;
};

