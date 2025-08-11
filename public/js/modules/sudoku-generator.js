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
        console.log('🔧 Iniciando geração do puzzle...');
        this.grid = this.createEmptyGrid();
        
        console.log('🔧 Preenchendo grid...');
        this._fillGrid(this.grid);
        
        // Cria uma cópia da solução completa
        const solution = this.grid.map(row => [...row]);
        console.log('✅ Grid preenchido com sucesso');
        
        console.log('🔧 Removendo números para dificuldade:', difficulty);
        // Remove números baseado na dificuldade (com verificação de unicidade)
        this._removeNumbers(this.grid, difficulty);
        
        // 🔍 VALIDAÇÃO FINAL
        console.log('🔍 Validando puzzle final...');
        const validationResult = this._validatePuzzle(this.grid, solution);
        
        if (!validationResult.isValid) {
            console.error('❌ Puzzle inválido gerado:', validationResult.errors);
            // Em caso de erro, tenta novamente ou usa backup
            return this._generateFallback(difficulty);
        }
        
        console.log('✅ Puzzle validado com sucesso!');
        console.log(`📊 Estatísticas: ${validationResult.stats.filledCells} células preenchidas, ${validationResult.stats.emptyCells} vazias`);
        
        return {
            puzzle: this.grid,
            solution: solution,
            stats: validationResult.stats
        };
    }

    /**
     * 🔍 VALIDADOR FINAL DO PUZZLE
     * Verifica se o puzzle gerado é válido e resolvível
     * @param {number[][]} puzzle - Puzzle a validar
     * @param {number[][]} expectedSolution - Solução esperada
     * @returns {object} Resultado da validação
     */
    _validatePuzzle(puzzle, expectedSolution) {
        const errors = [];
        const stats = {
            filledCells: 0,
            emptyCells: 0,
            hasUniqueSolution: false,
            solutionMatches: false
        };
        
        // Conta células
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (puzzle[r][c] === 0) {
                    stats.emptyCells++;
                } else {
                    stats.filledCells++;
                }
            }
        }
        
        // Verifica se tem solução única
        console.log('🔍 Verificando se tem solução única...');
        stats.hasUniqueSolution = this._hasUniqueSolution(puzzle);
        
        if (!stats.hasUniqueSolution) {
            errors.push('Puzzle não tem solução única');
        }
        
        // Verifica se a solução está correta
        console.log('🔍 Verificando se solução está correta...');
        const puzzleCopy = puzzle.map(row => [...row]);
        if (this._fillGrid(puzzleCopy)) {
            stats.solutionMatches = this._gridsMatch(puzzleCopy, expectedSolution);
            if (!stats.solutionMatches) {
                errors.push('Solução não confere com a esperada');
            }
        } else {
            errors.push('Puzzle não pode ser resolvido');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            stats: stats
        };
    }

    /**
     * 🆚 COMPARADOR DE GRIDS
     * Verifica se dois grids são idênticos
     */
    _gridsMatch(grid1, grid2) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid1[r][c] !== grid2[r][c]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 🚨 GERADOR DE BACKUP
     * Gera puzzle simples se o principal falhar
     */
    _generateFallback(difficulty) {
        console.warn('🚨 Usando gerador de backup devido a falha na validação');
        
        // Usa puzzle pré-definido válido
        const fallbackPuzzle = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ];
        
        const fallbackSolution = [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ];
        
        return {
            puzzle: fallbackPuzzle.map(row => [...row]),
            solution: fallbackSolution.map(row => [...row]),
            stats: { filledCells: 40, emptyCells: 41, fallback: true }
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
     * VERSÃO MELHORADA: Garante solução única
     * @param {number[][]} grid - Grid para remover números
     * @param {string} difficulty - Nível de dificuldade
     */
    _removeNumbers(grid, difficulty) {
        const targetRemovals = {
            easy: 40,
            medium: 50,
            hard: 56,
            expert: 61,
            insane: 64
        };
        
        const targetCount = targetRemovals[difficulty] || targetRemovals.medium;
        let removedCount = 0;
        let attempts = 0;
        const maxAttempts = 1000; // Evita loop infinito
        
        console.log(`🎯 Meta: remover ${targetCount} números mantendo solução única`);
        
        // Lista de todas as células preenchidas
        const filledCells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] !== 0) {
                    filledCells.push([r, c]);
                }
            }
        }
        
        // Embaralha para remoção aleatória
        this._shuffle(filledCells);
        
        // Remove números mantendo solução única
        for (const [row, col] of filledCells) {
            if (removedCount >= targetCount || attempts >= maxAttempts) break;
            
            attempts++;
            const originalValue = grid[row][col];
            
            // Remove temporariamente
            grid[row][col] = 0;
            
            // Verifica se ainda tem solução única
            if (this._hasUniqueSolution(grid)) {
                // ✅ Pode remover - solução ainda é única
                removedCount++;
                console.log(`✅ Removido: posição (${row},${col}) = ${originalValue} [${removedCount}/${targetCount}]`);
            } else {
                // ❌ Não pode remover - restaura valor
                grid[row][col] = originalValue;
                console.log(`❌ Restaurado: posição (${row},${col}) = ${originalValue} (perderia unicidade)`);
            }
        }
        
        console.log(`🎯 Resultado: ${removedCount} números removidos de ${targetCount} desejados`);
        console.log(`🔍 Tentativas: ${attempts} de ${maxAttempts} máximas`);
    }

    /**
     * 🔍 VERIFICADOR DE SOLUÇÃO ÚNICA
     * Verifica se o puzzle tem exatamente uma solução
     * @param {number[][]} grid - Grid para verificar
     * @returns {boolean} True se tem solução única
     */
    _hasUniqueSolution(grid) {
        const gridCopy = grid.map(row => [...row]);
        const solutions = [];
        
        // Busca até 2 soluções (se encontrar 2, não é única)
        this._countSolutions(gridCopy, solutions, 2);
        
        return solutions.length === 1;
    }

    /**
     * 🔢 CONTADOR DE SOLUÇÕES (Backtracking Otimizado)
     * Conta quantas soluções o puzzle tem
     * @param {number[][]} grid - Grid atual
     * @param {number[][]} solutions - Array para armazenar soluções
     * @param {number} maxSolutions - Máximo de soluções a buscar
     * @returns {boolean} True se deve continuar buscando
     */
    _countSolutions(grid, solutions, maxSolutions) {
        if (solutions.length >= maxSolutions) {
            return false; // Para de buscar se já encontrou o suficiente
        }
        
        const emptyCell = this._findEmpty(grid);
        
        if (!emptyCell) {
            // Grid completo - encontrou uma solução
            solutions.push(grid.map(row => [...row]));
            return solutions.length < maxSolutions;
        }
        
        const [row, col] = emptyCell;
        
        // Tenta números 1-9 (sem embaralhar para ser determinístico)
        for (let num = 1; num <= 9; num++) {
            if (this._isValid(grid, row, col, num)) {
                grid[row][col] = num;
                
                // Recursão
                if (!this._countSolutions(grid, solutions, maxSolutions)) {
                    grid[row][col] = 0; // Backtrack
                    return false; // Para se já encontrou soluções suficientes
                }
                
                grid[row][col] = 0; // Backtrack
            }
        }
        
        return true;
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
