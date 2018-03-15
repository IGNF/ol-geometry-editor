var expect = require('expect');

var featureCollectionToGeometry = require('../../src/ge/util/featureCollectionToGeometry.js');

describe('test featureCollectionToGeometry', function () {

    describe('test single point', function () {
        var featureCollection = {
            "type": "FeatureCollection",
            "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [3.5, 4.5]
                    }
                }]
        };

        it('should produce a point', function (done) {
            var geometry = featureCollectionToGeometry(featureCollection);
            expect(geometry.type).toEqual("Point");
            done();
        });

        it('should keep coordinate', function (done) {
            var geometry = featureCollectionToGeometry(featureCollection);
            expect(JSON.stringify(geometry.coordinates)).toEqual("[3.5,4.5]");
            done();
        });
    });


    describe('test multi point', function () {
        var featureCollection = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [3.5, 4.5]
                    }
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [6.5, 7.5]
                    }
                }
            ]
        };

        it('should produce a MultiPoint', function (done) {
            var geometry = featureCollectionToGeometry(featureCollection);
            expect(geometry.type).toEqual("MultiPoint");
            done();
        });

        it('should keep coordinate', function (done) {
            var geometry = featureCollectionToGeometry(featureCollection);
            expect(JSON.stringify(geometry.coordinates)).toEqual("[[3.5,4.5],[6.5,7.5]]");
            done();
        });
    });

    describe('test GeometryCollection', function () {
        var featureCollection = {
            "type": "FeatureCollection",
            "features": [
                {"type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
                    "properties": {"prop0": "value0"}
                },
                {"type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                        ]
                    },
                    "properties": {
                        "prop0": "value0",
                        "prop1": 0.0
                    }
                },
                {"type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                                [100.0, 1.0], [100.0, 0.0]]
                        ]
                    },
                    "properties": {
                        "prop0": "value0",
                        "prop1": {"this": "that"}
                    }
                }
            ]
        };

        it('should produce a GeometryCollection', function (done) {
            var geometry = featureCollectionToGeometry(featureCollection);
            expect(geometry.type).toEqual("GeometryCollection");
            expect(JSON.stringify(geometry)).toEqual('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[102,0.5]},{"type":"LineString","coordinates":[[102,0],[103,1],[104,0],[105,1]]},{"type":"Polygon","coordinates":[[[100,0],[101,0],[101,1],[100,1],[100,0]]]}]}');
            done();
        });

    });


});
