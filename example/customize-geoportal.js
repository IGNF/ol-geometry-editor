
/*
 * WARNING : Demo API KEY. See http://api.ign.fr/conditions-generales
 */
var GEOPORTAL_API_KEY="pratique" ;

/**
 *
 * GEOGRAPHICALGRIDSYSTEMS.MAPS, ORTHOIMAGERY.ORTHOPHOTOS
 */
function getGeoportalURL( layerName ){
	var url = "https://wxs.ign.fr/" ;
	url += GEOPORTAL_API_KEY ;
	url += "/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile";
	url += "&LAYER="+layerName;
	url += "&STYLE=normal&FORMAT=image/jpeg";
	url += "&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" ;
	return url ;
}

if ( confirm("Display IGN data?") ){
	ge.defaultParams.tileLayers = [
		ge.createTileLayer(getGeoportalURL("ORTHOIMAGERY.ORTHOPHOTOS"),{
            attributions: ['©<a href="http://api.ign.fr/conditions-generales">IGN</a>']
        })
	];
}
