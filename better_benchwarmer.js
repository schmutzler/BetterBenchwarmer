"use strict";

// Utilities and Helper Functions
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}

function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}

function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}

function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}

function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}

// Settings.ts - Add Lamp Support
var BENCH = "Benchwarmer.Bench";
var BIN = "Benchwarmer.Bin";
var LAMP = "Benchwarmer.Lamp";
var QUEUETV = "Benchwarmer.QueueTV";
var BUILD = "Benchwarmer.BuildOnAllSlopedFootpaths";
var PRESERVE = "Benchwarmer.PreserveOtherAdditions";
var AS_YOU_GO = "Benchwarmer.BuildAsYouGo";

var Settings = /*#__PURE__*/ function() {
    function Settings(all) {
        _class_call_check(this, Settings);
        this.benches = all.filter(function(a) {
            return a.identifier.includes("bench");
        });
        this.bins = all.filter(function(a) {
            return a.identifier.includes("litter");
        });
        this.lamps = all.filter(function(a) {
            return a.identifier.includes("lamp");
        });
        this.queuetvs = all.filter(function(a) {
            return a.identifier.includes("qtv");
        });
    }

    _create_class(Settings, [
        {
            key: "bench",
            get: function get() {
                return this.benches[this.selections.bench].index;
            },
            set: function set(index) {
                context.sharedStorage.set(BENCH, index);
            }
        },
        {
            key: "bin",
            get: function get() {
                var _this_bins_this_selections_bin;
                return (_this_bins_this_selections_bin = this.bins[this.selections.bin]) === null || _this_bins_this_selections_bin === void 0 ? void 0 : _this_bins_this_selections_bin.index;
            },
            set: function set(index) {
                context.sharedStorage.set(BIN, index);
            }
        },
        {
            key: "lamp",
            get: function get() {
                var _this_lamps_this_selections_lamp;
                return (_this_lamps_this_selections_lamp = this.lamps[this.selections.lamp]) === null || _this_lamps_this_selections_lamp === void 0 ? void 0 : _this_lamps_this_selections_lamp.index;
            },
            set: function set(index) {
                context.sharedStorage.set(LAMP, index);
            }
        },
        {
            key: "queuetv",
            get: function get() {
                var _this_queuetvs_this_selections_queuetv;
                return (_this_queuetvs_this_selections_queuetv = this.queuetvs[this.selections.queuetv]) === null || _this_queuetvs_this_selections_queuetv === void 0 ? void 0 : _this_queuetvs_this_selections_queuetv.index;
            },
            set: function set(index) {
                context.sharedStorage.set(QUEUETV, index);
            }
        },
        {
            key: "selections",
            get: function get() {
                var bench = context.sharedStorage.get(BENCH, 0);
                var bin = context.sharedStorage.get(BIN, 0);
                var lamp = context.sharedStorage.get(LAMP, 0);
                var queuetv = context.sharedStorage.get(QUEUETV, 0);
                return {
                    bench: bench,
                    bin: bin,
                    lamp: lamp,
                    queuetv: queuetv
                };
            }
        },
        {
            key: "buildBinsOnAllSlopedPaths",
            get: function get() {
                return context.sharedStorage.get(BUILD, false);
            },
            set: function set(value) {
                context.sharedStorage.set(BUILD, value);
            }
        },
        {
            key: "preserveOtherAdditions",
            get: function get() {
                return context.sharedStorage.get(PRESERVE, true);
            },
            set: function set(value) {
                context.sharedStorage.set(PRESERVE, value);
            }
        },
        {
            key: "configured",
            get: function get() {
                return this.bench !== null && this.bin !== null;
            }
        },
        {
            key: "queueTVConfigured",
            get: function get() {
                return this.queuetv !== null;
            }
        },
        {
            key: "asYouGo",
            get: function get() {
                return context.sharedStorage.get(AS_YOU_GO, false);
            },
            set: function set(value) {
                context.sharedStorage.set(AS_YOU_GO, value);
            }
        }
    ]);
    return Settings;
}();

function canBuildAdditionOnPath(surface, path) {
    if (!path || !surface) return false;
    if (surface.isWater) return false;
    if (path.addition != null && plugin.settings.preserveOtherAdditions) return false;
    return true;
}

function ensureHasAddition(x, y, z, object) {
    if (object == null) return;
    var tile = map.getTile(x, y);
    var elements = tile.elements.filter(function (e) {
        return e.type === "footpath" && e.baseZ === z;
    });
    if (elements.length === 0) return;
    var path = elements[0];
    if (path.addition && path.addition.object === object) return;

    var pos = { x: x * 32 + 16, y: y * 32 + 16, z: z };
    if (map.canPlaceFootpathItem && map.placeFootpathItem) {
        if (map.canPlaceFootpathItem(Object.assign({ object: object }, pos)) === 0) {
            map.placeFootpathItem(Object.assign({ object: object }, pos));
        }
    }
}

// Main Logic - Benchwarmer Plugin
function Add(settings) {
    var _loop = function(y2) {
        var _loop = function(x) {
            var elements = map.getTile(x, y2).elements;
            var surface = elements.filter(function(element) {
                return element.type === "surface";
            })[0];
            var footpaths = elements.filter(function(element) {
                return element.type === "footpath";
            });
            footpaths.forEach(function(path) {
                if (canBuildAdditionOnPath(surface, path)) {
                    if (path.isQueue) {
                        paths.queues.push({ path: path, x: x, y: y2 });
                    } else if ((path === null || path === void 0 ? void 0 : path.slopeDirection) === null) {
                        paths.unsloped.push({ path: path, x: x, y: y2 });
                    } else {
                        paths.sloped.push({ path: path, x: x, y: y2 });
                    }
                }
            });
        };
        for(var x = 0; x < map.size.x; x++)_loop(x);
    };
    var paths = {
        unsloped: [],
        sloped: [],
        queues: []
    };
    for(var y2 = 0; y2 < map.size.y; y2++)_loop(y2);

    // Build unsloped paths with alternating benches and bins and lamps
    paths.unsloped.forEach(function(param, index) {
        var path = param.path, x = param.x, y2 = param.y;
        var bench = settings.bench, bin = settings.bin, lamp = settings.lamp;
        var addition;
        
        if (index % 3 === 0) {
            addition = bench; // Every 3rd one is a bench
        } else if (index % 3 === 1) {
            addition = bin; // Every 3rd one after the bench is a bin
        } else {
            addition = lamp; // The rest are lamps
        }

        ensureHasAddition(x, y2, path.baseZ, addition);
    });

    // Build sloped paths with alternating bins and lamps
    paths.sloped.forEach(function(param, index) {
        var path = param.path, x = param.x, y2 = param.y;
        var buildBinsOnAllSlopedPaths = settings.buildBinsOnAllSlopedPaths;
        var addition;
        
        if (buildBinsOnAllSlopedPaths) {
            addition = settings.bin; // If enabled, add bins to sloped paths
        } else {
            addition = index % 2 === 0 ? settings.bin : settings.lamp; // Alternating bins and lamps
        }

        ensureHasAddition(x, y2, path.baseZ, addition);
    });
}

// Plugin Registration using registerPlugin
function main() {
    // Execute the Add function with current settings
    var additions = context.getAllObjects("footpath_addition");
    var settings = new Settings(additions);
    var running = false;
    function runAdd() {
        if (running)
            return;
        running = true;
        Add(settings);
        running = false;
    }
    if (settings.asYouGo) {
        context.subscribe("action.execute", runAdd);
        runAdd();
    } else {
        Add(settings);
    }
}

registerPlugin({
    name: "Better Benchwarmer",
    version: "1.0",
    type: "local",
    authors: ["Your Name"],
    licence: "MIT",
    main: main,
    minApiVersion: 68,
    targetApiVersion: 77
});
