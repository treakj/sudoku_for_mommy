/**
 * Validador de Sudoku
 * Classe responsável por validar movimentos e estados do jogo
 */

export class Validator {
    /**
     * Verifica se um movimento é válido no tabuleiro
     * @param {number[][]} board - Tabuleiro atual
     * @param {number} row - Linha do movimento
     * @param {number} col - Coluna do movimento
     * @param {number} num - Número a ser colocado
     * @returns {boolean} True se o movimento é válido, false caso contrário
     */
    isMoveValid(board, row, col, num) {
        // Verifica linha e coluna
        for (let i = 0; i < 9; i++) {
            // Verifica se o número já existe na linha (exceto na própria posição)
            if (board[row][i] === num && i !== col) {
                return false;
            }
            
            // Verifica se o número já existe na coluna (exceto na própria posição)
            if (board[i][col] === num && i !== row) {
                return false;
            }
        }
        
        // Verifica o quadrante 3x3
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const currentRow = startRow + i;
                const currentCol = startCol + j;
                
                // Verifica se o número já existe no quadrante (exceto na própria posição)
                if (board[currentRow][currentCol] === num && 
                    (currentRow !== row || currentCol !== col)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Verifica se o tabuleiro está completamente resolvido
     * @param {number[][]} board - Tabuleiro a ser verificado
     * @returns {boolean} True se o tabuleiro está resolvido, false caso contrário
     */
    isBoardComplete(board) {
        // Verifica se há células vazias
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Verifica se todos os números são válidos
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = board[row][col];
                if (!this.isMoveValid(board, row, col, num)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Encontra todos os conflitos no tabuleiro
     * @param {number[][]} board - Tabuleiro a ser analisado
     * @returns {boolean[][]} Grid booleano indicando conflitos
     */
    findConflicts(board) {
        const conflicts = Array(9).fill(0).map(() => Array(9).fill(false));
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = board[row][col];
                if (num !== 0 && !this.isMoveValid(board, row, col, num)) {
                    conflicts[row][col] = true;
                }
            }
        }
        
        return conflicts;
    }

    /**
     * Verifica se uma linha está válida
     * @param {number[][]} board - Tabuleiro
     * @param {number} row - Índice da linha
     * @returns {boolean} True se válida, false caso contrário
     */
    isRowValid(board, row) {
        const seen = new Set();
        
        for (let col = 0; col < 9; col++) {
            const num = board[row][col];
            if (num !== 0) {
                if (seen.has(num)) {
                    return false;
                }
                seen.add(num);
            }
        }
        
        return true;
    }

    /**
     * Verifica se uma coluna está válida
     * @param {number[][]} board - Tabuleiro
     * @param {number} col - Índice da coluna
     * @returns {boolean} True se válida, false caso contrário
     */
    isColumnValid(board, col) {
        const seen = new Set();
        
        for (let row = 0; row < 9; row++) {
            const num = board[row][col];
            if (num !== 0) {
                if (seen.has(num)) {
                    return false;
                }
                seen.add(num);
            }
        }
        
        return true;
    }

    /**
     * Verifica se um quadrante 3x3 está válido
     * @param {number[][]} board - Tabuleiro
     * @param {number} boxRow - Linha do quadrante (0, 1, ou 2)
     * @param {number} boxCol - Coluna do quadrante (0, 1, ou 2)
     * @returns {boolean} True se válido, false caso contrário
     */
    isBoxValid(board, boxRow, boxCol) {
        const seen = new Set();
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const num = board[startRow + i][startCol + j];
                if (num !== 0) {
                    if (seen.has(num)) {
                        return false;
                    }
                    seen.add(num);
                }
            }
        }
        
        return true;
    }

    /**
     * Obtém possíveis números para uma posição
     * @param {number[][]} board - Tabuleiro atual
     * @param {number} row - Linha
     * @param {number} col - Coluna
     * @returns {number[]} Array com números possíveis
     */
    getPossibleNumbers(board, row, col) {
        if (board[row][col] !== 0) {
            return []; // Célula já preenchida
        }
        
        const possible = [];
        
        for (let num = 1; num <= 9; num++) {
            if (this.isMoveValid(board, row, col, num)) {
                possible.push(num);
            }
        }
        
        return possible;
    }
}
