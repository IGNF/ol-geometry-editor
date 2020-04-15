
var geometryToSimpleGeometries = require('./geometryToSimpleGeometries');

var convertMultiGeomsToSimpleGeoms = function(geometries){
    var simpleGeometries = [];

    geometries.forEach(geometry => {
        var geoms =  geometryToSimpleGeometries(geometry);

        geoms.forEach(simpleGeom => {
            simpleGeometries.push(simpleGeom);
        });
    });

    return simpleGeometries;
};

/**
 * Converts an array of geometries to a collection (MultiPoint, MultiLineString,
 * MultiPolygon, GeometryCollection).
 */
var geometriesToCollection = function(geometries){
    if(!geometries){
        return null;
    }

    if(geometries.length === 0){
        return {};
    }

    if ( geometries.length == 1 ){
        return geometries[0];
    }

    /* First : convert all geometries in simple geometries */
    geometries = convertMultiGeomsToSimpleGeoms(geometries);

    // count by geometry type
    var counts = {};
    geometries.forEach(function(geometry){
        if ( typeof counts[geometry.type] === 'undefined' ){
            counts[geometry.type] = 1 ;
        }else{
            counts[geometry.type]++ ;
        }
    }) ;

    // list different geometry types
    var geometryTypes = Object.keys(counts) ;

    // some different geometry types => GeometryCollection
    if ( geometryTypes.length > 1 ){
        return {
            "type": "GeometryCollection",
            "geometries": geometries
        } ;

    // One geometry type  => Multi + simple Geometry type
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
