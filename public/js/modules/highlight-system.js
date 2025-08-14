/**
 * Sistema de destaque inteligente para Sudoku
 * Destaca números iguais, conflitos e guias visuais
 */

export class HighlightSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.selectedNumber = null;
        this.highlightMode = 'all'; // 'all', 'conflicts', 'guides', 'off'
        this.isColorblindMode = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.handleCellClick(e.target);
            }
        });

        // Teclas de 1-9 para seleção rápida
        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.selectNumber(num);
            } else if (e.key === 'Escape') {
                this.clearHighlight();
            }
        });

        // Reaplicar destaque quando notas mudarem
        document.addEventListener('sudoku-notes-changed', () => {
            if (this.selectedNumber) this.applyHighlight();
        });
        // Reaplicar também em mudanças em lote (limpeza automática)
        document.addEventListener('sudoku-notes-batch-changed', () => {
            if (this.selectedNumber) this.applyHighlight();
        });
    }

    handleCellClick(cell) {
        const value = parseInt(cell.textContent);
        
        if (value && value >= 1 && value <= 9) {
            if (this.selectedNumber === value) {
                // Se clicar no mesmo número, remove o destaque
                this.clearHighlight();
            } else {
                // Seleciona novo número
                this.selectNumber(value);
            }
        } else {
            // Clicou em célula vazia
            this.clearHighlight();
        }
    }

    selectNumber(number) {
        this.selectedNumber = number;
        this.applyHighlight();
        
        // Integrar com outros sistemas
        if (this.game.numberCounter) {
            this.game.numberCounter.updateCounterDisplay();
        }
        
        if (this.game.numberPad) {
            this.game.numberPad.selectedNumber = number;
            this.game.numberPad.updatePadDisplay();
        }
    }

    applyHighlight() {
        this.clearHighlight();
        
        if (this.highlightMode === 'off' || !this.selectedNumber) return;

        const cells = document.querySelectorAll('.cell');
        const conflicts = this.findConflicts();
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = parseInt(cell.textContent);
            
            // Destaque do número selecionado
            if (value === this.selectedNumber) {
                if (this.highlightMode === 'all' || this.highlightMode === 'conflicts') {
                    cell.classList.add('highlight-number');
                    
                    // Conflitos
                    if (conflicts.includes(index)) {
                        cell.classList.add('highlight-conflict');
                    }
                }
                
                // Guias (linha/coluna/box) em volta da célula selecionada
                if (this.highlightMode === 'guides' || this.highlightMode === 'all') {
                    const selectedCell = this.getSelectedCell();
                    if (selectedCell) {
                        const selectedRow = Math.floor(selectedCell.index / 9);
                        const selectedCol = selectedCell.index % 9;
                        
                        if (row === selectedRow) {
                            cell.classList.add('highlight-guide-row');
                        }
                        if (col === selectedCol) {
                            cell.classList.add('highlight-guide-col');
                        }
                        if (this.sameBox(row, col, selectedRow, selectedCol)) {
                            cell.classList.add('highlight-guide-box');
                        }
                    }
                }
            } else {
                // Também destacar células que contenham a nota com o número selecionado
                const noteEl = cell.querySelector('.cell-notes .note-cell.note-active');
                if (noteEl) {
                    // Há várias notas; checar se alguma é o número
                    const hasSelectedNote = Array.from(cell.querySelectorAll('.cell-notes .note-cell.note-active'))
                        .some(n => parseInt(n.textContent) === this.selectedNumber);
                    if (hasSelectedNote) {
                        cell.classList.add('highlight-same');
                    }
                }
            }
        });
    }

    findConflicts() {
        const conflicts = [];
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const value = parseInt(cell.textContent);
            if (value === this.selectedNumber) {
                const row = Math.floor(index / 9);
                const col = index % 9;
                
                if (this.hasConflictAt(row, col, value)) {
                    conflicts.push(index);
                }
            }
        });
        
        return conflicts;
    }

    hasConflictAt(row, col, value) {
        const cells = document.querySelectorAll('.cell');
        
        // Verifica linha
        for (let c = 0; c < 9; c++) {
            if (c !== col) {
                const cellValue = parseInt(cells[row * 9 + c].textContent);
                if (cellValue === value) return true;
            }
        }
        
        // Verifica coluna
        for (let r = 0; r < 9; r++) {
            if (r !== row) {
                const cellValue = parseInt(cells[r * 9 + col].textContent);
                if (cellValue === value) return true;
            }
        }
        
        // Verifica quadrante 3x3
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row || c !== col) {
                    const cellValue = parseInt(cells[r * 9 + c].textContent);
                    if (cellValue === value) return true;
                }
            }
        }
        
        return false;
    }

    sameBox(row1, col1, row2, col2) {
        return Math.floor(row1 / 3) === Math.floor(row2 / 3) &&
               Math.floor(col1 / 3) === Math.floor(col2 / 3);
    }

    getSelectedCell() {
        const highlightedCell = document.querySelector('.highlight-number');
        if (highlightedCell) {
            const cells = Array.from(document.querySelectorAll('.cell'));
            return {
                element: highlightedCell,
                index: cells.indexOf(highlightedCell)
            };
        }
        return null;
    }

    clearHighlight() {
        const highlightClasses = [
            'highlight-number', 'highlight-same', 'highlight-conflict',
            'highlight-guide-row', 'highlight-guide-col', 'highlight-guide-box'
        ];
        
        document.querySelectorAll('.cell').forEach(cell => {
            highlightClasses.forEach(cls => cell.classList.remove(cls));
        });
        
        this.selectedNumber = null;
    }

    setHighlightMode(mode) {
        this.highlightMode = mode;
        this.applyHighlight();
    }

    animateCell(cell) {
        cell.classList.add('cell-animation');
        setTimeout(() => {
            cell.classList.remove('cell-animation');
        }, 300);
    }
}
