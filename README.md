# BetterBenchwarmer

BetterBenchwarmer extends the original Benchwarmer plugin for OpenRCT2. It automatically adds benches, litter bins and lamps to footpaths and can optionally place queue TVs. The plugin can run once on demand or keep building as you modify paths.

## Installation

Copy `better_benchwarmer.js` to your OpenRCT2 `plugin` folder and restart the game. The plugin will be available in the in-game plugin list.

## Configuration

When first loaded the plugin asks which bench, bin, lamp and queue TV objects to use. You can also change these selections later from the plugin menu.

Available options include:

- **Bench, Bin and Lamp objects** – choose which items to place on paths.
- **Queue TV** – optional queue television for queue lines.
- **Build bins on all sloped paths** – if enabled, bins are placed on sloped sections of path instead of alternating with lamps.
- **Preserve other additions** – skip paths that already have additions when adding benches or bins.
- **Build as you go** – automatically add benches, bins and lamps after each build action rather than running manually.

