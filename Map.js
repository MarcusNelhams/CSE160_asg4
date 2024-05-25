class Map {
    constructor(cols=32, rows=32, hieghts=3, init=1) {
        this.cols = cols;
        this.rows = rows;
        this.hieghts = hieghts;

        this.map = [];
        for (let i = 0; i < this.rows; i++) {
            this.map[i] = []
            for (let j = 0; j < this.cols; j++) {
                this.map[i][j] = [];
                for (let k = 0; k < this.hieghts; k++) {
                    this.map[i][j][k] = init;
                }
            }
        }
    }

    drawMap() {
        let wall = new Cube(undefined, [1.0, 1.0, 1.0, 1.0], 0);
        for (var x = 0; x < this.cols; x++) {
            for (var z = 0; z < this.rows; z++) {
                for (var y = 0; y < this.hieghts; y++) {
                    if (this.map[x][z][y] == 1) {
                        wall.matrix.setTranslate(x-(this.rows/2), y-.75, z-(this.cols/2));
                        wall.render();
                    }
                }
            }
        }
    }

    breakBlock() {
        var forward_v = new Vector3().set(g_camera.at);
        forward_v.sub(g_camera.eye);
        forward_v.normalize();

        let [x, h, z] = g_camera.at.elements;
        x = Math.floor(x) + 16;
        z = Math.floor(z) + 16;
        h = Math.floor(h) + 1;

        if (x >= 0 && z >= 0 && h >= 0 && this.map[x][z][h] == 1) {
            this.map[x][z][h] = 0;
        }
    }

    placeBlock() {
        var forward_v = new Vector3().set(g_camera.at);
        forward_v.sub(g_camera.eye);
        forward_v.normalize();

        let [x, h, z] = g_camera.at.elements;
        x = Math.floor(x) + 16;
        z = Math.floor(z) + 16;
        h = Math.floor(h) + 1;

        if (x >= 0 && z >= 0 && h >= 0 && this.map[x][z][h] == 0) {
            this.map[x][z][h] = 1;
        }
    }

    generateMap() {
        // map needs to be odd x odd (prefer smaller over larger)
        this.rows = 2 * Math.floor(this.rows / 2) + 1;   // Make width odd
        this.cols = 2 * Math.floor(this.cols / 2) + 1; // Make height odd

        this.map = [];
        for (let i = 0; i < this.rows; i++) {
            this.map[i] = []
            for (let j = 0; j < this.cols; j++) {
                this.map[i][j] = [];
                for (let k = 0; k < this.hieghts; k++) {
                    this.map[i][j][k] = 1;
                }
            }
        }

        // outer walls
        /**
        for (let i = 0; i < this.rows; i++) {
            this.map[0][i][0] = 1;
            this.map[0][i][1] = 1;
            this.map[0][i][2] = 1;
            this.map[this.cols - 1][i][0] = 1;
            this.map[this.cols - 1][i][1] = 1;
            this.map[this.cols - 1][i][2] = 1;
        }
        for (let i = 0; i < this.cols; i++) {
            this.map[i][0][0] = 1;
            this.map[i][0][1] = 1;
            this.map[i][0][2] = 1;
            this.map[i][this.rows - 1][0] = 1;
            this.map[i][this.rows - 1][1] = 1;
            this.map[i][this.rows - 1][2] = 1;
        }
        */

        // define what is a wall block and what is a path block
        let unvisited_cells = [];
        let visited_cells = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (i % 2 == 0 && j % 2 == 0) { 
                    unvisited_cells.push([i, j]);
                }
            }
        }

        // get random cell from unv, push to visited, and set to wall
        let [x_curr, y_curr] = unvisited_cells.splice(Math.floor(Math.random() * unvisited_cells.length), 1)[0];
        this.map[x_curr][y_curr][0] = 0;
        this.map[x_curr][y_curr][1] = 0;
        this.map[x_curr][y_curr][2] = 0;
        visited_cells.push([x_curr, y_curr])

        let path = {}
        while ((unvisited_cells.length) > 0) {
            let start_cell = unvisited_cells.splice(Math.floor(Math.random() * unvisited_cells.length), 1)[0];
            let curr = start_cell;
            while (true) {
                let dir = Math.floor(Math.random() * 4);
                while (!this.isValidDirection(curr, dir)) {
                    dir = Math.floor(Math.random() * 4);
                }
                path[curr] = dir;

                curr = this.getNextCell(curr, dir, 2);
                if (this.curr_visited(curr, visited_cells)) {
                    //console.log(path)
                    break;
                }
            }

            curr = start_cell;
            while (true) {
                visited_cells.push(curr);
                unvisited_cells = unvisited_cells.filter(cell => !(cell[0] === curr[0] && cell[1] === curr[1]));
                this.map[curr[0]][curr[1]][0] = 0;
                this.map[curr[0]][curr[1]][1] = 0;
                this.map[curr[0]][curr[1]][2] = 0;
                let dirNum = path[curr];
                // console.log(dirNum)
                let sep = this.getNextCell(curr, dirNum, 1);
                this.map[sep[0]][sep[1]][0] = 0;
                this.map[sep[0]][sep[1]][1] = 0;
                this.map[sep[0]][sep[1]][2] = 0;

                curr = this.getNextCell(curr, dirNum, 2);
                if (this.curr_visited(curr, visited_cells)) {
                    path = {}
                    break;
                }
            }
        }
    }

    getNextCell(cell, ind, steps) {
        let dirs = [[0,1], [1,0], [0,-1], [-1,0]];
        let dir = dirs[ind];
        let x = cell[0]+steps*dir[0];
        let y = cell[1]+steps*dir[1];
        let ret = [x, y];
        return ret;
    }

    isValidDirection(cell, dir) {
        let check = this.getNextCell(cell, dir, 2);
        return (
            check[0] >= 0 && check[0] < this.cols
            && check[1] >= 0 && check[1] < this.rows
        )
    }

    curr_visited(curr, cells) {
        for (let cell of cells) {
            if (curr[0] == cell[0] && curr[1] == cell[1]) {
                return true;
            }
        }
        return false;
    }
}