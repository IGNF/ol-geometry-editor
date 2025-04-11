import '../css/draw-control.css';
import '../css/tilelayerswitcher-control.css';
import '../css/export-to-png-control.css';

import defaultParams from './ge/defaultParams.js';
import GeometryEditor from './ge/GeometryEditor.js';

//import ../images/.css

let ge = {
    defaultParams: defaultParams,
    GeometryEditor: GeometryEditor
};


if (jQuery) {
    /**
     * Expose jQuery plugin
     */
    jQuery.fn.geometryEditor = function (options) {
        return this.each(function () {
            let editor = new ge.GeometryEditor(this, options);
            $(this).data('editor', editor);
        });
    };
}

window.ge = ge;

export default ge;
