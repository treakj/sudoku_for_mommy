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
        
        // Sistema de paletas de cores para notas
        this.colorPalettes = [
            { name: 'Laranja', color: '#F97316', description: 'Clássico laranja' },
            { name: 'Azul', color: '#3B82F6', description: 'Azul vibrante' },
            { name: 'Verde', color: '#10B981', description: 'Verde suave' },
            { name: 'Roxo', color: '#8B5CF6', description: 'Roxo moderno' },
            { name: 'Rosa', color: '#EC4899', description: 'Rosa elegante' },
            { name: 'Vermelho', color: '#EF4444', description: 'Vermelho forte' }
        ];
        this.currentPaletteIndex = 0;
        
        this.setup();
    }

    setup() {
        this.createNotesToggle();
        this.attachEventListeners();
        this.loadNotesFromStorage();
        this.loadPaletteFromStorage();
    }

    createNotesToggle() {
        // Usar o botão existente do HTML
        this.toggleButton = document.getElementById('notes-btn');
        
        if (!this.toggleButton) {
            console.warn('Botão de notas não encontrado no HTML');
            return;
        }
        
        // Adicionar listener ao botão (será sobrescrito pelo main.js)
        this.toggleButton.addEventListener('click', () => this.toggleNotesMode());
    }

    attachEventListeners() {
        // Tecla Q para alternar modo notas
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'q' && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                this.toggleNotesMode();
            }
            
            // Tecla N para alternar modo notas
            if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                this.toggleNotesMode();
            }
            
            // Tecla C para alternar paleta de cores
            if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                this.cyclePalette();
            }
        });

        // Números 1-9 para adicionar/remover notas
        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9 && this.isNotesMode) {
                // Verificar se há uma célula selecionada no jogo
                if (this.game.selected && this.game.selected.row !== -1 && this.game.selected.col !== -1) {
                    const cellValue = this.game.playerBoard[this.game.selected.row][this.game.selected.col];
                    // Só permitir notas em células vazias
                    if (cellValue === 0) {
                        e.preventDefault();
                        const cellIndex = this.game.selected.row * 9 + this.game.selected.col;
                        this.toggleNoteByIndex(cellIndex, num);
                    }
                }
            }
        });

        // Clique no número pad (se existir)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('num-btn') && this.isNotesMode) {
                // Verificar se há uma célula selecionada no jogo
                if (this.game.selected && this.game.selected.row !== -1 && this.game.selected.col !== -1) {
                    const cellValue = this.game.playerBoard[this.game.selected.row][this.game.selected.col];
                    // Só permitir notas em células vazias
                    if (cellValue === 0) {
                        const number = parseInt(e.target.dataset.num);
                        if (number >= 1 && number <= 9) {
                            const cellIndex = this.game.selected.row * 9 + this.game.selected.col;
                            this.toggleNoteByIndex(cellIndex, number);
                        }
                    }
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
        
        // Atualizar visual do botão usando classes do Tailwind
        if (this.toggleButton) {
            if (enabled) {
                // Modo ativo: cor da paleta atual com bold
                const currentPalette = this.colorPalettes[this.currentPaletteIndex];
                this.toggleButton.style.backgroundColor = currentPalette.color;
                this.toggleButton.style.color = 'white';
                this.toggleButton.style.borderWidth = '3px';
                this.toggleButton.style.borderColor = currentPalette.color;
                this.toggleButton.style.fontWeight = 'bold';
                this.toggleButton.classList.add('notes-active');
                
                // Efeito de pulsação para indicar ativo
                this.toggleButton.style.animation = 'pulse 2s infinite';
            } else {
                // Modo inativo: estilo padrão
                this.toggleButton.style.backgroundColor = '';
                this.toggleButton.style.color = '';
                this.toggleButton.style.borderWidth = '';
                this.toggleButton.style.borderColor = '';
                this.toggleButton.style.fontWeight = '';
                this.toggleButton.style.animation = '';
                this.toggleButton.classList.remove('notes-active');
            }
        }
        
        // Atualizar cursor/visual do jogo
        document.body.classList.toggle('notes-mode', enabled);
        
        // Feedback visual
        if (enabled) {
            this.showNotesModeFeedback();
        }
        
        // Notificar o jogo para redesenhar o canvas
        if (this.game && this.game.draw) {
            this.game.draw();
        }
    }

    /**
     * Alterna entre as paletas de cores
     */
    cyclePalette() {
        this.currentPaletteIndex = (this.currentPaletteIndex + 1) % this.colorPalettes.length;
        const currentPalette = this.colorPalettes[this.currentPaletteIndex];
        
        // Salvar preferência
        this.savePaletteToStorage();
        
        // Atualizar botão se modo notas estiver ativo
        if (this.isNotesMode) {
            this.setNotesMode(true); // Re-aplicar estilo com nova cor
        }
        
        // Mostrar notificação da paleta atual
        this.showPaletteNotification(currentPalette);
        
        // Redesenhar canvas com nova cor
        if (this.game && this.game.draw) {
            this.game.draw();
        }
    }

    /**
     * Obtém a cor atual da paleta
     */
    getCurrentPaletteColor() {
        return this.colorPalettes[this.currentPaletteIndex].color;
    }

    /**
     * Toggle de nota por índice da célula
     */
    toggleNoteByIndex(cellIndex, number) {
        if (!this.notesData.has(cellIndex)) {
            this.notesData.set(cellIndex, new Set());
        }

        const notes = this.notesData.get(cellIndex);
        
        let action;
        if (notes.has(number)) {
            notes.delete(number);
            action = 'remove';
        } else {
            notes.add(number);
            action = 'add';
        }
        
        this.saveNotesToStorage();

        // Dispatch event so HistorySystem can record note changes
        const event = new CustomEvent('sudoku-notes-changed', {
            detail: {
                cellIndex,
                number,
                action,
                notes: Array.from(notes)
            }
        });
        document.dispatchEvent(event);
        
        // Redesenhar canvas
        if (this.game && this.game.draw) {
            this.game.draw();
        }
    }

    /**
     * Mostra notificação da paleta atual
     */
    showPaletteNotification(palette) {
        const notification = document.createElement('div');
        notification.className = 'palette-notification fixed top-20 right-4 bg-white border-2 rounded-lg p-3 shadow-lg z-50';
        notification.style.borderColor = palette.color;
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded-full" style="background-color: ${palette.color}"></div>
                <span class="font-medium">${palette.name}</span>
            </div>
            <div class="text-sm text-gray-600">${palette.description}</div>
        `;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    /**
     * Salva paleta atual no localStorage
     */
    savePaletteToStorage() {
        localStorage.setItem('sudoku-notes-palette', this.currentPaletteIndex.toString());
    }

    /**
     * Carrega paleta do localStorage
     */
    loadPaletteFromStorage() {
        try {
            const saved = localStorage.getItem('sudoku-notes-palette');
            if (saved) {
                const index = parseInt(saved);
                if (index >= 0 && index < this.colorPalettes.length) {
                    this.currentPaletteIndex = index;
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar paleta:', e);
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
        
        let action;
        if (notes.has(number)) {
            notes.delete(number);
            action = 'remove';
        } else {
            notes.add(number);
            action = 'add';
        }
        
        this.updateCellNotesDisplay(cell, cellIndex);
        this.saveNotesToStorage();

        // Dispatch event so HistorySystem can record note changes
        const event = new CustomEvent('sudoku-notes-changed', {
            detail: {
                cellIndex,
                number,
                action,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    toggleNoteByIndex(cellIndex, number) {
        if (!this.notesData.has(cellIndex)) {
            this.notesData.set(cellIndex, new Set());
        }

        const notes = this.notesData.get(cellIndex);
        
        let action;
        if (notes.has(number)) {
            notes.delete(number);
            action = 'remove';
        } else {
            notes.add(number);
            action = 'add';
        }
        
        this.saveNotesToStorage();
        
        // Redesenhar o jogo para mostrar as notas
        if (this.game && this.game.draw) {
            this.game.draw();
        }

        // Dispatch event so HistorySystem can record note changes
        const event = new CustomEvent('sudoku-notes-changed', {
            detail: {
                cellIndex,
                number,
                action,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
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
        
        const removed = []; // collect removed notes for history
        
        cells.forEach((cell, index) => {
            const r = Math.floor(index / 9);
            const c = index % 9;
            
            // Mesma linha, coluna ou quadrante
            if (r === row || c === col || this.sameBox(r, c, row, col)) {
                if (this.notesData.has(index)) {
                    const notes = this.notesData.get(index);
                    if (notes.has(number)) {
                        notes.delete(number);
                        removed.push({ cellIndex: index, number });
                        this.updateCellNotesDisplay(cell, index);
                    }
                }
            }
        });

        // If any note was removed, dispatch a batch event (action: remove)
        if (removed.length > 0) {
            const batchEvent = new CustomEvent('sudoku-notes-batch-changed', {
                detail: {
                    action: 'remove',
                    changes: removed,
                    timestamp: Date.now()
                }
            });
            document.dispatchEvent(batchEvent);
        }
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

        // Limpar notas relacionadas na região (and emit batch event)
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

    applyNoteChange(cellIndex, number, action) {
        if (!this.notesData.has(cellIndex)) {
            this.notesData.set(cellIndex, new Set());
        }
        const notes = this.notesData.get(cellIndex);
        const cell = this.getCellByIndex(cellIndex);

        if (action === 'add') {
            notes.add(number);
        } else if (action === 'remove') {
            notes.delete(number);
        }

        if (cell) {
            this.updateCellNotesDisplay(cell, cellIndex);
        }
        this.saveNotesToStorage();
    }
}
