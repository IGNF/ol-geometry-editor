
/**
 *
 * GEOGRAPHICALGRIDSYSTEMS.MAPS, ORTHOIMAGERY.ORTHOPHOTOS
 */
function getGeoportalURL(layerName, format) {
        let url = "https://data.geopf.fr/wmts?";
        url += "SERVICE=WMTS";
        url += "&VERSION=1.0.0";
        url += "&REQUEST=GetTile";
        url += "&LAYER=" + layerName;
        url += "&STYLE=normal";
        url += "&FORMAT=" + format;
        url += "&TILEMATRIXSET=PM";
        url += "&TILEMATRIX={z}";
        url += "&TILEROW={y}";
        url += "&TILECOL={x}";
        return url;
}

if (confirm("Display IGN data?")) {
        ge.defaultParams.tileLayers = [
                {
                        url: getGeoportalURL("GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2", "image/png"),
                        attribution: '<a href="http://api.ign.fr/conditions-generales">IGN</a>'
                }
        ];
}
