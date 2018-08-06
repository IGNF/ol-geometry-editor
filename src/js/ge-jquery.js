var ge = require('./ge');

/**
 * Expose jQuery plugin
 */
jQuery.fn.geometryEditor = function( options ){
    return this.each(function() {
        var editor = new ge.GeometryEditor(this,options);
        $(this).data('editor',editor);
    });
} ;
