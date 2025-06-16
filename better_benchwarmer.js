"use strict";

// Plugin metadata
var version = "1.2.0";
var author = "Devun Schmutzler";
var license = "MIT";

// placement sequence state
var sequence = ["lamp", "bench", "lamp", "bin"];
var nextIndex = 0;
var lastPlaced = null;

function getNextAddition(settings, isSlope) {
    var item = sequence[nextIndex];

    if (isSlope && item === "bench") {
        // skip bench on slopes
        var next = (nextIndex + 1) % sequence.length;
        item = sequence[next];
        // avoid repeating the previous item
        if (item === lastPlaced) {
            next = (next + 1) % sequence.length;
            item = sequence[next];
        }
        nextIndex = (next + 1) % sequence.length;
    } else {
        nextIndex = (nextIndex + 1) % sequence.length;
    }

    lastPlaced = item;
    switch (item) {
        case "lamp":
            return settings.lamp;
        case "bench":
            return settings.bench;
        default:
            return settings.bin;
    }
}

// add.ts
function Add(settings) {
    nextIndex = 0;
    lastPlaced = null;
    for (var y = 0; y < map.size.y; y++) {
        for (var x = 0; x < map.size.x; x++) {
            var elements = map.getTile(x, y).elements;
            var surface = elements.filter(function (e) { return e.type === "surface"; })[0];
            var footpaths = elements.filter(function (e) { return e.type === "footpath"; });
            footpaths.forEach(function (path) {
                if (!canBuildAdditionOnPath(surface, path, settings))
                    return;
                if (path.isQueue) {
                    ensureHasAddition(x, y, path.baseZ, settings.queuetv);
                } else {
                    var isSlope = path.slopeDirection !== null;
                    var addition = getNextAddition(settings, isSlope);
                    ensureHasAddition(x, y, path.baseZ, addition);
                }
            });
        }
    }
}

function ensureHasAddition(x, y, z, addition) {
    context.executeAction("footpathadditionplace", {
        x: x * 32,
        y: y * 32,
        z: z,
        object: addition
    }, function(result) {
        var errorTitle = result.errorTitle, errorMessage = result.errorMessage;
        if (errorMessage) throw new Error(errorTitle + ": " + errorMessage);
    });
}

function canBuildAdditionOnPath(surface, path, settings) {
    if (!surface || !path) return false;
    if (settings.preserveOtherAdditions && path.addition !== null) return false;
    if (surface.hasOwnership) return true;
    if (surface.hasConstructionRights && surface.baseHeight !== path.baseHeight) {
        return true;
    }
    return false;
}

// settings.ts
var BENCH = "Benchwarmer.Bench";
var BIN = "Benchwarmer.Bin";
var QUEUETV = "Benchwarmer.QueueTV";
var PRESERVE = "Benchwarmer.PreserveOtherAdditions";
var AS_YOU_GO = "Benchwarmer.BuildAsYouGo";
var LAMP = "Benchwarmer.Lamp";

var Settings = function(all) {
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
};

Settings.prototype = {
    get bench() {
        return this.benches[this.selections.bench].index;
    },
    set bench(index) {
        context.sharedStorage.set(BENCH, index);
    },
    get bin() {
        var _a = this.bins[this.selections.bin];
        return _a && _a.index;
    },
    set bin(index) {
        context.sharedStorage.set(BIN, index);
    },
    get lamp() {
        var _a = this.lamps[this.selections.lamp];
        return _a && _a.index;
    },
    set lamp(index) {
        context.sharedStorage.set(LAMP, index);
    },
    get queuetv() {
        var _a = this.queuetvs[this.selections.queuetv];
        return _a && _a.index;
    },
    set queuetv(index) {
        context.sharedStorage.set(QUEUETV, index);
    },
    get selections() {
        var bench = context.sharedStorage.get(BENCH, 0);
        var bin = context.sharedStorage.get(BIN, 0);
        var lamp = context.sharedStorage.get(LAMP, 0);
        var queuetv = context.sharedStorage.get(QUEUETV, 0);
        return { bench: bench, bin: bin, lamp: lamp, queuetv: queuetv };
    },
    get preserveOtherAdditions() {
        return context.sharedStorage.get(PRESERVE, true);
    },
    set preserveOtherAdditions(value) {
        context.sharedStorage.set(PRESERVE, value);
    },
    get configured() {
        return this.bench !== null && this.bin !== null && this.lamp !== null;
    },
    get queueTVConfigured() {
        return this.queuetv !== null;
    },
    get asYouGo() {
        return context.sharedStorage.get(AS_YOU_GO, false);
    },
    set asYouGo(value) {
        context.sharedStorage.set(AS_YOU_GO, value);
    }
};

// ui.ts
var LABEL_X = 10;
var INPUT_X = 70;
var y = 0;

function Document() {
    y = 0;
    return Array.prototype.slice.call(arguments);
}

function Dropdown(text, choices, selectedIndex, onChange) {
    var items = choices.map(function(b) {
        return b.name + " " + b.identifier;
    });
    y += 20;
    return [
        { type: "label", x: LABEL_X, y: y, width: 60, height: 10, text: text },
        { type: "dropdown", x: INPUT_X, y: y, width: 200, height: 10, items: items, selectedIndex: selectedIndex, onChange: onChange }
    ];
}

function Checkbox(text, isChecked, onChange) {
    y += 15;
    return { type: "checkbox", x: LABEL_X, y: y, width: 200, height: 15, isChecked: isChecked, text: text, onChange: onChange };
}

function Button(text, onClick) {
    y += 20;
    return { type: "button", text: text, x: 10, y: y, width: 100, height: 20, onClick: onClick };
}

// benchwarmer.ts
var name = "Benchwarmer";
function main() {
    var additions = context.getAllObjects("footpath_addition");
    var settings = new Settings(additions);
    ui.registerMenuItem(name, function() {
        var window = ui.openWindow({
            title: name,
            id: 1,
            classification: name,
            width: 300,
            height: 180,
            widgets: Document.apply(null, [].concat(
                Dropdown("Bench:", settings.benches, settings.selections.bench, function(index) { settings.bench = index; }),
                Dropdown("Bin:", settings.bins, settings.selections.bin, function(index) { settings.bin = index; }),
                Dropdown("Lamp:", settings.lamps, settings.selections.lamp, function(index) { settings.lamp = index; }),
                Dropdown("Queue TV:", settings.queuetvs, settings.selections.queuetv, function(index) { settings.queuetv = index; }),
                [
                    Checkbox("Preserve other additions (e.g. lamps)", settings.preserveOtherAdditions, function(checked) { settings.preserveOtherAdditions = checked; }),
                    Checkbox("Add benches and bins as paths are placed", settings.asYouGo, function(checked) { settings.asYouGo = checked; }),
                    Button("Build on All Paths", function() {
                        if (settings.configured) {
                            try {
                                Add(settings);
                            } catch (e) {
                                ui.showError("Error Building Benches/Bins", e.message);
                            }
                        }
                        window.close();
                    })
                ]
            ))
        });
    });
    context.subscribe("action.execute", function(param) {
        var action = param.action, args = param.args, isClientOnly = param.isClientOnly;
        if (action === "footpathplace" && settings.asYouGo && !isClientOnly) {
            var x = args.x, y = args.y, z = args.z, slope = args.slope, constructFlags = args.constructFlags;
            var addition;
            if (constructFlags === 1) {
                addition = settings.queuetv;
            } else {
                addition = getNextAddition(settings, slope);
            }
            context.executeAction("footpathadditionplace", {
                x: x,
                y: y,
                z: z,
                object: addition
            }, function(result) {
                var errorTitle = result.errorTitle, errorMessage = result.errorMessage;
                if (errorMessage) throw new Error(errorTitle + ": " + errorMessage);
            });
        }
    });
}

registerPlugin({
    name: name,
    version: version,
    licence: license,
    authors: [author],
    type: "local",
    main: main,
    minApiVersion: 68,
    targetApiVersion: 77
});
