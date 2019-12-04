
/**
 *
 * Contrôle de gestion de l'arborescence de couches. *
 *
 * @constructor
 * @extends {ol.control.Control}
 *
 *
 */
var ExportToPngControl = function (options) {

    var settings = {
        format: "png"
    };

    this.settings = $.extend(settings, options);

    var element = $("<div>").addClass('ol-export-to-png ol-unselectable ol-control');


    $("<button>")
        .attr('title', 'Exporter au format ' + this.settings.format)
        .on("touchstart click", function (e) {
            if (e && e.preventDefault)
                e.preventDefault();

            this.export();

        }.bind(this))
        .appendTo(element);

    this.$previewElement = $("<a>")
        .attr('title', 'Prévisualiser')
        .addClass('preview')
        .html('')
        .hide()
        .appendTo(element);

    this.$downloadElement = $("<a>")
        .attr('title', 'Télécharger')
        .addClass('download')
        .html('')
        .hide()
        .appendTo(element);

    this.$modalBackground = $("<div>")
        .addClass("modal-container-export")
        .hide();

    this.$modalPreviewElement = $("<div>")
        .addClass("modal-content-export")
        .appendTo(this.$modalBackground);

    this.$modalTitle = $('<p>')
        .addClass('title-modal-export')
        .html('Prévisualisation')
        .appendTo(this.$modalPreviewElement);

    this.$modalCloser = $('<span>')
        .addClass('close-modal-export')
        .attr('title', 'Fermer')
        .html('&times;')
        .appendTo(this.$modalPreviewElement)
        .on("touchstart click", function(){
            this.$modalBackground.hide();
        }.bind(this));


    this.$previewImage = $('<img>')
        .addClass('image-preview')
        .attr('alt','Prévisualisation de la capture de la carte')
        .attr('title','Prévisualisation de la capture de la carte')
        .appendTo(this.$modalPreviewElement);

    $divDownloadModal = $('<div>')
        .addClass('modal-download-container')
        .appendTo(this.$modalPreviewElement);

    this.$downloadModalElement = $("<a>")
        .attr('title', 'Télécharger')
        .addClass('download-modal')
        .html('Télécharger')
        .appendTo($divDownloadModal);



    ol.control.Control.call(this, {
        element: element.get(0),
        target: options.target
    });

};

ol.inherits(ExportToPngControl, ol.control.Control);

ExportToPngControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();

};

ExportToPngControl.prototype.initControl = function () {

    this.base64Png = null;
    this.$modalBackground.appendTo($(this.getMap().getViewport()));

    this.$previewElement.on('touchstart click',function(){
        this.$modalBackground.show();
    }.bind(this));
};

ExportToPngControl.prototype.export = function () {
    var canvas = $(this.getMap().getViewport()).find("canvas").get(0);
    var base64Png = canvas.toDataURL(this.settings.format);



    if(this.base64Png !== base64Png){
        this.getMap().dispatchEvent({ type: "export:png", src: base64Png });

        //show button to show modal
        this.$previewElement.show();

        // add img to modal
        this.$previewImage.attr('src',base64Png);

        // show button to download and add attr to download for button in map
        this.$downloadElement.attr('download', 'map-export.png').attr('href', base64Png).show();

        // add attr to download for button in modal
        this.$downloadModalElement.attr('download', 'map-export.png').attr('href', base64Png);

        this.base64Png = base64Png;

    }else{
        this.$previewElement.toggle();
        this.$downloadElement.toggle();

    }

};


module.exports = ExportToPngControl;
