
/**
 * Indicates if the given type corresponds to a mutli geometry
 * @param {String} geometryType tested geometry type
 */
var isSingleGeometryType = function(geometryType) {
    return ["Point","LineString","Polygon","Rectangle"].indexOf(geometryType) !== -1 ;
};

module.exports = isSingleGeometryType ;
