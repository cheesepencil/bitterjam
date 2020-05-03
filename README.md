# bitterjam
An entry for Bitter Jam https://itch.io/jam/bitter-jam

Generates mazes using an inefficient and hurried implementation of the hunt and kill algorithm.

Bitter Jam requires the use of a single sprite sheet, provided by the hosts of the jam. The rest of the rules seem to change frequently and I'll ignore the most inconvenient ones.

## Working With the Source

`npm start` will build the project and serve it locally, with live reload and all that fun stuff.

`npm run build` will build and ideally minify the project for distribution and put the files in the `dist` directory. Helpful tip: delete the `.cache` and `dist` folders first.

Built with [Phaser](https://phaser.io), [TypeScript](https://www.typescriptlang.org/), and bundled with [Parcel](https://parceljs.org/).

Ostensibly licensed under [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html). 

## Design Notes, Scope, and BrainStorming

Smallest scope:
* Generate a maze, move character from start point to end point. Win when you get to the end.

Medium scope:
* Multiple mazes with increasing difficulty
* A timer

Moonshot:
* Multiple mazes with increasing difficulty.
* A timer
* Color themed mazes
* Collectibles in the maze
* Baddies in the maze
