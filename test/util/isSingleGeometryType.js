var expect = require('expect');

var isSingleGeometryType = require('../../src/ge/util/isSingleGeometryType.js');

describe('test isSingleGeometryType', function () {

    it('should be true for a Point', function (done) {
        expect( isSingleGeometryType("Point") ).toBe(true);
        done();
    });
    
    it('should be true for a LineString', function (done) {
        expect( isSingleGeometryType("LineString") ).toBe(true);
        done();
    });
    
    it('should be true for a Polygon', function (done) {
        expect( isSingleGeometryType("Polygon") ).toBe(true);
        done();
    });
    
    it('should be true for a Rectangle', function (done) {
        expect( isSingleGeometryType("Polygon") ).toBe(true);
        done();
    });

    it('should be false for a MultiPoint', function (done) {
        expect( isSingleGeometryType("MultiPoint") ).toBe(false);
        done();
    });
    
    it('should be false for a MultiLineString', function (done) {
        expect( isSingleGeometryType("MultiLineString") ).toBe(false);
        done();
    });
    
    it('should be false for a MultiPolygon', function (done) {
        expect( isSingleGeometryType("MultiPolygon") ).toBe(false);
        done();
    });
    
    it('should be false for a GeometryCollection', function (done) {
        expect( isSingleGeometryType("GeometryCollection") ).toBe(false);
        done();
    });
    
    it('should be false for a Geometry (no restriction)', function (done) {
        expect( isSingleGeometryType("Geometry") ).toBe(false);
        done();
    });
    
});


