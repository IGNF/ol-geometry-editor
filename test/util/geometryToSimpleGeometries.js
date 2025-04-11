import expect from 'expect';

import geometryToSimpleGeometries from '../../src/js/ge/util/geometryToSimpleGeometries.js';

describe('test geometryToSimpleGeometries', function () {

    it('should convert simple Point geometry to array of a simple Point geometry', function (done) {
        var geometry = {
            "type": "Point",
            "coordinates": [
                2.424573,
                48.845726
            ]
        };

        var simpleGeometries = [{
            "type": "Point",
            "coordinates": [
                2.424573,
                48.845726
            ]
        }];

        expect(geometryToSimpleGeometries(geometry)).toEqual(simpleGeometries);
        done();
    });

    it('should convert MultiPoint geometry to array of simple Point geometries', function (done) {
        var geometry = {
            "type": "MultiPoint",
            "coordinates": [
                [
                    2.424573,
                    48.845726
                ],
                [
                    3.424573,
                    49.845726
                ]
            ]
        };

        var simpleGeometries = [
            {
                "type": "Point",
                "coordinates": [
                    2.424573,
                    48.845726
                ]
            },
            {
                "type": "Point",
                "coordinates": [
                    3.424573,
                    49.845726
                ]
            }
        ];

        expect(geometryToSimpleGeometries(geometry)).toEqual(simpleGeometries);
        done();
    });



    it('should convert simple LineString geometry to array of a simple LineString geometry', function (done) {
        var geometry = {
            "type": "LineString",
            "coordinates": [
                [
                    2.4243616,
                    48.8460027
                ],
                [
                    2.424257,
                    48.8456691
                ]
            ]
        };

        var simpleGeometries = [
            {
                "type": "LineString",
                "coordinates": [
                    [
                        2.4243616,
                        48.8460027
                    ],
                    [
                        2.424257,
                        48.8456691
                    ]
                ]
            }
        ];

        expect(geometryToSimpleGeometries(geometry)).toEqual(simpleGeometries);
        done();
    });

    it('should convert MultiPoint geometry to array of simple LineString geometries', function (done) {
        var geometry = {
            "type": "MultiLineString",
            "coordinates": [
                [
                    [
                        2.4243616,
                        48.8460027
                    ],
                    [
                        2.424257,
                        48.8456691
                    ]
                ],
                [
                    [
                        3.4243616,
                        49.8460027
                    ],
                    [
                        3.424257,
                        49.8456691
                    ]
                ]
            ]
        };

        var simpleGeometries = [
            {
                "type": "LineString",
                "coordinates": [
                    [
                        2.4243616,
                        48.8460027
                    ],
                    [
                        2.424257,
                        48.8456691
                    ]
                ]
            },
            {
                "type": "LineString",
                "coordinates": [
                    [
                        3.4243616,
                        49.8460027
                    ],
                    [
                        3.424257,
                        49.8456691
                    ]
                ]
            }
        ];

        expect(geometryToSimpleGeometries(geometry)).toEqual(simpleGeometries);
        done();
    });


    it('should convert simple Polygon geometry to array of a simple Polygon geometry', function (done) {
        var geometry = {
            "type": "Polygon",
            "coordinates":
                [
                    [
                        [
                            2.4241684,
                            48.8460362
                        ],
                        [
                            2.4240209,
                            48.8459674
                        ],
                        [
                            2.4243213,
                            48.8458897
                        ],
                        [
                            2.4241684,
                            48.8460362
                        ]
                    ]
                ]
        };

        var simpleGeometries = [
            {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            2.4241684,
                            48.8460362
                        ],
                        [
                            2.4240209,
                            48.8459674
                        ],
                        [
                            2.4243213,
                            48.8458897
                        ],
                        [
                            2.4241684,
                            48.8460362
                        ]
                    ]
                ]
            }
        ];

        expect(geometryToSimpleGeometries(geometry)).toEqual(simpleGeometries);
        done();
    });

    it('should convert MultiPolygon geometry to array of simple Polygon geometries', function (done) {

        var geometry = {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [
                            2.4241684,
                            48.8460362
                        ],
                        [
                            2.4240209,
                            48.8459674
                        ],
                        [
                            2.4243213,
                            48.8458897
                        ],
                        [
                            2.4241684,
                            48.8460362
                        ]
                    ]
                ],
                [
                    [
                        [
                            2.424383,
                            48.8460998
                        ],
                        [
                            2.4242972,
                            48.8460309
                        ],
                        [
                            2.4244367,
                            48.8459921
                        ],
                        [
                            2.424383,
                            48.8460998
                        ]
                    ]
                ]
            ]
        };

        var simpleGeometries = [
            {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            2.4241684,
                            48.8460362
                        ],
                        [
                            2.4240209,
                            48.8459674
                        ],
                        [
                            2.4243213,
                            48.8458897
                        ],
                        [
                            2.4241684,
                            48.8460362
                        ]
                    ]
                ]
            },
            {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            2.424383,
                            48.8460998
                        ],
                        [
                            2.4242972,
                            48.8460309
                        ],
                        [
                            2.4244367,
                            48.8459921
                        ],
                        [
                            2.424383,
                            48.8460998
                        ]
                    ]
                ]
            }
        ];

        expect(geometryToSimpleGeometries(geometry)).toEqual(simpleGeometries);
        done();
    });



    it('should convert GeometryCollection geometry (of simple + multi geometries) to array of simple geometries', function (done) {

        var geometry = {
            "type": "GeometryCollection",
            "geometries": [
                {
                    "type": "Point",
                    "coordinates": [
                        2.4240156,
                        48.8461951
                    ]
                },
                {
                    "type": "LineString",
                    "coordinates": [
                        [
                            2.4242301,
                            48.8463681
                        ],
                        [
                            2.4241577,
                            48.8460556
                        ],
                        [
                            2.4243213,
                            48.8462021
                        ]
                    ]
                },
                {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                2.424383,
                                48.8460998
                            ],
                            [
                                2.4242972,
                                48.8460309
                            ],
                            [
                                2.4244367,
                                48.8459921
                            ],
                            [
                                2.424383,
                                48.8460998
                            ]
                        ]
                    ]
                },
                {
                    "type": "MultiPoint",
                    "coordinates":
                        [
                            [
                                2.4239404,
                                48.8464545
                            ],
                            [
                                3.4239404,
                                49.8464545
                            ]
                        ]
                },
                {
                    "type": "MultiLineString",
                    "coordinates": [
                        [

                            [
                                2.4239619,
                                48.8463945
                            ],
                            [
                                2.4241845,
                                48.8464369
                            ]
                        ],
                        [
                            [
                                3.4239619,
                                49.8463945
                            ],
                            [
                                3.4241845,
                                49.8464369
                            ]
                        ]
                    ]
                },

                {
                    "type": "MultiPolygon",
                    "coordinates": [
                        [
                            [
                                [
                                    2.4241148,
                                    48.8465534
                                ],
                                [
                                    2.4240665,
                                    48.8465093
                                ],
                                [
                                    2.4241926,
                                    48.846534
                                ],
                                [
                                    2.4241282,
                                    48.8464969
                                ],
                                [
                                    2.4241148,
                                    48.8465534
                                ]
                            ]
                        ],
                        [
                            [
                                [
                                    3.4241148,
                                    49.8465534
                                ],
                                [
                                    3.4240665,
                                    49.8465093
                                ],
                                [
                                    3.4241926,
                                    49.846534
                                ],
                                [
                                    3.4241282,
                                    49.8464969
                                ],
                                [
                                    3.4241148,
                                    49.8465534
                                ]
                            ]
                        ]
                    ]
                }
            ]
        };

        var simpleGeometries = [
            {
                "type": "Point",
                "coordinates": [
                    2.4240156,
                    48.8461951
                ]
            },
            {
                "type": "LineString",
                "coordinates": [
                    [
                        2.4242301,
                        48.8463681
                    ],
                    [
                        2.4241577,
                        48.8460556
                    ],
                    [
                        2.4243213,
                        48.8462021
                    ]
                ]
            },
            {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            2.424383,
                            48.8460998
                        ],
                        [
                            2.4242972,
                            48.8460309
                        ],
                        [
                            2.4244367,
                            48.8459921
                        ],
                        [
                            2.424383,
                            48.8460998
                        ]
                    ]
                ]
            },
            {
                "type": "Point",
                "coordinates": [
                    2.4239404,
                    48.8464545
                ]
            },
            {
                "type": "Point",
                "coordinates": [
                    3.4239404,
                    49.8464545
                ]
            },
            {
                "type": "LineString",
                "coordinates": [
                    [
                        2.4239619,
                        48.8463945
                    ],
                    [
                        2.4241845,
                        48.8464369
                    ]
                ]
            },
            {
                "type": "LineString",
                "coordinates": [
                    [
                        3.4239619,
                        49.8463945
                    ],
                    [
                        3.4241845,
                        49.8464369
                    ]
                ]
            },
            {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            2.4241148,
                            48.8465534
                        ],
                        [
                            2.4240665,
                            48.8465093
                        ],
                        [
                            2.4241926,
                            48.846534
                        ],
                        [
                            2.4241282,
                            48.8464969
                        ],
                        [
                            2.4241148,
                            48.8465534
                        ]
                    ]
                ]
            },
            {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            3.4241148,
                            49.8465534
                        ],
                        [
                            3.4240665,
                            49.8465093
                        ],
                        [
                            3.4241926,
                            49.846534
                        ],
                        [
                            3.4241282,
                            49.8464969
                        ],
                        [
                            3.4241148,
                            49.8465534
                        ]
                    ]
                ]
            }
        ];

        expect(geometryToSimpleGeometries(geometry)).toEqual(simpleGeometries);
        done();
    });










});

