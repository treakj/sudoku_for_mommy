/**
 * Sistema de histórico para Sudoku
 * Permite desfazer/refazer jogadas e ver histórico completo
 */

export class HistorySystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 100;
        this.isRecording = true;
        this.panel = null;
        this.isPanelVisible = false;
        this.setup();
    }

    setup() {
        this.createHistoryPanel();
        this.createHistoryControls();
        this.attachEventListeners();
        this.loadHistoryFromStorage();
    }

    createHistoryControls() {
        // Usar os botões existentes no HTML
        this.undoBtn = document.getElementById('undo-btn');
        this.redoBtn = document.getElementById('redo-btn');
        
        // Adicionar event listeners aos botões existentes
        if (this.undoBtn) {
            this.undoBtn.addEventListener('click', () => this.undo());
        }
        if (this.redoBtn) {
            this.redoBtn.addEventListener('click', () => this.redo());
        }
        
        this.updateButtonStates();
    }

    createHistoryPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'history-panel';
        this.panel.innerHTML = `
            <div class="history-panel-header">
                <h3>Histórico de Jogadas</h3>
                <div class="history-panel-controls">
                    <button class="history-clear-btn" title="Limpar histórico">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                    <button class="history-close-btn" title="Fechar painel">×</button>
                </div>
            </div>
            <div class="history-panel-content">
                <div class="history-list"></div>
                <div class="history-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total de jogadas:</span>
                        <span class="stat-value total-moves">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Tempo de jogo:</span>
                        <span class="stat-value game-time">--:--</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.panel);

        // Event listeners do painel
        this.panel.querySelector('.history-close-btn').addEventListener('click', () => {
            this.toggleHistoryPanel(false);
        });

        this.panel.querySelector('.history-clear-btn').addEventListener('click', () => {
            this.clearHistory();
        });
    }

    attachEventListeners() {
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    this.redo();
                }
            }
        });

        // Escutar mudanças no jogo
        document.addEventListener('sudoku-cell-changed', (e) => {
            if (this.isRecording) {
                this.recordMove(e.detail);
            }
        });

        // Escutar mudanças de notas
        document.addEventListener('sudoku-notes-changed', (e) => {
            if (this.isRecording) {
                const { cellIndex, number, action, timestamp } = e.detail;
                this.recordMove({
                    cellIndex,
                    number,
                    action,
                    timestamp
                });
            }
        });

        // Escutar mudanças de notas em lote (limpeza automática ao preencher número)
        document.addEventListener('sudoku-notes-batch-changed', (e) => {
            if (this.isRecording) {
                const { action, changes, timestamp } = e.detail;
                this.recordMove({
                    batch: true,
                    action,
                    changes,
                    timestamp
                });
            }
        });

        // Fechar painel com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelVisible) {
                this.toggleHistoryPanel(false);
            }
        });
    }

    recordMove(moveData) {
        // Remove histórico futuro se estamos no meio da timeline
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Criar entrada do histórico
        const historyEntry = {
            timestamp: moveData.timestamp || Date.now(),
            cellIndex: moveData.cellIndex,
            row: moveData.cellIndex !== undefined ? Math.floor(moveData.cellIndex / 9) : null,
            col: moveData.cellIndex !== undefined ? (moveData.cellIndex % 9) : null,
            previousValue: moveData.previousValue || '',
            newValue: moveData.newValue || '',
            number: moveData.number,
            action: moveData.action,
            batch: !!moveData.batch,
            changes: moveData.changes || null,
            moveType: this.determineMoveType(moveData),
            gameState: this.captureGameState()
        };

        this.history.push(historyEntry);
        this.currentIndex++;

        // Limitar tamanho do histórico
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }

        this.updateButtonStates();
        this.updateHistoryPanel();
        this.saveHistoryToStorage();
    }

    determineMoveType(moveData) {
        if (moveData && moveData.batch && moveData.action) {
            return moveData.action === 'remove' ? 'notes-batch-remove' : 'notes-batch';
        }
        if (moveData && (moveData.action === 'add' || moveData.action === 'remove')) {
            return moveData.action === 'add' ? 'note-add' : 'note-remove';
        }
        if (!moveData.previousValue && moveData.newValue) {
            return 'place'; // Colocar número
        } else if (moveData.previousValue && !moveData.newValue) {
            return 'erase'; // Apagar número
        } else if (moveData.previousValue && moveData.newValue) {
            return 'change'; // Trocar número
        }
        return 'unknown';
    }

    captureGameState() {
        const cells = document.querySelectorAll('.cell');
        const state = [];
        cells.forEach(cell => {
            state.push(cell.textContent.trim() || '');
        });
        return state;
    }

    undo() {
        if (!this.canUndo()) return;

        const move = this.history[this.currentIndex];
        this.isRecording = false;

        // Restaurar estado anterior
        if (move.moveType === 'note-add' || move.moveType === 'note-remove') {
            const inverseAction = move.moveType === 'note-add' ? 'remove' : 'add';
            if (this.game.notesSystem) {
                this.game.notesSystem.applyNoteChange(move.cellIndex, move.number, inverseAction);
            }
        } else if (move.moveType === 'notes-batch-remove' && Array.isArray(move.changes)) {
            // Reverter remoções em lote: adicionar de volta
            if (this.game.notesSystem) {
                move.changes.forEach(ch => this.game.notesSystem.applyNoteChange(ch.cellIndex, ch.number, 'add'));
            }
        } else {
            const cell = this.getCellByIndex(move.cellIndex);
            if (cell) {
                cell.textContent = move.previousValue;
                
                // Notificar outros sistemas
                const event = new CustomEvent('sudoku-cell-changed', {
                    detail: {
                        cellIndex: move.cellIndex,
                        previousValue: move.newValue,
                        newValue: move.previousValue,
                        isUndo: true
                    }
                });
                document.dispatchEvent(event);
                this.animateUndo(cell);
            }
        }

        this.currentIndex--;
        this.isRecording = true;
        this.updateButtonStates();
        this.updateHistoryPanel();
    }

    redo() {
        if (!this.canRedo()) return;

        this.currentIndex++;
        const move = this.history[this.currentIndex];
        this.isRecording = false;

        if (move.moveType === 'note-add' || move.moveType === 'note-remove') {
            if (this.game.notesSystem) {
                this.game.notesSystem.applyNoteChange(move.cellIndex, move.number, move.moveType === 'note-add' ? 'add' : 'remove');
            }
        } else if (move.moveType === 'notes-batch-remove' && Array.isArray(move.changes)) {
            // Reaplicar remoções em lote
            if (this.game.notesSystem) {
                move.changes.forEach(ch => this.game.notesSystem.applyNoteChange(ch.cellIndex, ch.number, 'remove'));
            }
        } else {
            // Aplicar movimento novamente
            const cell = this.getCellByIndex(move.cellIndex);
            if (cell) {
                cell.textContent = move.newValue;
                
                // Notificar outros sistemas
                const event = new CustomEvent('sudoku-cell-changed', {
                    detail: {
                        cellIndex: move.cellIndex,
                        previousValue: move.previousValue,
                        newValue: move.newValue,
                        isRedo: true
                    }
                });
                document.dispatchEvent(event);
                this.animateRedo(cell);
            }
        }

        this.isRecording = true;
        this.updateButtonStates();
        this.updateHistoryPanel();
    }

    canUndo() {
        return this.currentIndex >= 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    updateButtonStates() {
        if (this.undoBtn) {
            this.undoBtn.disabled = !this.canUndo();
        }
        if (this.redoBtn) {
            this.redoBtn.disabled = !this.canRedo();
        }
    }

    toggleHistoryPanel(show) {
        if (show === undefined) {
            show = !this.isPanelVisible;
        }

        this.isPanelVisible = show;
        this.panel.classList.toggle('history-panel-visible', show);
        
        if (show) {
            this.updateHistoryPanel();
        }
    }

    updateHistoryPanel() {
        if (!this.isPanelVisible) return;

        const historyList = this.panel.querySelector('.history-list');
        historyList.innerHTML = '';

        this.history.forEach((move, index) => {
            const item = document.createElement('div');
            item.className = `history-item ${index <= this.currentIndex ? 'history-item-applied' : 'history-item-future'}`;
            
            const time = new Date(move.timestamp).toLocaleTimeString();
            const position = (move.row !== null && move.col !== null)
                ? `${String.fromCharCode(65 + move.col)}${(move.row || 0) + 1}`
                : '-';
            
            let description = '';
            switch (move.moveType) {
                case 'place':
                    description = `Colocou ${move.newValue} em ${position}`;
                    break;
                case 'erase':
                    description = `Apagou ${move.previousValue} de ${position}`;
                    break;
                case 'change':
                    description = `Trocou ${move.previousValue}→${move.newValue} em ${position}`;
                    break;
                case 'note-add':
                    description = `Nota +${move.number} em ${position}`;
                    break;
                case 'note-remove':
                    description = `Nota -${move.number} em ${position}`;
                    break;
                case 'notes-batch-remove':
                    description = `Notas removidas (${move.changes?.length || 0} células)`;
                    break;
                default:
                    description = `Ação em ${position}`;
            }
            
            item.innerHTML = `
                <div class="history-item-main">
                    <div class="history-item-time">${time}</div>
                    <div class="history-item-desc">${description}</div>
                </div>
                <div class="history-item-actions">
                    <button class="history-goto-btn" data-index="${index}" title="Ir para esta jogada">
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 4.5a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 .5-.5z"/>
                        </svg>
                    </button>
                </div>
            `;

            historyList.appendChild(item);
        });

        // Event listeners para botões "ir para"
        historyList.querySelectorAll('.history-goto-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetIndex = parseInt(e.target.closest('.history-goto-btn').dataset.index);
                this.goToMove(targetIndex);
            });
        });

        // Atualizar estatísticas
        this.updateHistoryStats();
    }

    updateHistoryStats() {
        const totalMoves = this.panel.querySelector('.total-moves');
        const gameTime = this.panel.querySelector('.game-time');
        
        if (totalMoves) {
            totalMoves.textContent = this.history.length;
        }

        if (gameTime && this.game.timer) {
            gameTime.textContent = this.game.timer.getFormattedTime();
        }
    }

    goToMove(targetIndex) {
        while (this.currentIndex > targetIndex && this.canUndo()) {
            this.undo();
        }
        while (this.currentIndex < targetIndex && this.canRedo()) {
            this.redo();
        }
    }

    animateUndo(cell) {
        if (cell) {
            cell.classList.add('history-undo-animation');
            setTimeout(() => {
                cell.classList.remove('history-undo-animation');
            }, 300);
        }
    }

    animateRedo(cell) {
        if (cell) {
            cell.classList.add('history-redo-animation');
            setTimeout(() => {
                cell.classList.remove('history-redo-animation');
            }, 300);
        }
    }

    getCellByIndex(index) {
        const cells = document.querySelectorAll('.cell');
        return cells[index] || null;
    }

    clearHistory() {
        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
            this.history = [];
            this.currentIndex = -1;
            this.updateButtonStates();
            this.updateHistoryPanel();
            this.saveHistoryToStorage();
        }
    }

    saveHistoryToStorage() {
        try {
            const data = {
                history: this.history,
                currentIndex: this.currentIndex
            };
            localStorage.setItem('sudoku-history', JSON.stringify(data));
        } catch (e) {
            console.warn('Erro ao salvar histórico:', e);
        }
    }

    loadHistoryFromStorage() {
        try {
            const saved = localStorage.getItem('sudoku-history');
            if (saved) {
                const data = JSON.parse(saved);
                this.history = data.history || [];
                this.currentIndex = data.currentIndex || -1;
                this.updateButtonStates();
            }
        } catch (e) {
            console.warn('Erro ao carregar histórico:', e);
        }
    }

    reset() {
        this.history = [];
        this.currentIndex = -1;
        this.updateButtonStates();
        this.updateHistoryPanel();
        this.toggleHistoryPanel(false);
        localStorage.removeItem('sudoku-history');
    }

    getStatistics() {
        return {
            totalMoves: this.history.length,
            placeMoves: this.history.filter(m => m.moveType === 'place').length,
            eraseMoves: this.history.filter(m => m.moveType === 'erase').length,
            changeMoves: this.history.filter(m => m.moveType === 'change').length
        };
    }
}
