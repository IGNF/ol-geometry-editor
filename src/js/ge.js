require("../css/draw-control.css");
//require("../images/.css");

global.ge = {
    defaultParams: require('./ge/defaultParams'),
    GeometryEditor: require('./ge/GeometryEditor')
};


if (jQuery) {
    /**
     * Expose jQuery plugin
     */
    jQuery.fn.geometryEditor = function (options) {
        return this.each(function () {
            var editor = new global.ge.GeometryEditor(this, options);
            $(this).data('editor', editor);
        });
    };
}

module.exports = global.ge;
