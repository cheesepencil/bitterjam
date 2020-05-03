export class Maze {
    randomizer: Phaser.Math.RandomDataGenerator;
    width: number;
    height: number;
    blockWidth: number;
    blockHeight: number;
    pixelWidth: number;
    pixelHeight: number;
    dungeon: boolean[][] = [];

    constructor(width: number, height: number, randomizer: Phaser.Math.RandomDataGenerator) {
        this.width = width;
        this.height = height;
        this.randomizer = randomizer;
        
        // set up all walls
        let horizWalls: boolean[][] = [];
        for (let i = 0; i < this.width; i++) {
            horizWalls[i] = [];
            for (let j = 0; j < this.height; j++) {
                horizWalls[i][j] = true;
            }
        }
        let vertWalls: boolean[][] = [];
        for (let i = 0; i < this.width; i++) {
            vertWalls[i] = [];
            for (let j = 0; j < this.height; j++) {
                vertWalls[i][j] = true;
            }
        }

        // the cells
        let visitedCells: boolean[][] = [];
        for (let i = 0; i < this.width; i++) {
            visitedCells[i] = [];
            for (let j = 0; j < this.height; j++) {
                visitedCells[i][j] = false;
            }
        }

        // cell cursor (x, y)
        let here = new Phaser.Geom.Point(0, 0);
        while (here) {
            this.walk(here, visitedCells, horizWalls, vertWalls);
            here = this.hunt(visitedCells, horizWalls, vertWalls);
        }

        // output
        this.blockWidth = (this.width * 2) + 1;
        this.pixelWidth = this.blockWidth * 8;
        this.blockHeight = (this.height * 2) + 1;
        this.pixelHeight = this.blockHeight * 8;
        for (let i = 0; i < this.blockWidth; i++) {
            this.dungeon[i] = [];
            for (let j = 0; j < this.blockHeight; j++) {
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
                    this.dungeon[i][j] = vertWalls[ii][jj];
                }
            }
        }
    }

    walk(here: Phaser.Geom.Point, visitedCells: boolean[][], horizWalls: boolean[][], vertWalls: boolean[][]) {
        let walking = true;
        while (walking) {
            visitedCells[here.x][here.y] = true;

            let adjacentCells = this.getAdjacentCells(here, visitedCells);

            let legalAdjacentCells = adjacentCells.filter((c) => {
                return c.x >= 0
                    && c.x < this.width
                    && c.y >= 0
                    && c.y < this.height
                    && visitedCells[c.x][c.y] === false
            });

            if (legalAdjacentCells.length === 0) {
                walking = false;
                continue;
            }

            let nextCell = legalAdjacentCells[this.randomizer.between(0, legalAdjacentCells.length - 1)];
            visitedCells[nextCell.x][nextCell.y] = true;

            this.breakWall(here, nextCell, horizWalls, vertWalls);

            here = nextCell;
        }
    }

    hunt(visitedCells: boolean[][], horizWalls: boolean[][], vertWalls: boolean[][]): Phaser.Geom.Point {
        let result: Phaser.Geom.Point = undefined;

        // We're looking for the first available unvisited cell with at least one
        // visited neighbor. That will become the new starting place for walking.
        myLoop:
        for (let i = 0; i < visitedCells.length; i++) {
            for (let j = 0; j < visitedCells[i].length; j++) {
                // test if i,j is unvisited
                if (visitedCells[i][j] === false) {
                    let newHere = new Phaser.Geom.Point(i, j);
                    // if unvisited, test if i,j has visited neighbors
                    let visitedNeighbors = this.getVisitedNeighbors(newHere, visitedCells);
                    // no visited neighbors, keep looking
                    if (visitedNeighbors.length === 0) continue;
                    // if we made it this far, this is the new starting point for walking
                    result = newHere;
                    // pick a visited neighbor and break the wall to it
                    let randomVisitedNeighbor = visitedNeighbors[this.randomizer.between(0, visitedNeighbors.length - 1)];
                    this.breakWall(newHere, randomVisitedNeighbor, horizWalls, vertWalls);
                    // set i, j as visited
                    visitedCells[newHere.x][newHere.y] = true;
                    // return point i,j to use as the new here
                    return newHere;
                }
            }
        }

        return result;
    }

    getAdjacentCells(point: Phaser.Geom.Point, visitedCells: boolean[][]): Phaser.Geom.Point[] {
        // get neighbors
        let adjacentCells = [
            new Phaser.Geom.Point(point.x + 1, point.y),
            new Phaser.Geom.Point(point.x - 1, point.y),
            new Phaser.Geom.Point(point.x, point.y + 1),
            new Phaser.Geom.Point(point.x, point.y - 1),
        ];

        // only neighbors in bounds
        return adjacentCells.filter((c) => {
            return c.x >= 0
                && c.x < this.width
                && c.y >= 0
                && c.y < this.height;
        });
    }

    getVisitedNeighbors(point: Phaser.Geom.Point, visitedCells: boolean[][]): Phaser.Geom.Point[] {
        return this.getAdjacentCells(point, visitedCells).filter((c) => {
            return visitedCells[c.x][c.y] === true;
        })
    }

    getUnvisitedNeighbors(point: Phaser.Geom.Point, visitedCells: boolean[][]): Phaser.Geom.Point[] {
        return this.getAdjacentCells(point, visitedCells).filter((c) => {
            return visitedCells[c.x][c.y] === false;
        })
    }

    breakWall(cell: Phaser.Geom.Point, neighbor: Phaser.Geom.Point, horizWalls: boolean[][], vertWalls: boolean[][]) {
        // // determine which wall to break?
        // // if x values unequal, vertical wall
        // // if y values unequal, horizontal wall
        if (cell.x === neighbor.x) {
            // break horizontal wall
            // ok which wall?
            if (cell.y > neighbor.y) {
                // break horiz wall above
                horizWalls[cell.x][cell.y - 1] = false;
            } else {
                // break horiz wall below
                horizWalls[cell.x][cell.y] = false;
            }
        } else {
            // break vertical wall
            if (cell.x > neighbor.x) {
                vertWalls[cell.x - 1][cell.y] = false;
            } else {
                vertWalls[cell.x][cell.y] = false;
            }
        }
    }
}
