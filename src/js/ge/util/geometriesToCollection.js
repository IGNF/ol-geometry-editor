
import geometryToSimpleGeometries from './geometryToSimpleGeometries.js';

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

    if(0 === geometries.length){
        return {};
    }

    if ( 1 == geometries.length ){
        return geometries[0];
    }

    /* First : convert all geometries in simple geometries */
    geometries = convertMultiGeomsToSimpleGeoms(geometries);

    // count by geometry type
    let counts = {};
    geometries.forEach(function(geometry){
        if ( 'undefined' === typeof counts[geometry.type] ){
            counts[geometry.type] = 1 ;
        }else{
            counts[geometry.type]++ ;
        }
    }) ;

    // some different geometry types => GeometryCollection
    let geometryTypes = Object.keys(counts) ;
    if ( 1 < geometryTypes.length ){
        return {
            "type": "GeometryCollection",
            "geometries": geometries
        } ;

    // One geometry type  => Multi + simple Geometry type
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
