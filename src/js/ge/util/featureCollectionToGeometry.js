
import geometriesToCollection from './geometriesToCollection.js';

/**
 * Converts FeatureCollection to a normalized geometry
 */
var featureCollectionToGeometry = function(featureCollection){
    let geometries = [] ;
    featureCollection.features.forEach(function(feature){
        geometries.push( feature.geometry ) ;
    });

    if ( 0 === geometries.length ){
        return null ;
    }

    if ( 1 == geometries.length ){
        return geometries[0];
    }else{
        return geometriesToCollection(geometries) ;
    }
} ;

export default featureCollectionToGeometry ;
