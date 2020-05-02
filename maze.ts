export class Maze {
    width: number;
    height: number;
    dungeon: boolean[][] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        // set up all walls
        let horizWalls = [];
        for (let i = 0; i < this.width; i++) {
            horizWalls[i] = [];
            for (let j = 0; j < this.height; j++) {
                horizWalls[i][j] = true;
            }
        }
        let vertWalls = [];
        for (let i = 0; i < this.width; i++) {
            vertWalls[i] = [];
            for (let j = 0; j < this.height; j++) {
                vertWalls[i][j] = true;
            }
        }

        // the cells
        let visitedCells = [];
        for (let i = 0; i < this.width; i++) {
            visitedCells[i] = [];
            for (let j = 0; j < this.height; j++) {
                visitedCells[i][j] = false;
            }
        }

        // cell cursor (x, y)
        let here = new Phaser.Geom.Point(0, 0);
        let walking = true;
        while (walking) {
            visitedCells[here.x][here.y] = true;

            let adjacentCells = [
                new Phaser.Geom.Point(here.x + 1, here.y),
                new Phaser.Geom.Point(here.x - 1, here.y),
                new Phaser.Geom.Point(here.x, here.y + 1),
                new Phaser.Geom.Point(here.x, here.y - 1),
            ];

            let legalAdjacentCells = adjacentCells.filter((c) => {
                return c.x >= 0
                    && c.x < this.width
                    && c.y >= 0
                    && c.y < this.height
                    && visitedCells[c.x][c.y] === false
            });

            console.log(legalAdjacentCells.length);
            if (legalAdjacentCells.length === 0) {
                console.log('That should be the end of that...');
                walking = false;
                continue;
                console.log('...but was it?');
            }

            let nextCell = legalAdjacentCells[Phaser.Math.Between(0, legalAdjacentCells.length - 1)];
            visitedCells[nextCell.x][nextCell.y] = true;

            // // determine which wall to break?
            // // if x values unequal, vertical wall
            // // if y values unequal, horizontal wall
            if (here.x === nextCell.x) {
                // break horizontal wall
                // ok which wall?
                if (here.y > nextCell.y) {
                    // break horiz wall above
                    horizWalls[here.x][here.y - 1] = false;
                } else {
                    // break horiz wall below
                    horizWalls[here.x][here.y] = false;
                }
            } else {
                // break vertical wall
                if (here.x > nextCell.x) {
                    vertWalls[here.x - 1][here.y] = false;
                } else {
                    vertWalls[here.x][here.y] = false;
                }
            }

            here = nextCell;
        }

        // // walk
        // // - determine nearest unvisited, legal cells
        // // - pick a legal cell at random
        // // - break the wall to get there
        // // - go hunting if no legal cell

        // // list of horizontal walls
        // let horiz = [];
        // for (let i = 0; i < this.width + 1; i++) horiz[i] = [];

        // // list of vertical walls
        // let vert = [];
        // for (let i = 0; i < this.height + 1; i++) vert[i] = [];

        // output
        for (let i = 0; i < (this.width * 2) + 1; i++) {
            this.dungeon[i] = [];
            for (let j = 0; j < (this.height * 2) + 1; j++) {
                // outside walls will always be solid
                if (i === 0 || i === this.width * 2 || j === 0 || j === this.height * 2) {
                    this.dungeon[i][j] = true;
                }
                // if it's a corner it will always be solid
                else if (j % 2 === 0 && i % 2 === 0) {
                    this.dungeon[i][j] = true;
                }
                else if (j % 2 === 0) {
                    let ii = (i - 1) / 2;
                    let jj = (j / 2) - 1;
                    this.dungeon[i][j] = horizWalls[ii][jj];
                }
                else if (i % 2 === 0) {
                    let ii = (i / 2) - 1;
                    let jj = (j - 1) / 2;
                    console.log(`${ii}`);
                    this.dungeon[i][j] = vertWalls[ii][jj];
                }
            }
        }
    }
}
