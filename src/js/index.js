// TODO check browserify usage (http://dontkry.com/posts/code/browserify-and-the-universal-module-definition.html)

var jQuery = require('jquery');

var ge = {
    defaultParams: require('./ge/defaultParams'),
    GeometryEditor: require('./ge/GeometryEditor')
} ;

/**
 * Expose jQuery plugin
 */
jQuery.fn.geometryEditor = function( options ){
    return this.each(function() {
        var elem = $(this) ;
        var editor = new ge.GeometryEditor(elem,options);
        elem.data('editor',editor);
    });
} ;

global.ge = ge ;
