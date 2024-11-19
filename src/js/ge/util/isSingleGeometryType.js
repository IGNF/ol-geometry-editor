
/**
 * Indicates if the given type corresponds to a mutli geometry
 * @param {String} geometryType tested geometry type
 */
var isSingleGeometryType = function(geometryType) {
    return -1 !== ["Point","LineString","Polygon","Rectangle"].indexOf(geometryType) ;
};

export default isSingleGeometryType ;
