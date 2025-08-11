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
        // Botões de desfazer/refazer
        const undoBtn = document.createElement('button');
        undoBtn.className = 'history-btn undo-btn';
        undoBtn.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
            </svg>
            <span>Desfazer</span>
        `;
        undoBtn.title = 'Desfazer última jogada (Ctrl+Z)';
        undoBtn.addEventListener('click', () => this.undo());

        const redoBtn = document.createElement('button');
        redoBtn.className = 'history-btn redo-btn';
        redoBtn.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966a.25.25 0 0 1 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            <span>Refazer</span>
        `;
        redoBtn.title = 'Refazer jogada (Ctrl+Y)';
        redoBtn.addEventListener('click', () => this.redo());

        // Botão para abrir painel
        const historyBtn = document.createElement('button');
        historyBtn.className = 'history-btn history-panel-btn';
        historyBtn.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
            <span>Histórico</span>
        `;
        historyBtn.title = 'Ver histórico completo';
        historyBtn.addEventListener('click', () => this.toggleHistoryPanel());

        // Adicionar aos controles
        const controlsContainer = document.querySelector('.game-controls');
        if (controlsContainer) {
            const historyGroup = document.createElement('div');
            historyGroup.className = 'history-controls-group';
            historyGroup.appendChild(undoBtn);
            historyGroup.appendChild(redoBtn);
            historyGroup.appendChild(historyBtn);
            controlsContainer.appendChild(historyGroup);
        }

        this.undoBtn = undoBtn;
        this.redoBtn = redoBtn;
        this.historyBtn = historyBtn;
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
            timestamp: Date.now(),
            cellIndex: moveData.cellIndex,
            row: Math.floor(moveData.cellIndex / 9),
            col: moveData.cellIndex % 9,
            previousValue: moveData.previousValue || '',
            newValue: moveData.newValue || '',
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
        }

        this.currentIndex--;
        this.isRecording = true;
        this.updateButtonStates();
        this.updateHistoryPanel();
        this.animateUndo(cell);
    }

    redo() {
        if (!this.canRedo()) return;

        this.currentIndex++;
        const move = this.history[this.currentIndex];
        this.isRecording = false;

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
        }

        this.isRecording = true;
        this.updateButtonStates();
        this.updateHistoryPanel();
        this.animateRedo(cell);
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
            const position = `${String.fromCharCode(65 + move.col)}${move.row + 1}`;
            
            let description = '';
            switch (move.moveType) {
                case 'place':
                    description = `Colocou ${move.newValue} em ${position}`;
                    break;
                case 'erase':
                    description = `Apagou ${move.previousValue} de ${position}`;
                    break;
                case 'change':
                    description = `Mudou ${move.previousValue} para ${move.newValue} em ${position}`;
                    break;
                default:
                    description = `Jogada em ${position}`;
            }

            item.innerHTML = `
                <div class="history-item-content">
                    <div class="history-item-description">${description}</div>
                    <div class="history-item-time">${time}</div>
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
