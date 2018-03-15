
/**
 * Converts an array of geometries to a collection (MultiPoint, MultiLineString,
 * MultiPolygon, GeometryCollection).
 */
var geometriesToCollection = function(geometries){
    // count by geometry type
    var counts = {};
    geometries.forEach(function(geometry){
        if ( typeof counts[geometry.type] === 'undefined' ){
            counts[geometry.type] = 1 ;
        }else{
            counts[geometry.type]++ ;
        }
    }) ;

    var geometryTypes = Object.keys(counts) ;
    if ( geometryTypes.length > 1 ){
        return {
            "type": "GeometryCollection",
            "geometries": geometries
        } ;
    }else{
        var multiType = "Multi"+Object.keys(counts)[0] ;
        var coordinates = [];
        geometries.forEach(function(geometry){
            coordinates.push(geometry.coordinates);
        }) ;
        return {
            "type": multiType,
            "coordinates": coordinates
        } ;
    }
} ;

module.exports = geometriesToCollection ;
