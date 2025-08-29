/**
 * Sistema de dicas inteligentes para Sudoku
 * Fornece dicas contextuais e estratégias para resolver o puzzle
 */

export class HintsSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.hintsUsed = 0;
        this.maxHints = 5; // Limite de dicas por jogo
        this.hintStrategies = [];
        this.panel = null;
        this.isPanelVisible = false;
        this.currentHint = null;
        this.setup();
    }

    setup() {
        this.initializeStrategies();
        this.createHintsPanel();
        this.createHintsButton();
        this.attachEventListeners();
    }

    initializeStrategies() {
        this.hintStrategies = [
            {
                name: 'naked_single',
                priority: 1,
                description: 'Número único possível',
                check: this.checkNakedSingle.bind(this)
            },
            {
                name: 'hidden_single',
                priority: 2,
                description: 'Único local possível',
                check: this.checkHiddenSingle.bind(this)
            },
            {
                name: 'naked_pair',
                priority: 3,
                description: 'Par exposto',
                check: this.checkNakedPair.bind(this)
            },
            {
                name: 'pointing_pair',
                priority: 4,
                description: 'Par direcionado',
                check: this.checkPointingPair.bind(this)
            },
            {
                name: 'box_line_reduction',
                priority: 5,
                description: 'Redução de linha/caixa',
                check: this.checkBoxLineReduction.bind(this)
            }
        ];
    }

    createHintsButton() {
        // Garantir que o event listener está funcionando
        this.hintsButton = document.getElementById('hint-btn');
        if (this.hintsButton) {
            // Remover listeners existentes
            this.hintsButton.replaceWith(this.hintsButton.cloneNode(true));
            this.hintsButton = document.getElementById('hint-btn');
            this.hintsButton.addEventListener('click', () => this.getHint());
            this.updateHintsButton();
        }
    }

    createHintsPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'hints-panel';
        this.panel.innerHTML = `
            <div class="hints-panel-header">
                <h3>Dicas Inteligentes</h3>
                <button class="hints-close-btn" title="Fechar painel">×</button>
            </div>
            <div class="hints-panel-content">
                <div class="hint-content">
                    <div class="hint-placeholder">
                        Clique em "Dica" para receber uma sugestão inteligente baseada na situação atual do jogo.
                    </div>
                </div>
                <div class="hint-actions">
                    <button class="hint-apply-btn" style="display: none;">Aplicar Dica</button>
                    <button class="hint-explain-btn" style="display: none;">Ver Explicação</button>
                </div>
                <div class="hints-stats">
                    <div class="stat-item">
                        <span class="stat-label">Dicas usadas:</span>
                        <span class="stat-value hints-used-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Dicas restantes:</span>
                        <span class="stat-value hints-remaining-count">${this.maxHints}</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.panel);

        // Event listeners do painel
        this.panel.querySelector('.hints-close-btn').addEventListener('click', () => {
            this.toggleHintsPanel(false);
        });

        this.panel.querySelector('.hint-apply-btn').addEventListener('click', () => {
            this.applyCurrentHint();
        });

        this.panel.querySelector('.hint-explain-btn').addEventListener('click', () => {
            this.showHintExplanation();
        });
    }

    attachEventListeners() {
        // Tecla H para dica rápida
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.getHint();
            }
        });

        // Fechar painel com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelVisible) {
                this.toggleHintsPanel(false);
            }
        });
    }

    getHint() {
        console.log('Getting hint...', { hintsUsed: this.hintsUsed, maxHints: this.maxHints });
        
        if (this.hintsUsed >= this.maxHints) {
            console.log('Hint limit reached');
            this.showHintLimitMessage();
            return;
        }

        const hint = this.findBestHint();
        console.log('Found hint:', hint);
        
        if (!hint) {
            this.showNoHintMessage();
            return;
        }

        this.hintsUsed++;
        this.currentHint = hint;
        this.updateHintsButton();
        this.displayHint(hint);
        this.toggleHintsPanel(true);
        
        console.log('Hint applied, used:', this.hintsUsed);
    }

    findBestHint() {
        const gameState = this.analyzeGameState();
        
        for (const strategy of this.hintStrategies) {
            const result = strategy.check(gameState);
            if (result) {
                return {
                    strategy: strategy.name,
                    description: strategy.description,
                    priority: strategy.priority,
                    ...result
                };
            }
        }
        
        return null;
    }

    analyzeGameState() {
        // Usar o grid do jogo diretamente em vez de tentar acessar células DOM inexistentes
        const grid = [];
        const possibilities = [];
        
        if (!this.game || !this.game.playerBoard) {
            console.warn('Game state not available for hints');
            return { grid: [], possibilities: [], cells: [] };
        }

        // Construir grid linear a partir da matriz 2D do jogo
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellIndex = row * 9 + col;
                const value = this.game.playerBoard[row][col];
                grid[cellIndex] = value;
                
                if (value === 0) {
                    possibilities[cellIndex] = this.calculatePossibilities(cellIndex, grid);
                } else {
                    possibilities[cellIndex] = [];
                }
            }
        }

        console.log('Game state analyzed:', { gridLength: grid.length, emptyCell: grid.filter(v => v === 0).length });
        return { grid, possibilities, cells: [] };
    }

    calculatePossibilities(cellIndex, grid) {
        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;
        const possible = [];

        for (let num = 1; num <= 9; num++) {
            if (this.isValidPlacement(row, col, num, grid)) {
                possible.push(num);
            }
        }

        return possible;
    }

    isValidPlacement(row, col, num, grid) {
        // Verificar linha
        for (let c = 0; c < 9; c++) {
            if (grid[row * 9 + c] === num) return false;
        }

        // Verificar coluna
        for (let r = 0; r < 9; r++) {
            if (grid[r * 9 + col] === num) return false;
        }

        // Verificar quadrante 3x3
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r * 9 + c] === num) return false;
            }
        }

        return true;
    }

    // Estratégias de dicas

    checkNakedSingle(gameState) {
        // Procura célula com apenas uma possibilidade
        for (let i = 0; i < 81; i++) {
            if (gameState.grid[i] === 0 && gameState.possibilities[i].length === 1) {
                const row = Math.floor(i / 9);
                const col = i % 9;
                return {
                    cellIndex: i,
                    number: gameState.possibilities[i][0],
                    message: `A célula ${String.fromCharCode(65 + col)}${row + 1} só pode ter o número ${gameState.possibilities[i][0]}.`,
                    explanation: 'Esta é uma técnica básica onde uma célula tem apenas uma possibilidade restante.',
                    highlightCells: [i]
                };
            }
        }
        return null;
    }

    checkHiddenSingle(gameState) {
        // Procura número que só pode ir em uma posição em uma região
        for (let num = 1; num <= 9; num++) {
            // Verificar linhas
            for (let row = 0; row < 9; row++) {
                const possibleCells = [];
                for (let col = 0; col < 9; col++) {
                    const cellIndex = row * 9 + col;
                    if (gameState.possibilities[cellIndex].includes(num)) {
                        possibleCells.push(cellIndex);
                    }
                }
                
                if (possibleCells.length === 1) {
                    const cellIndex = possibleCells[0];
                    const col = cellIndex % 9;
                    return {
                        cellIndex,
                        number: num,
                        message: `O número ${num} só pode ir na célula ${String.fromCharCode(65 + col)}${row + 1} nesta linha.`,
                        explanation: 'Hidden Single: O número tem apenas uma posição possível na região.',
                        highlightCells: this.getRowCells(row)
                    };
                }
            }

            // Verificar colunas e quadrantes (similar)...
        }
        return null;
    }

    checkNakedPair(gameState) {
        // Implementação simplificada do par exposto
        for (let row = 0; row < 9; row++) {
            const cells = this.getRowCells(row);
            const pairs = this.findPairsInRegion(cells, gameState.possibilities);
            
            if (pairs.length > 0) {
                return {
                    message: `Par exposto encontrado na linha ${row + 1}.`,
                    explanation: 'Duas células na mesma região têm exatamente as mesmas duas possibilidades.',
                    highlightCells: pairs[0].cells
                };
            }
        }
        return null;
    }

    checkPointingPair(gameState) {
        // Implementação básica do par direcionado
        return null; // Placeholder
    }

    checkBoxLineReduction(gameState) {
        // Implementação básica da redução de linha/caixa
        return null; // Placeholder
    }

    // Métodos auxiliares

    getRowCells(row) {
        const cells = [];
        for (let col = 0; col < 9; col++) {
            cells.push(row * 9 + col);
        }
        return cells;
    }

    getColCells(col) {
        const cells = [];
        for (let row = 0; row < 9; row++) {
            cells.push(row * 9 + col);
        }
        return cells;
    }

    getBoxCells(boxIndex) {
        const cells = [];
        const boxRow = Math.floor(boxIndex / 3) * 3;
        const boxCol = (boxIndex % 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                cells.push(r * 9 + c);
            }
        }
        return cells;
    }

    findPairsInRegion(cellIndices, possibilities) {
        const pairs = [];
        for (let i = 0; i < cellIndices.length; i++) {
            for (let j = i + 1; j < cellIndices.length; j++) {
                const cell1 = cellIndices[i];
                const cell2 = cellIndices[j];
                const poss1 = possibilities[cell1];
                const poss2 = possibilities[cell2];
                
                if (poss1.length === 2 && poss2.length === 2 &&
                    poss1[0] === poss2[0] && poss1[1] === poss2[1]) {
                    pairs.push({
                        cells: [cell1, cell2],
                        numbers: poss1
                    });
                }
            }
        }
        return pairs;
    }

    displayHint(hint) {
        const hintContent = this.panel.querySelector('.hint-content');
        const applyBtn = this.panel.querySelector('.hint-apply-btn');
        const explainBtn = this.panel.querySelector('.hint-explain-btn');

        hintContent.innerHTML = `
            <div class="hint-message">
                <h4>${hint.description}</h4>
                <p>${hint.message}</p>
            </div>
        `;

        // Mostrar botões se aplicável
        if (hint.cellIndex !== undefined && hint.number !== undefined) {
            applyBtn.style.display = 'inline-block';
        }
        explainBtn.style.display = 'inline-block';

        // Destacar células relevantes
        this.highlightHintCells(hint.highlightCells || [hint.cellIndex]);
        
        this.updateHintsStats();
    }

    highlightHintCells(cellIndices) {
        // Para o canvas game, vamos apenas focar na célula da dica
        // e deixar o sistema de highlight do jogo lidar com o destaque visual
        if (cellIndices && cellIndices.length > 0 && this.game) {
            const mainCellIndex = cellIndices[0];
            if (mainCellIndex !== undefined) {
                const row = Math.floor(mainCellIndex / 9);
                const col = mainCellIndex % 9;
                this.game.selectCell(row, col);
            }
        }
    }

    applyCurrentHint() {
        if (!this.currentHint || this.currentHint.cellIndex === undefined) {
            console.error('No current hint to apply');
            return;
        }

        const row = Math.floor(this.currentHint.cellIndex / 9);
        const col = this.currentHint.cellIndex % 9;
        
        console.log('Applying hint:', { row, col, number: this.currentHint.number, cellIndex: this.currentHint.cellIndex });
        
        // Verificar se a célula está vazia antes de aplicar
        if (this.game && this.game.playerBoard && this.game.playerBoard[row][col] !== 0) {
            console.warn('Cannot apply hint to non-empty cell');
            return;
        }
        
        // Usar o método setNumber do jogo para aplicar a dica
        if (this.game && this.game.setNumber) {
            // Salvar estado atual do modo notas
            const wasNotesMode = this.game.notesSystem?.isNotesMode || false;
            
            // Temporariamente desativar modo notas para aplicar a dica
            if (wasNotesMode && this.game.notesSystem) {
                this.game.notesSystem.setNotesMode(false);
            }
            
            // Aplicar o número da dica
            this.game.setNumber(row, col, this.currentHint.number);
            
            // Forçar redesenho do canvas
            if (this.game.draw) {
                this.game.draw();
            }
            
            this.toggleHintsPanel(false);
            
            // Restaurar modo notas após um pequeno delay se estava ativo
            if (wasNotesMode && this.game.notesSystem) {
                setTimeout(() => {
                    this.game.notesSystem.setNotesMode(true);
                }, 100);
            }
            
            // Selecionar a célula para destacá-la
            this.game.selectCell(row, col);
            
            console.log('Hint applied successfully');
        } else {
            console.error('Game setNumber method not available');
        }
    }

    showHintExplanation() {
        if (!this.currentHint) return;

        const explanation = this.currentHint.explanation || 'Explicação detalhada não disponível.';
        
        const modal = document.createElement('div');
        modal.className = 'hint-explanation-modal';
        modal.innerHTML = `
            <div class="hint-explanation-content">
                <h3>${this.currentHint.description}</h3>
                <p>${explanation}</p>
                <button class="hint-explanation-close">Entendi</button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.hint-explanation-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    animateHintApplication(cell) {
        cell.classList.add('hint-applied-animation');
        setTimeout(() => {
            cell.classList.remove('hint-applied-animation');
        }, 600);
    }

    toggleHintsPanel(show) {
        if (show === undefined) {
            show = !this.isPanelVisible;
        }

        this.isPanelVisible = show;
        this.panel.classList.toggle('hints-panel-visible', show);
    }

    updateHintsButton() {
        if (this.hintsButton) {
            const remaining = this.maxHints - this.hintsUsed;
            this.hintsButton.textContent = `💡 Dica (${remaining})`;
            this.hintsButton.disabled = remaining <= 0;
            
            console.log('Hints button updated:', { used: this.hintsUsed, max: this.maxHints, remaining });
        }
    }

    updateHintsStats() {
        const usedCount = this.panel.querySelector('.hints-used-count');
        const remainingCount = this.panel.querySelector('.hints-remaining-count');
        
        usedCount.textContent = this.hintsUsed;
        remainingCount.textContent = this.maxHints - this.hintsUsed;
    }

    showHintLimitMessage() {
        const notification = document.createElement('div');
        notification.className = 'hint-limit-notification';
        notification.textContent = 'Você já usou todas as dicas disponíveis!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showNoHintMessage() {
        const notification = document.createElement('div');
        notification.className = 'no-hint-notification';
        notification.textContent = 'Nenhuma dica disponível no momento. Continue jogando!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    reset() {
        console.log('Resetting hints system');
        this.hintsUsed = 0;
        this.currentHint = null;
        
        // Reconfigurar o botão
        this.createHintsButton();
        this.updateHintsButton();
        
        // Só atualizar stats se o painel existe
        if (this.panel) {
            this.updateHintsStats();
        }
        
        this.toggleHintsPanel(false);
    }

    setMaxHints(max) {
        this.maxHints = max;
        this.updateHintsButton();
        this.updateHintsStats();
    }
}
