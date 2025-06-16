"use strict";

// Plugin metadata
var VERSION = "1.2.0";
var AUTHOR = "Devun Schmutzler";
var LICENSE = "MIT";

var nextIndex = 0;
var lastAddition = null;

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

function canBuildAdditionOnPath(surface, path, settings) {
    if (!path || !surface) return false;
    if (surface.isWater) return false;
    if (path.addition != null && settings.preserveOtherAdditions) return false;
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

    context.executeAction("footpathadditionplace", {
        x: x * 32,
        y: y * 32,
        z: z,
        object: object
    }, function (result) {
        var errorTitle = result.errorTitle, errorMessage = result.errorMessage;
        if (errorMessage)
            throw new Error(errorTitle + ": " + errorMessage);
    });
}
function getNextAddition(isSlope, settings) {
    var pattern = [settings.bench, settings.bin, settings.lamp];
    var attempts = 0;
    var addition;
    while (attempts < 3) {
        addition = pattern[nextIndex];
        nextIndex = (nextIndex + 1) % pattern.length;
        if (isSlope && addition === settings.bench) {
            attempts++;
            continue;
        }
        if (addition === lastAddition) {
            attempts++;
            continue;
        }
        break;
    }
    lastAddition = addition;
    return addition;
}


// Main Logic - Benchwarmer Plugin
function Add(settings) {
    var paths = [];
    var queues = [];
    for (var y2 = 0; y2 < map.size.y; y2++) {
        for (var x = 0; x < map.size.x; x++) {
            var elements = map.getTile(x, y2).elements;
            var surface = elements.filter(function (e) { return e.type === "surface"; })[0];
            var footpaths = elements.filter(function (e) { return e.type === "footpath"; });
            footpaths.forEach(function (path) {
                if (canBuildAdditionOnPath(surface, path, settings)) {
                    if (path.isQueue) {
                        queues.push({ path: path, x: x, y: y2 });
                    } else {
                        paths.push({ path: path, x: x, y: y2, slope: path.slopeDirection !== null });
                    }
                }
            });
        }
    }

    paths.forEach(function (p) {
        var addition = getNextAddition(p.slope, settings);
        ensureHasAddition(p.x, p.y, p.path.baseZ, addition);
    });

    queues.forEach(function (p) {
        ensureHasAddition(p.x, p.y, p.path.baseZ, settings.queuetv);
    });
}

// Plugin Registration using registerPlugin
function main() {
    // Execute the Add function with current settings
    var additions = context.getAllObjects("footpath_addition");
    var settings = new Settings(additions);
    function openMenu() {
        var window = ui.getWindow("better-benchwarmer.window");
        if (window) {
            window.bringToFront();
            return;
        }

        var benchItems = settings.benches.map(function (o) { return o.name; });
        var binItems = settings.bins.map(function (o) { return o.name; });
        var lampItems = settings.lamps.map(function (o) { return o.name; });
        var tvItems = settings.queuetvs.map(function (o) { return o.name; });

        ui.openWindow({
            classification: "better-benchwarmer.window",
            title: "Better Benchwarmer",
            width: 200,
            height: 155,
            widgets: [
                { type: "label", x: 10, y: 20, width: 70, height: 12, text: "Bench" },
                {
                    type: "dropdown",
                    x: 80,
                    y: 15,
                    width: 110,
                    height: 12,
                    items: benchItems,
                    selectedIndex: settings.selections.bench,
                    onChange: function(index) { settings.bench = index; }
                },
                { type: "label", x: 10, y: 40, width: 70, height: 12, text: "Bin" },
                {
                    type: "dropdown",
                    x: 80,
                    y: 35,
                    width: 110,
                    height: 12,
                    items: binItems,
                    selectedIndex: settings.selections.bin,
                    onChange: function(index) { settings.bin = index; }
                },
                { type: "label", x: 10, y: 60, width: 70, height: 12, text: "Lamp" },
                {
                    type: "dropdown",
                    x: 80,
                    y: 55,
                    width: 110,
                    height: 12,
                    items: lampItems,
                    selectedIndex: settings.selections.lamp,
                    onChange: function(index) { settings.lamp = index; }
                },
                { type: "label", x: 10, y: 80, width: 70, height: 12, text: "Queue TV" },
                {
                    type: "dropdown",
                    x: 80,
                    y: 75,
                    width: 110,
                    height: 12,
                    items: tvItems,
                    selectedIndex: settings.selections.queuetv,
                    onChange: function(index) { settings.queuetv = index; }
                },
                {
                    type: "checkbox",
                    x: 10,
                    y: 100,
                    width: 180,
                    height: 12,
                    text: "Preserve other additions",
                    isChecked: settings.preserveOtherAdditions,
                    onChange: function(checked) { settings.preserveOtherAdditions = checked; }
                },
                {
                    type: "checkbox",
                    x: 10,
                    y: 115,
                    width: 180,
                    height: 12,
                    text: "Build as you go",
                    isChecked: settings.asYouGo,
                    onChange: function(checked) { settings.asYouGo = checked; }
                },
                {
                    type: "button",
                    text: "Build All",
                    x: 10,
                    y: 135,
                    width: 180,
                    height: 12,
                    onClick: buildAll
                }
            ]
        });
    }
    function buildAll() {
        Add(settings);
    }

    context.subscribe("action.execute", function(event) {
        var action = event.action, args = event.args, isClientOnly = event.isClientOnly;
        if (action === "footpathplace" && settings.asYouGo && !isClientOnly) {
            var x = args.x, y2 = args.y, z = args.z, slope = args.slope, constructFlags = args.constructFlags;
            var addition;
            if (constructFlags === 1) {
                addition = settings.queuetv;
            } else {
                addition = getNextAddition(!!slope, settings);
            }
            ensureHasAddition(x / 32, y2 / 32, z, addition);
        }
    });

    if (!settings.asYouGo) {
        buildAll();
    }

    ui.registerMenuItem("Better Benchwarmer", openMenu);
}

registerPlugin({
    name: "Better Benchwarmer",
    version: VERSION,
    type: "local",
    authors: [AUTHOR],
    licence: LICENSE,
    main: main,
    minApiVersion: 68,
    targetApiVersion: 77
});
