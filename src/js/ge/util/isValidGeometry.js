
/**
 * Indicates if the given geometry is valid
 * @param {String} geometryType tested geometry type
 */
var isValidGeometry = function (geometry) {


    var isGeometryOK = function (geometry) {
        // attribute 'type' is here ?
        if (!geometry.type) {
            return false;
        }

        // value 'type' is good ?
        switch (geometry.type) {
            case "Point":
            case "LineString":
            case "Polygon":
            case "MultiPoint":
            case "MultiLineString":
            case "MultiPolygon":
            case "GeometryCollection":
                break;
            default:
                return false;
        }

        // attribute 'coordinates' is here ?
        if (!geometry.coordinates) {
            return false;
        }

        // value 'coordinates' is coherent ?
        if (new ol.format.GeoJSON().readGeometry(JSON.stringify(geometry)).getCoordinates().length == 0) {
            return false;
        }

        return true;
    }



    if (geometry.geometries) {
        for (var i in geometry.geometries) {
           if(!isGeometryOK(geometry.geometries[i])){
            return false;
           }
        }
    }else{
        if(!isGeometryOK(geometry)){
            return false;
        }
    }

    return true;

};

module.exports = isValidGeometry;
