/**
 * Gerador de Puzzles Sudoku
 * Classe responsável por gerar novos puzzles válidos de Sudoku
 */

export class SudokuGenerator {
    constructor() {
        this.grid = this.createEmptyGrid();
    }

    /**
     * Cria uma grade vazia 9x9
     * @returns {number[][]} Grid vazio
     */
    createEmptyGrid() {
        return Array(9).fill(0).map(() => Array(9).fill(0));
    }

    /**
     * Gera um novo puzzle de Sudoku
     * @param {string} difficulty - Nível de dificuldade (easy, medium, hard, expert, insane)
     * @returns {object} Objeto contendo puzzle e solução
     */
    generate(difficulty) {
        this.grid = this.createEmptyGrid();
        this._fillGrid(this.grid);
        
        // Cria uma cópia da solução completa
        const solution = this.grid.map(row => [...row]);
        
        // Remove números baseado na dificuldade
        this._removeNumbers(this.grid, difficulty);
        
        return {
            puzzle: this.grid,
            solution: solution
        };
    }

    /**
     * Preenche o grid com números válidos usando backtracking
     * @param {number[][]} grid - Grid a ser preenchido
     * @returns {boolean} True se conseguiu preencher, false caso contrário
     */
    _fillGrid(grid) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const find = this._findEmpty(grid);
        
        if (!find) {
            return true; // Grid completamente preenchido
        }
        
        const [row, col] = find;
        this._shuffle(numbers);
        
        for (const num of numbers) {
            if (this._isValid(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (this._fillGrid(grid)) {
                    return true;
                }
                
                grid[row][col] = 0; // Backtrack
            }
        }
        
        return false;
    }

    /**
     * Remove números do grid baseado na dificuldade
     * @param {number[][]} grid - Grid para remover números
     * @param {string} difficulty - Nível de dificuldade
     */
    _removeNumbers(grid, difficulty) {
        const removals = {
            easy: 40,
            medium: 50,
            hard: 56,
            expert: 61,
            insane: 64
        };
        
        let count = removals[difficulty] || removals.medium;
        
        while (count > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (grid[row][col] !== 0) {
                grid[row][col] = 0;
                count--;
            }
        }
    }

    /**
     * Verifica se um número pode ser colocado em uma posição
     * @param {number[][]} grid - Grid atual
     * @param {number} row - Linha
     * @param {number} col - Coluna
     * @param {number} num - Número a ser testado
     * @returns {boolean} True se válido, false caso contrário
     */
    _isValid(grid, row, col, num) {
        // Verifica linha e coluna
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num) return false;
            if (grid[i][col] === num) return false;
        }
        
        // Verifica o quadrante 3x3
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[startRow + i][startCol + j] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Encontra a primeira célula vazia no grid
     * @param {number[][]} grid - Grid para buscar
     * @returns {number[]|null} [row, col] da primeira célula vazia ou null
     */
    _findEmpty(grid) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) {
                    return [r, c];
                }
            }
        }
        return null;
    }

    /**
     * Embaralha um array usando algoritmo Fisher-Yates
     * @param {any[]} array - Array a ser embaralhado
     */
    _shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
