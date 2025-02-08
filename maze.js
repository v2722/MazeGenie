class Cell {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.isWall = false;
      this.isStart = false;
      this.isEnd = false;
      this.isPath = false;
      this.isVisited = false;
      this.f = 0;
      this.g = 0;
      this.h = 0;
      this.parent = null;
      this.element = document.createElement('div');
      this.element.className = 'cell';
      this.element.addEventListener('click', () => this.toggleWall());
    }
  
    toggleWall() {
      if (this.isStart || this.isEnd || MazeSolver.isRunning) return;
      this.isWall = !this.isWall;
      this.updateAppearance();
    }
  
    updateAppearance() {
      this.element.className = 'cell';
      if (this.isWall) this.element.classList.add('wall');
      if (this.isStart) this.element.classList.add('start');
      if (this.isEnd) this.element.classList.add('end');
      if (this.isPath) this.element.classList.add('path');
      else if (this.isVisited) this.element.classList.add('visited');
    }
  
    reset() {
      this.isWall = false;
      this.isPath = false;
      this.isVisited = false;
      this.f = 0;
      this.g = 0;
      this.h = 0;
      this.parent = null;
      this.updateAppearance();
    }
  }
  
  class MazeSolver {
    static GRID_SIZE = 20;
    static isRunning = false;
  
    constructor() {
      this.grid = [];
      this.setupGrid();
      this.setupControls();
    }
  
    setupGrid() {
      const gridElement = document.getElementById('grid');
      gridElement.style.gridTemplateColumns = `repeat(${MazeSolver.GRID_SIZE}, 1fr)`;
  
      for (let i = 0; i < MazeSolver.GRID_SIZE; i++) {
        const row = [];
        for (let j = 0; j < MazeSolver.GRID_SIZE; j++) {
          const cell = new Cell(i, j);
          if (i === 0 && j === 0) {
            cell.isStart = true;
          }
          if (i === MazeSolver.GRID_SIZE - 1 && j === MazeSolver.GRID_SIZE - 1) {
            cell.isEnd = true;
          }
          cell.updateAppearance();
          gridElement.appendChild(cell.element);
          row.push(cell);
        }
        this.grid.push(row);
      }
    }
  
    setupControls() {
      document.getElementById('startBtn').addEventListener('click', () => this.start());
      document.getElementById('clearBtn').addEventListener('click', () => this.clear());
      document.getElementById('randomBtn').addEventListener('click', () => this.randomize());
    }
  
    async start() {
      if (MazeSolver.isRunning) return;
      MazeSolver.isRunning = true;
      this.updateButtonStates(true);
  
      
      this.grid.flat().forEach(cell => {
        if (!cell.isWall && !cell.isStart && !cell.isEnd) {
          cell.isPath = false;
          cell.isVisited = false;
          cell.updateAppearance();
        }
      });
  
      const startCell = this.grid[0][0];
      const endCell = this.grid[MazeSolver.GRID_SIZE - 1][MazeSolver.GRID_SIZE - 1];
      const path = await this.astar(startCell, endCell);
  
      if (path.length > 0) {
       
        for (let i = 0; i < path.length; i++) {
          path[i].isPath = true;
          path[i].updateAppearance();
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
  
      MazeSolver.isRunning = false;
      this.updateButtonStates(false);
    }
  
    clear() {
      if (MazeSolver.isRunning) return;
      this.grid.flat().forEach(cell => cell.reset());
    }
  
    randomize() {
      if (MazeSolver.isRunning) return;
      this.grid.flat().forEach(cell => {
        if (!cell.isStart && !cell.isEnd) {
          cell.isWall = Math.random() < 0.3;
          cell.updateAppearance();
        }
      });
    }
  
    updateButtonStates(disabled) {
      document.getElementById('startBtn').disabled = disabled;
      document.getElementById('clearBtn').disabled = disabled;
      document.getElementById('randomBtn').disabled = disabled;
    }
  
    getNeighbors(cell) {
      const neighbors = [];
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  
      for (const [dx, dy] of directions) {
        const newX = cell.x + dx;
        const newY = cell.y + dy;
  
        if (
          newX >= 0 && newX < MazeSolver.GRID_SIZE &&
          newY >= 0 && newY < MazeSolver.GRID_SIZE &&
          !this.grid[newX][newY].isWall
        ) {
          neighbors.push(this.grid[newX][newY]);
        }
      }
  
      return neighbors;
    }
  
    heuristic(a, b) {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
  
    async astar(start, end) {
      const openSet = [start];
      const closedSet = new Set();
  
      start.g = 0;
      start.f = this.heuristic(start, end);
  
      while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
  
        if (current === end) {
          const path = [];
          let temp = current;
          while (temp) {
            path.unshift(temp);
            temp = temp.parent;
          }
          return path;
        }
  
        closedSet.add(current);
        current.isVisited = true;
        current.updateAppearance();
  
        const neighbors = this.getNeighbors(current);
        for (const neighbor of neighbors) {
          if (closedSet.has(neighbor)) continue;
  
          const tentativeG = current.g + 1;
  
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          } else if (tentativeG >= neighbor.g) {
            continue;
          }
  
          neighbor.parent = current;
          neighbor.g = tentativeG;
          neighbor.h = this.heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
        }
  
        await new Promise(resolve => setTimeout(resolve, 50));
      }
  
      return [];
    }
  }
  
 
  document.addEventListener('DOMContentLoaded', () => {
    new MazeSolver();
  });