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
        const hintsBtn = document.createElement('button');
        hintsBtn.className = 'hints-btn';
        hintsBtn.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            <span>Dica</span>
            <span class="hints-counter">${this.hintsUsed}/${this.maxHints}</span>
        `;
        hintsBtn.title = 'Obter dica inteligente';
        hintsBtn.addEventListener('click', () => this.getHint());

        const controlsContainer = document.querySelector('.game-controls');
        if (controlsContainer) {
            controlsContainer.appendChild(hintsBtn);
        }

        this.hintsButton = hintsBtn;
        this.updateHintsButton();
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
        if (this.hintsUsed >= this.maxHints) {
            this.showHintLimitMessage();
            return;
        }

        const hint = this.findBestHint();
        
        if (!hint) {
            this.showNoHintMessage();
            return;
        }

        this.currentHint = hint;
        this.hintsUsed++;
        this.updateHintsButton();
        this.displayHint(hint);
        this.toggleHintsPanel(true);
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
        const cells = document.querySelectorAll('.cell');
        const grid = [];
        const possibilities = [];

        // Construir grid e possibilidades
        for (let i = 0; i < 81; i++) {
            const value = cells[i].textContent.trim();
            grid[i] = value ? parseInt(value) : 0;
            
            if (!value) {
                possibilities[i] = this.calculatePossibilities(i, grid);
            } else {
                possibilities[i] = [];
            }
        }

        return { grid, possibilities, cells };
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
        // Limpar destaques anteriores
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('hint-highlight');
        });

        // Destacar células da dica
        cellIndices.forEach(index => {
            if (index !== undefined) {
                const cell = document.querySelectorAll('.cell')[index];
                if (cell) {
                    cell.classList.add('hint-highlight');
                }
            }
        });
    }

    applyCurrentHint() {
        if (!this.currentHint || this.currentHint.cellIndex === undefined) return;

        const cell = document.querySelectorAll('.cell')[this.currentHint.cellIndex];
        if (cell) {
            cell.textContent = this.currentHint.number;
            
            // Notificar outros sistemas
            const event = new CustomEvent('sudoku-cell-changed', {
                detail: {
                    cellIndex: this.currentHint.cellIndex,
                    previousValue: '',
                    newValue: this.currentHint.number,
                    isHint: true
                }
            });
            document.dispatchEvent(event);

            this.animateHintApplication(cell);
            this.toggleHintsPanel(false);
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
        const counter = this.hintsButton.querySelector('.hints-counter');
        counter.textContent = `${this.hintsUsed}/${this.maxHints}`;
        
        this.hintsButton.disabled = this.hintsUsed >= this.maxHints;
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
        this.hintsUsed = 0;
        this.currentHint = null;
        this.updateHintsButton();
        this.updateHintsStats();
        this.toggleHintsPanel(false);
        
        // Limpar destaques
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('hint-highlight');
        });
    }

    setMaxHints(max) {
        this.maxHints = max;
        this.updateHintsButton();
        this.updateHintsStats();
    }
}
