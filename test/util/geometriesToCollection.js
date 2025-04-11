import expect from 'expect';

import geometriesToCollection from '../../src/js/ge/util/geometriesToCollection.js';


describe('test geometriesToCollection', function () {

    it('should convert empty array of geometries to empty object', function (done) {
        expect(geometriesToCollection([])).toEqual({});
        done();
    });

    it('should convert null geometries to null result', function (done) {
        expect(geometriesToCollection(null)).toEqual(null);
        done();
    });

    it('should convert false geometries to null result', function (done) {
        expect(geometriesToCollection(false)).toEqual(null);
        done();
    });

    describe('test Point/MultiPoint geometries to MultiPoint collection', function () {

        it('should convert array of Point geometrie to object of Point Geometrie', function (done) {
            var geometries = [
                {
                    "type": "Point",
                    "coordinates": [
                        2.424573,
                        48.845726
                    ]
                }
            ];

            var collection = {
                "type": "Point",
                "coordinates": [
                    2.424573,
                    48.845726
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });

        it('should convert array of Point geometries to object of MultiPoint Geometrie', function (done) {
            var geometries = [
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
                        2.423843,
                        48.846283
                    ]
                }
            ];

            var collection = {
                "type": "MultiPoint",
                "coordinates": [
                    [
                        2.424573,
                        48.845726
                    ],
                    [
                        2.423843,
                        48.846283
                    ]
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });


        it('should convert array of Point + MultiPoint geometries to object of MultiPoint Geometrie', function (done) {
            var geometries = [
                {
                    "type": "Point",
                    "coordinates": [
                        2.424573,
                        48.845726
                    ]
                },
                {
                    "type": "MultiPoint",
                    "coordinates": [
                        [
                            2.423843,
                            48.846283
                        ]
                    ]
                }
            ];

            var collection = {
                "type": "MultiPoint",
                "coordinates": [
                    [
                        2.424573,
                        48.845726
                    ],
                    [
                        2.423843,
                        48.846283
                    ]
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });

        it('should convert array of MultiPoint geometries to object of MultiPoint Geometrie', function (done) {
            var geometries = [
                {
                    "type": "MultiPoint",
                    "coordinates": [
                        [
                            2.424573,
                            48.845726
                        ]
                    ]
                },
                {
                    "type": "MultiPoint",
                    "coordinates": [
                        [
                            2.423843,
                            48.846283
                        ]
                    ]
                }
            ];

            var collection = {
                "type": "MultiPoint",
                "coordinates": [
                    [
                        2.424573,
                        48.845726
                    ],
                    [
                        2.423843,
                        48.846283
                    ]
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });

    });



    describe('test LineString/MultiLineString geometries to MultiLineString collection', function () {

        it('should convert array of LineString geometrie to object of LineString Geometrie', function (done) {
            var geometries = [
                {
                    "type": "LineString",
                    "coordinates":
                        [
                            [
                                2.423971,
                                48.846601
                            ],
                            [
                                2.42572,
                                48.846502
                            ]
                        ]
                }
            ];

            var collection = {
                "type": "LineString",
                "coordinates":
                    [
                        [
                            2.423971,
                            48.846601
                        ],
                        [
                            2.42572,
                            48.846502
                        ]
                    ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });

        it('should convert array of LineString geometries to object of MultiLineString Geometrie', function (done) {
            var geometries = [
                {
                    "type": "LineString",
                    "coordinates": [
                        [
                            2.423971,
                            48.846601
                        ],
                        [
                            2.42572,
                            48.846502
                        ]
                    ]
                },
                {
                    "type": "LineString",
                    "coordinates": [
                        [
                            2.423778,
                            48.846241
                        ],
                        [
                            2.423607,
                            48.84694
                        ]
                    ]
                }
            ];

            var collection = {
                "type": "MultiLineString",
                "coordinates": [
                    [
                        [
                            2.423971,
                            48.846601
                        ],
                        [
                            2.42572,
                            48.846502
                        ]
                    ],
                    [
                        [
                            2.423778,
                            48.846241
                        ],
                        [
                            2.423607,
                            48.84694
                        ]
                    ]
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });


        it('should convert array of LineString + MultiLineString geometries to object of MultiLineString Geometrie', function (done) {
            var geometries = [
                {
                    "type": "LineString",
                    "coordinates": [
                        [
                            2.423971,
                            48.846601
                        ],
                        [
                            2.42572,
                            48.846502
                        ]
                    ]
                },
                {
                    "type": "MultiLineString",
                    "coordinates": [
                        [
                            [
                                2.423778,
                                48.846241
                            ],
                            [
                                2.423607,
                                48.84694
                            ]
                        ]
                    ]
                }
            ];

            var collection = {
                "type": "MultiLineString",
                "coordinates": [
                    [
                        [
                            2.423971,
                            48.846601
                        ],
                        [
                            2.42572,
                            48.846502
                        ]
                    ],
                    [
                        [
                            2.423778,
                            48.846241
                        ],
                        [
                            2.423607,
                            48.84694
                        ]
                    ]
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });

        it('should convert array of MultiLineString geometries to object of MultiLineString Geometrie', function (done) {
            var geometries = [
                {
                    "type": "MultiLineString",
                    "coordinates": [
                        [
                            [
                                2.423971,
                                48.846601
                            ],
                            [
                                2.42572,
                                48.846502
                            ]
                        ],
                        [
                            [
                                3.423971,
                                49.846601
                            ],
                            [
                                3.42572,
                                49.846502
                            ]
                        ]
                    ]
                },
                {
                    "type": "MultiLineString",
                    "coordinates": [
                        [
                            [
                                2.423778,
                                48.846241
                            ],
                            [
                                2.423607,
                                48.84694
                            ]
                        ]
                    ]
                }
            ];

            var collection = {
                "type": "MultiLineString",
                "coordinates": [
                    [
                        [
                            2.423971,
                            48.846601
                        ],
                        [
                            2.42572,
                            48.846502
                        ]
                    ],
                    [
                        [
                            3.423971,
                            49.846601
                        ],
                        [
                            3.42572,
                            49.846502
                        ]
                    ],
                    [
                        [
                            2.423778,
                            48.846241
                        ],
                        [
                            2.423607,
                            48.84694
                        ]
                    ]
                ]
            };
            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });

    });


    describe('test Polygon/MultiPolygon geometries to MultiPolygon collection', function () {
        it('should convert array of Polygon geometrie to object of Polygon Geometrie', function (done) {
            var geometries = [
                {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                2.4244,
                                48.846947
                            ],
                            [
                                2.423735,
                                48.84622
                            ],
                            [
                                2.425516,
                                48.846488
                            ],
                            [
                                2.4244,
                                48.846947
                            ]
                        ]
                    ]
                }
            ];

            var collection = {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            2.4244,
                            48.846947
                        ],
                        [
                            2.423735,
                            48.84622
                        ],
                        [
                            2.425516,
                            48.846488
                        ],
                        [
                            2.4244,
                            48.846947
                        ]
                    ]
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });

        it('should convert array of Polygon geometries to object of MultiPolygon Geometrie', function (done) {
            var geometries = [
                {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                2.4244,
                                48.846947
                            ],
                            [
                                2.423735,
                                48.84622
                            ],
                            [
                                2.425516,
                                48.846488
                            ],
                            [
                                2.4244,
                                48.846947
                            ]
                        ]
                    ]
                },
                {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                2.42395,
                                48.846043
                            ],
                            [
                                2.423714,
                                48.845711
                            ],
                            [
                                2.424443,
                                48.845718
                            ],
                            [
                                2.42395,
                                48.846043
                            ]
                        ]
                    ]
                }
            ];

            var collection = {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                2.4244,
                                48.846947
                            ],
                            [
                                2.423735,
                                48.84622
                            ],
                            [
                                2.425516,
                                48.846488
                            ],
                            [
                                2.4244,
                                48.846947
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                2.42395,
                                48.846043
                            ],
                            [
                                2.423714,
                                48.845711
                            ],
                            [
                                2.424443,
                                48.845718
                            ],
                            [
                                2.42395,
                                48.846043
                            ]
                        ]
                    ]
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });

        it('should convert array of Polygon + MultiPolygon geometries to object of MultiPolygon Geometrie', function (done) {

            var geometries = [
                {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                2.4244,
                                48.846947
                            ],
                            [
                                2.423735,
                                48.84622
                            ],
                            [
                                2.425516,
                                48.846488
                            ],
                            [
                                2.4244,
                                48.846947
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
                                    2.42395,
                                    48.846043
                                ],
                                [
                                    2.423714,
                                    48.845711
                                ],
                                [
                                    2.424443,
                                    48.845718
                                ],
                                [
                                    2.42395,
                                    48.846043
                                ]
                            ]
                        ],
                        [
                            [
                                [
                                    3.42395,
                                    49.846043
                                ],
                                [
                                    3.423714,
                                    49.845711
                                ],
                                [
                                    3.424443,
                                    49.845718
                                ],
                                [
                                    3.42395,
                                    49.846043
                                ]
                            ]
                        ]
                    ]
                }
            ];

            var collection = {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                2.4244,
                                48.846947
                            ],
                            [
                                2.423735,
                                48.84622
                            ],
                            [
                                2.425516,
                                48.846488
                            ],
                            [
                                2.4244,
                                48.846947
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                2.42395,
                                48.846043
                            ],
                            [
                                2.423714,
                                48.845711
                            ],
                            [
                                2.424443,
                                48.845718
                            ],
                            [
                                2.42395,
                                48.846043
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                3.42395,
                                49.846043
                            ],
                            [
                                3.423714,
                                49.845711
                            ],
                            [
                                3.424443,
                                49.845718
                            ],
                            [
                                3.42395,
                                49.846043
                            ]
                        ]
                    ]
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });

        it('should convert array of MultiPolygon geometries to object of MultiPolygon Geometrie', function (done) {
            var geometries = [
                {
                    "type": "MultiPolygon",
                    "coordinates": [
                        [
                            [
                                [
                                    2.4244,
                                    48.846947
                                ],
                                [
                                    2.423735,
                                    48.84622
                                ],
                                [
                                    2.425516,
                                    48.846488
                                ],
                                [
                                    2.4244,
                                    48.846947
                                ]
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
                                    2.42395,
                                    48.846043
                                ],
                                [
                                    2.423714,
                                    48.845711
                                ],
                                [
                                    2.424443,
                                    48.845718
                                ],
                                [
                                    2.42395,
                                    48.846043
                                ]
                            ]
                        ],
                        [
                            [
                                [
                                    3.42395,
                                    49.846043
                                ],
                                [
                                    3.423714,
                                    49.845711
                                ],
                                [
                                    3.424443,
                                    49.845718
                                ],
                                [
                                    3.42395,
                                    49.846043
                                ]
                            ]
                        ]
                    ]
                }
            ];

            var collection = {
                "type": "MultiPolygon",
                "coordinates": [
                    [
                        [
                            [
                                2.4244,
                                48.846947
                            ],
                            [
                                2.423735,
                                48.84622
                            ],
                            [
                                2.425516,
                                48.846488
                            ],
                            [
                                2.4244,
                                48.846947
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                2.42395,
                                48.846043
                            ],
                            [
                                2.423714,
                                48.845711
                            ],
                            [
                                2.424443,
                                48.845718
                            ],
                            [
                                2.42395,
                                48.846043
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                3.42395,
                                49.846043
                            ],
                            [
                                3.423714,
                                49.845711
                            ],
                            [
                                3.424443,
                                49.845718
                            ],
                            [
                                3.42395,
                                49.846043
                            ]
                        ]
                    ]
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });
    });

    describe('test Point/LineString/Polygon/MultiPoint/MultiLineString/MultiPolygon geometries to Geometries collection', function () {

        it('should convert array of geometries (simple or multi) to GeometryCollection object (simple geometries only inside) ', function (done) {
            var geometries = [
                {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                2.42395,
                                48.846043
                            ],
                            [
                                2.423714,
                                48.845711
                            ],
                            [
                                2.424443,
                                48.845718
                            ],
                            [
                                2.42395,
                                48.846043
                            ]
                        ]
                    ]
                },
                {
                    "type": "Point",
                    "coordinates": [
                        2.423746,
                        48.846601
                    ]
                },
                {
                    "type": "LineString",
                    "coordinates": [
                        [
                            2.425548,
                            48.846064
                        ],
                        [
                            2.42543,
                            48.845351
                        ]
                    ]
                },
                {
                    "type": "MultiPoint",
                    "coordinates": [
                        [
                            2.424379,
                            48.846862
                        ]
                    ]
                },
                {
                    "type": "MultiLineString",
                    "coordinates": [
                        [
                            [
                                2.425345,
                                48.846375
                            ],
                            [
                                2.425302,
                                48.846601
                            ],
                            [
                                2.425752,
                                48.846474
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
                                    2.422898,
                                    48.846403
                                ],
                                [
                                    2.422995,
                                    48.846573
                                ],
                                [
                                    2.423328,
                                    48.84646
                                ],
                                [
                                    2.423306,
                                    48.846361
                                ],
                                [
                                    2.422898,
                                    48.846403
                                ]
                            ]
                        ],
                        [
                            [
                                [
                                    3.422898,
                                    49.846403
                                ],
                                [
                                    3.422995,
                                    49.846573
                                ],
                                [
                                    3.423328,
                                    49.84646
                                ],
                                [
                                    3.423306,
                                    49.846361
                                ],
                                [
                                    3.422898,
                                    49.846403
                                ]
                            ]
                        ]
                    ]
                }
            ];
            var collection = {
                "type": "GeometryCollection",
                "geometries": [
                    {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    2.42395,
                                    48.846043
                                ],
                                [
                                    2.423714,
                                    48.845711
                                ],
                                [
                                    2.424443,
                                    48.845718
                                ],
                                [
                                    2.42395,
                                    48.846043
                                ]
                            ]
                        ]
                    },
                    {
                        "type": "Point",
                        "coordinates": [
                            2.423746,
                            48.846601
                        ]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [
                            [
                                2.425548,
                                48.846064
                            ],
                            [
                                2.42543,
                                48.845351
                            ]
                        ]
                    },
                    {
                        "type": "Point",
                        "coordinates": [
                            2.424379,
                            48.846862
                        ]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [
                            [
                                2.425345,
                                48.846375
                            ],
                            [
                                2.425302,
                                48.846601
                            ],
                            [
                                2.425752,
                                48.846474
                            ]
                        ]
                    },
                    {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    2.422898,
                                    48.846403
                                ],
                                [
                                    2.422995,
                                    48.846573
                                ],
                                [
                                    2.423328,
                                    48.84646
                                ],
                                [
                                    2.423306,
                                    48.846361
                                ],
                                [
                                    2.422898,
                                    48.846403
                                ]
                            ]
                        ]
                    },
                    {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    3.422898,
                                    49.846403
                                ],
                                [
                                    3.422995,
                                    49.846573
                                ],
                                [
                                    3.423328,
                                    49.84646
                                ],
                                [
                                    3.423306,
                                    49.846361
                                ],
                                [
                                    3.422898,
                                    49.846403
                                ]
                            ]
                        ]
                    }
                ]
            };

            expect(geometriesToCollection(geometries)).toEqual(collection);
            done();
        });

    });



});

