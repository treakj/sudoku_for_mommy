/**
 * Gerador de Puzzles Sudoku Otimizado
 * Versão mais rápida e eficiente do gerador
 */

export class SudokuGenerator {
    constructor() {
        // Puzzle pré-gerado para evitar delays
        this.basePuzzles = {
            easy: {
                puzzle: [
                    [5, 3, 0, 0, 7, 0, 0, 0, 0],
                    [6, 0, 0, 1, 9, 5, 0, 0, 0],
                    [0, 9, 8, 0, 0, 0, 0, 6, 0],
                    [8, 0, 0, 0, 6, 0, 0, 0, 3],
                    [4, 0, 0, 8, 0, 3, 0, 0, 1],
                    [7, 0, 0, 0, 2, 0, 0, 0, 6],
                    [0, 6, 0, 0, 0, 0, 2, 8, 0],
                    [0, 0, 0, 4, 1, 9, 0, 0, 5],
                    [0, 0, 0, 0, 8, 0, 0, 7, 9]
                ],
                solution: [
                    [5, 3, 4, 6, 7, 8, 9, 1, 2],
                    [6, 7, 2, 1, 9, 5, 3, 4, 8],
                    [1, 9, 8, 3, 4, 2, 5, 6, 7],
                    [8, 5, 9, 7, 6, 1, 4, 2, 3],
                    [4, 2, 6, 8, 5, 3, 7, 9, 1],
                    [7, 1, 3, 9, 2, 4, 8, 5, 6],
                    [9, 6, 1, 5, 3, 7, 2, 8, 4],
                    [2, 8, 7, 4, 1, 9, 6, 3, 5],
                    [3, 4, 5, 2, 8, 6, 1, 7, 9]
                ]
            },
            medium: {
                puzzle: [
                    [0, 0, 0, 6, 0, 0, 4, 0, 0],
                    [7, 0, 0, 0, 0, 3, 6, 0, 0],
                    [0, 0, 0, 0, 9, 1, 0, 8, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 5, 0, 1, 8, 0, 0, 0, 3],
                    [0, 0, 0, 3, 0, 6, 0, 4, 5],
                    [0, 4, 0, 2, 0, 0, 0, 6, 0],
                    [9, 0, 3, 0, 0, 0, 0, 0, 0],
                    [0, 2, 0, 0, 0, 0, 1, 0, 0]
                ],
                solution: [
                    [5, 8, 1, 6, 7, 2, 4, 3, 9],
                    [7, 9, 2, 8, 4, 3, 6, 5, 1],
                    [3, 6, 4, 5, 9, 1, 7, 8, 2],
                    [4, 3, 8, 9, 5, 7, 2, 1, 6],
                    [2, 5, 6, 1, 8, 4, 9, 7, 3],
                    [1, 7, 9, 3, 2, 6, 8, 4, 5],
                    [8, 4, 5, 2, 1, 9, 3, 6, 7],
                    [9, 1, 3, 7, 6, 8, 5, 2, 4],
                    [6, 2, 7, 4, 3, 5, 1, 9, 8]
                ]
            },
            hard: {
                puzzle: [
                    [0, 0, 0, 0, 0, 0, 6, 8, 0],
                    [0, 0, 0, 0, 4, 6, 0, 0, 0],
                    [7, 0, 0, 0, 0, 0, 0, 0, 9],
                    [0, 5, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 6, 0, 0, 0],
                    [3, 0, 0, 0, 0, 8, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 2, 0],
                    [0, 0, 0, 5, 2, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                ],
                solution: [
                    [1, 4, 5, 3, 2, 7, 6, 8, 9],
                    [6, 8, 2, 1, 4, 9, 5, 3, 7],
                    [7, 3, 9, 6, 8, 5, 4, 2, 1],
                    [4, 5, 7, 8, 3, 2, 9, 1, 6],
                    [9, 1, 3, 7, 6, 4, 8, 5, 2],
                    [2, 6, 8, 9, 5, 1, 7, 4, 3],
                    [8, 2, 1, 4, 7, 6, 3, 9, 5],
                    [5, 7, 6, 2, 9, 3, 1, 8, 4],
                    [3, 9, 4, 5, 1, 8, 2, 6, 7]
                ]
            }
        };
    }

    /**
     * Gera um novo puzzle de Sudoku
     * @param {string} difficulty - Nível de dificuldade (easy, medium, hard)
     * @returns {object} Objeto contendo puzzle e solução
     */
    generate(difficulty = 'medium') {
        // Normaliza dificuldade
        const normalizedDifficulty = this.normalizeDifficulty(difficulty);
        
        // Pega puzzle base
        const basePuzzle = this.basePuzzles[normalizedDifficulty];
        
        // Cria variação aplicando transformações
        const variation = this.createVariation(basePuzzle);
        
        return {
            puzzle: variation.puzzle.map(row => [...row]),
            solution: variation.solution.map(row => [...row])
        };
    }

    /**
     * Normaliza a dificuldade para uma das disponíveis
     */
    normalizeDifficulty(difficulty) {
        switch (difficulty.toLowerCase()) {
            case 'easy':
            case 'facil':
                return 'easy';
            case 'hard':
            case 'expert':
            case 'insane':
            case 'dificil':
                return 'hard';
            default:
                return 'medium';
        }
    }

    /**
     * Cria uma variação do puzzle aplicando transformações
     */
    createVariation(basePuzzle) {
        const transformations = [
            'rotate90',
            'rotate180',
            'rotate270',
            'flipHorizontal',
            'flipVertical',
            'swapNumbers',
            'none'
        ];
        
        // Escolhe transformação aleatória
        const transformation = transformations[Math.floor(Math.random() * transformations.length)];
        
        let puzzle = basePuzzle.puzzle.map(row => [...row]);
        let solution = basePuzzle.solution.map(row => [...row]);
        
        switch (transformation) {
            case 'rotate90':
                puzzle = this.rotate90(puzzle);
                solution = this.rotate90(solution);
                break;
            case 'rotate180':
                puzzle = this.rotate180(puzzle);
                solution = this.rotate180(solution);
                break;
            case 'rotate270':
                puzzle = this.rotate270(puzzle);
                solution = this.rotate270(solution);
                break;
            case 'flipHorizontal':
                puzzle = this.flipHorizontal(puzzle);
                solution = this.flipHorizontal(solution);
                break;
            case 'flipVertical':
                puzzle = this.flipVertical(puzzle);
                solution = this.flipVertical(solution);
                break;
            case 'swapNumbers':
                const swapMap = this.generateNumberSwap();
                puzzle = this.swapNumbers(puzzle, swapMap);
                solution = this.swapNumbers(solution, swapMap);
                break;
        }
        
        return { puzzle, solution };
    }

    /**
     * Rotaciona grid 90 graus
     */
    rotate90(grid) {
        const rotated = Array(9).fill().map(() => Array(9).fill(0));
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                rotated[j][8 - i] = grid[i][j];
            }
        }
        return rotated;
    }

    /**
     * Rotaciona grid 180 graus
     */
    rotate180(grid) {
        return this.rotate90(this.rotate90(grid));
    }

    /**
     * Rotaciona grid 270 graus
     */
    rotate270(grid) {
        return this.rotate90(this.rotate90(this.rotate90(grid)));
    }

    /**
     * Espelha horizontalmente
     */
    flipHorizontal(grid) {
        return grid.map(row => [...row].reverse());
    }

    /**
     * Espelha verticalmente
     */
    flipVertical(grid) {
        return [...grid].reverse();
    }

    /**
     * Gera mapeamento para troca de números
     */
    generateNumberSwap() {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const shuffled = [...numbers];
        
        // Fisher-Yates shuffle
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        const swapMap = {};
        for (let i = 0; i < numbers.length; i++) {
            swapMap[numbers[i]] = shuffled[i];
        }
        
        return swapMap;
    }

    /**
     * Aplica troca de números no grid
     */
    swapNumbers(grid, swapMap) {
        return grid.map(row => 
            row.map(cell => cell === 0 ? 0 : swapMap[cell])
        );
    }

    /**
     * Cria uma grade vazia 9x9
     */
    createEmptyGrid() {
        return Array(9).fill(0).map(() => Array(9).fill(0));
    }
}
