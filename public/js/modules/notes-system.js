/**
 * Sistema de notas (modo lápis) para Sudoku
 * Permite fazer anotações de números possíveis em células vazias
 */

export class NotesSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.notesData = new Map(); // Armazena notas para cada célula
        this.isNotesMode = false;
        this.activeCell = null;
        this.maxNotesPerCell = 9;
        this.setup();
    }

    setup() {
        this.createNotesToggle();
        this.attachEventListeners();
        this.loadNotesFromStorage();
    }

    createNotesToggle() {
        // Criar botão de modo notas
        const notesBtn = document.createElement('button');
        notesBtn.className = 'notes-toggle-btn';
        notesBtn.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L9.708 9.708a.5.5 0 0 1-.708 0L4.5 5.207l-.146.147a.5.5 0 0 1-.708-.708l.5-.5L2 2h12.146z"/>
                <path d="M5.5 6.5L1.5 10.5V14h3.5l4-4z"/>
            </svg>
            <span>Notas</span>
        `;
        notesBtn.title = 'Alternar modo de notas (Shift)';
        notesBtn.addEventListener('click', () => this.toggleNotesMode());

        // Adicionar ao container de controles
        const controlsContainer = document.querySelector('.game-controls');
        if (controlsContainer) {
            controlsContainer.appendChild(notesBtn);
        }

        this.toggleButton = notesBtn;
    }

    attachEventListeners() {
        // Tecla Shift para alternar modo notas
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Shift' && !e.repeat) {
                this.toggleNotesMode();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                // Opcional: desativar automaticamente ao soltar Shift
                // this.setNotesMode(false);
            }
        });

        // Números 1-9 para adicionar/remover notas
        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9 && this.isNotesMode && this.activeCell) {
                e.preventDefault();
                this.toggleNote(this.activeCell, num);
            }
        });

        // Clique em células
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.handleCellClick(e.target);
            }
        });

        // Clique no número pad (se existir)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('number-btn') && this.isNotesMode && this.activeCell) {
                const number = parseInt(e.target.dataset.number);
                if (number >= 1 && number <= 9) {
                    this.toggleNote(this.activeCell, number);
                }
            }
        });
    }

    handleCellClick(cell) {
        const cellIndex = this.getCellIndex(cell);
        
        if (cell.textContent.trim() === '') {
            // Célula vazia - pode receber notas
            this.setActiveCell(cell);
        } else {
            // Célula preenchida - remover seleção
            this.setActiveCell(null);
        }
    }

    setActiveCell(cell) {
        // Remover seleção anterior
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('notes-active');
        });

        this.activeCell = cell;

        if (cell) {
            cell.classList.add('notes-active');
        }
    }

    toggleNotesMode() {
        this.setNotesMode(!this.isNotesMode);
    }

    setNotesMode(enabled) {
        this.isNotesMode = enabled;
        
        // Atualizar visual do botão
        this.toggleButton.classList.toggle('notes-active', enabled);
        
        // Atualizar cursor/visual do jogo
        document.body.classList.toggle('notes-mode', enabled);
        
        // Feedback visual
        if (enabled) {
            this.showNotesModeFeedback();
        }
    }

    showNotesModeFeedback() {
        // Criar notificação temporária
        const notification = document.createElement('div');
        notification.className = 'notes-notification';
        notification.textContent = 'Modo notas ativado';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    toggleNote(cell, number) {
        const cellIndex = this.getCellIndex(cell);
        
        if (!this.notesData.has(cellIndex)) {
            this.notesData.set(cellIndex, new Set());
        }

        const notes = this.notesData.get(cellIndex);
        
        if (notes.has(number)) {
            notes.delete(number);
        } else {
            notes.add(number);
        }

        this.updateCellNotesDisplay(cell, cellIndex);
        this.saveNotesToStorage();
    }

    updateCellNotesDisplay(cell, cellIndex) {
        if (!this.notesData.has(cellIndex)) {
            this.clearCellNotes(cell);
            return;
        }

        const notes = this.notesData.get(cellIndex);
        
        if (notes.size === 0) {
            this.clearCellNotes(cell);
            return;
        }

        // Criar container de notas se não existir
        let notesContainer = cell.querySelector('.cell-notes');
        if (!notesContainer) {
            notesContainer = document.createElement('div');
            notesContainer.className = 'cell-notes';
            cell.appendChild(notesContainer);
        }

        // Criar grid 3x3 para as notas
        notesContainer.innerHTML = '';
        for (let i = 1; i <= 9; i++) {
            const noteCell = document.createElement('div');
            noteCell.className = 'note-cell';
            
            if (notes.has(i)) {
                noteCell.textContent = i;
                noteCell.classList.add('note-active');
            }
            
            notesContainer.appendChild(noteCell);
        }

        cell.classList.add('has-notes');
    }

    clearCellNotes(cell) {
        const notesContainer = cell.querySelector('.cell-notes');
        if (notesContainer) {
            notesContainer.remove();
        }
        cell.classList.remove('has-notes');
    }

    clearAllNotesForNumber(number) {
        // Remove todas as notas de um número específico
        this.notesData.forEach((notes, cellIndex) => {
            if (notes.has(number)) {
                notes.delete(number);
                const cell = this.getCellByIndex(cellIndex);
                if (cell) {
                    this.updateCellNotesDisplay(cell, cellIndex);
                }
            }
        });
        this.saveNotesToStorage();
    }

    clearNotesInRegion(cellIndex, number) {
        // Remove notas na mesma linha, coluna e quadrante
        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const r = Math.floor(index / 9);
            const c = index % 9;
            
            // Mesma linha, coluna ou quadrante
            if (r === row || c === col || this.sameBox(r, c, row, col)) {
                if (this.notesData.has(index)) {
                    const notes = this.notesData.get(index);
                    if (notes.has(number)) {
                        notes.delete(number);
                        this.updateCellNotesDisplay(cell, index);
                    }
                }
            }
        });
    }

    sameBox(row1, col1, row2, col2) {
        return Math.floor(row1 / 3) === Math.floor(row2 / 3) &&
               Math.floor(col1 / 3) === Math.floor(col2 / 3);
    }

    getCellIndex(cell) {
        const cells = Array.from(document.querySelectorAll('.cell'));
        return cells.indexOf(cell);
    }

    getCellByIndex(index) {
        const cells = document.querySelectorAll('.cell');
        return cells[index] || null;
    }

    onCellFilled(cellIndex, number) {
        // Quando uma célula é preenchida, limpar suas notas
        if (this.notesData.has(cellIndex)) {
            this.notesData.delete(cellIndex);
            const cell = this.getCellByIndex(cellIndex);
            if (cell) {
                this.clearCellNotes(cell);
            }
        }

        // Limpar notas relacionadas na região
        this.clearNotesInRegion(cellIndex, number);
        this.saveNotesToStorage();
    }

    generateSmartNotes(cellIndex) {
        // Gerar notas automáticas baseadas em possibilidades
        const cell = this.getCellByIndex(cellIndex);
        if (!cell || cell.textContent.trim() !== '') return;

        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;
        const possible = [];

        for (let num = 1; num <= 9; num++) {
            if (this.isNumberPossible(row, col, num)) {
                possible.push(num);
            }
        }

        // Atualizar notas
        this.notesData.set(cellIndex, new Set(possible));
        this.updateCellNotesDisplay(cell, cellIndex);
    }

    isNumberPossible(row, col, number) {
        const cells = document.querySelectorAll('.cell');
        
        // Verificar linha
        for (let c = 0; c < 9; c++) {
            if (parseInt(cells[row * 9 + c].textContent) === number) {
                return false;
            }
        }
        
        // Verificar coluna
        for (let r = 0; r < 9; r++) {
            if (parseInt(cells[r * 9 + col].textContent) === number) {
                return false;
            }
        }
        
        // Verificar quadrante
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (parseInt(cells[r * 9 + c].textContent) === number) {
                    return false;
                }
            }
        }
        
        return true;
    }

    saveNotesToStorage() {
        const notesArray = [];
        this.notesData.forEach((notes, cellIndex) => {
            notesArray.push({
                cellIndex,
                notes: Array.from(notes)
            });
        });
        localStorage.setItem('sudoku-notes', JSON.stringify(notesArray));
    }

    loadNotesFromStorage() {
        try {
            const saved = localStorage.getItem('sudoku-notes');
            if (saved) {
                const notesArray = JSON.parse(saved);
                notesArray.forEach(item => {
                    this.notesData.set(item.cellIndex, new Set(item.notes));
                    const cell = this.getCellByIndex(item.cellIndex);
                    if (cell) {
                        this.updateCellNotesDisplay(cell, item.cellIndex);
                    }
                });
            }
        } catch (e) {
            console.warn('Erro ao carregar notas:', e);
        }
    }

    reset() {
        this.notesData.clear();
        document.querySelectorAll('.cell').forEach(cell => {
            this.clearCellNotes(cell);
        });
        this.setActiveCell(null);
        this.setNotesMode(false);
        localStorage.removeItem('sudoku-notes');
    }
}
