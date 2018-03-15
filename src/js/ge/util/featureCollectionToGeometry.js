
var geometriesToCollection = require('./geometriesToCollection.js') ;

/**
 * Converts FeatureCollection to a normalized geometry
 */
var featureCollectionToGeometry = function(featureCollection){
    var geometries = [] ;
    featureCollection.features.forEach(function(feature){
        geometries.push( feature.geometry ) ;
    });

    if ( geometries.length === 0 ){
        return null ;
    }

    if ( geometries.length == 1 ){
        return geometries[0];
    }else{
        return geometriesToCollection(geometries) ;
    }
} ;

module.exports = featureCollectionToGeometry ;
