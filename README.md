# BetterBenchwarmer

BetterBenchwarmer extends the original Benchwarmer plugin for OpenRCT2. It automatically adds benches, litter bins and lamps to footpaths and can optionally place queue TVs. Additions follow a repeating lamp–bench–lamp–bin pattern (sloped paths use bins instead of benches). The plugin can run once on demand or keep building as you modify paths.

## Installation

Copy `better_benchwarmer.js` to your OpenRCT2 `plugin` folder and restart the game. The plugin will be available in the in-game plugin list.
The script requires OpenRCT2 with API version 77 or later.

## Configuration

When first loaded the plugin asks which bench, bin, lamp and queue TV objects to use. You can also change these selections later from the plugin menu.
Open the **Better Benchwarmer** entry from the plugin menu to access drop-downs
for selecting the bench, bin, lamp and queue TV objects. The chosen options are
stored so they persist between sessions.
If a three-bulb lamp is available it will be selected automatically the first time the plugin runs.

Available options include:

- **Bench, Bin and Lamp objects** – choose which items to place on paths.
- **Queue TV** – optional queue television for queue lines.
- **Preserve other additions** – skip paths that already have additions when adding benches or bins. This option is enabled by default.
- **Build as you go** – automatically add benches, bins and lamps after each build action rather than running manually.
- **Build All** – apply benches, bins, lamps and queue TVs to every path using the configured pattern.

