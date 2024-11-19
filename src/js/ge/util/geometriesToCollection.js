
/**
 * Converts an array of geometries to a collection (MultiPoint, MultiLineString,
 * MultiPolygon, GeometryCollection).
 */
var geometriesToCollection = function(geometries){
    // count by geometry type
    let counts = {};
    geometries.forEach(function(geometry){
        if ( 'undefined' === typeof counts[geometry.type] ){
            counts[geometry.type] = 1 ;
        }else{
            counts[geometry.type]++ ;
        }
    }) ;

    let geometryTypes = Object.keys(counts) ;
    if ( 1 < geometryTypes.length ){
        return {
            "type": "GeometryCollection",
            "geometries": geometries
        } ;
    }else{
        let multiType = "Multi"+Object.keys(counts)[0] ;
        let coordinates = [];
        geometries.forEach(function(geometry){
            coordinates.push(geometry.coordinates);
        }) ;
        return {
            "type": multiType,
            "coordinates": coordinates
        } ;
    }
} ;

export default geometriesToCollection ;
