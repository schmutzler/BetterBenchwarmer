"use strict";

// Plugin metadata
var version = "1.2.0";
var author = "Devun Schmutzler";
var license = "MIT";

// add.ts
function Add(settings) {
    var paths = {
        unsloped: [],
        sloped: [],
        queues: []
    };

    for (var y = 0; y < map.size.y; y++) {
        for (var x = 0; x < map.size.x; x++) {
            var elements = map.getTile(x, y).elements;
            var surface = elements.filter(function(element) {
                return element.type === "surface";
            })[0];
            var footpaths = elements.filter(function(element) {
                return element.type === "footpath";
            });
            footpaths.forEach(function(path) {
                if (canBuildAdditionOnPath(surface, path)) {
                    if (path.isQueue) {
                        paths.queues.push({ path: path, x: x, y: y });
                    } else if (path.slopeDirection === null) {
                        paths.unsloped.push({ path: path, x: x, y: y });
                    } else {
                        paths.sloped.push({ path: path, x: x, y: y });
                    }
                }
            });
        }
    }

    paths.unsloped.forEach(function(param) {
        var path = param.path, x = param.x, y = param.y;
        var bench = settings.bench, bin = settings.bin;
        var addition = findAddition(bench, bin, x, y);
        ensureHasAddition(x, y, path.baseZ, addition);
    });

    paths.sloped.forEach(function(param) {
        var path = param.path, x = param.x, y = param.y;
        var buildBinsOnAllSlopedPaths = settings.buildBinsOnAllSlopedPaths;
        var evenTile = x % 2 === y % 2;
        var buildOnSlopedPath = buildBinsOnAllSlopedPaths || evenTile;
        if (buildOnSlopedPath) {
            ensureHasAddition(x, y, path.baseZ, settings.bin);
        }
    });

    paths.queues.forEach(function(param) {
        var path = param.path, x = param.x, y = param.y;
        ensureHasAddition(x, y, path.baseZ, settings.queuetv);
    });

    return paths;
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

function findAddition(bench, bin, x, y) {
    if (x % 2 === y % 2) {
        return bench;
    } else {
        return bin;
    }
}

function canBuildAdditionOnPath(surface, path) {
    if (!surface || !path) return false;
    if (path.addition !== null) return false;
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
var BUILD = "Benchwarmer.BuildOnAllSlopedFootpaths";
var PRESERVE = "Benchwarmer.PreserveOtherAdditions";
var AS_YOU_GO = "Benchwarmer.BuildAsYouGo";

var Settings = function(all) {
    this.benches = all.filter(function(a) {
        return a.identifier.includes("bench");
    });
    this.bins = all.filter(function(a) {
        return a.identifier.includes("litter");
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
        var queuetv = context.sharedStorage.get(QUEUETV, 0);
        return { bench: bench, bin: bin, queuetv: queuetv };
    },
    get buildBinsOnAllSlopedPaths() {
        return context.sharedStorage.get(BUILD, false);
    },
    set buildBinsOnAllSlopedPaths(value) {
        context.sharedStorage.set(BUILD, value);
    },
    get preserveOtherAdditions() {
        return context.sharedStorage.get(PRESERVE, true);
    },
    set preserveOtherAdditions(value) {
        context.sharedStorage.set(PRESERVE, value);
    },
    get configured() {
        return this.bench !== null && this.bin !== null;
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
            height: 160,
            widgets: Document.apply(null, [].concat(
                Dropdown("Bench:", settings.benches, settings.selections.bench, function(index) { settings.bench = index; }),
                Dropdown("Bin:", settings.bins, settings.selections.bin, function(index) { settings.bin = index; }),
                Dropdown("Queue TV:", settings.queuetvs, settings.selections.queuetv, function(index) { settings.queuetv = index; }),
                [
                    Checkbox("Build bins on all sloped footpaths", settings.buildBinsOnAllSlopedPaths, function(checked) { settings.buildBinsOnAllSlopedPaths = checked; }),
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
            var addition = settings.bin;
            if (constructFlags === 1) {
                addition = settings.queuetv;
            } else {
                addition = slope ? settings.bin : findAddition(settings.bench, settings.bin, x / 32, y / 32);
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
