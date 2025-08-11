/**
 * Classe principal do Jogo de Sudoku
 * Gerencia toda a lógica do jogo, renderização e interações
 */

import { Validator } from './validator.js';
import { getCurrentTranslations } from './translations.js';
import { 
    getElementById, 
    addClass, 
    removeClass, 
    showModal, 
    hideModal, 
    getRelativeCoordinates,
    debounce 
} from '../utils/dom-helpers.js';

export class SudokuGame {
    constructor(canvasId) {
        this.canvas = getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas não encontrado:', canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.loader = getElementById('loader-container');
        this.hintBtn = getElementById('hint-btn');
        
        // Configurações do jogo
        this.difficulty = 'medium';
        this.validator = new Validator();
        
        // Gerador simples embutido
        this.puzzles = {
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
            }
        };
        
        // Estado do jogo
        this.selected = { row: -1, col: -1 };
        this.initialBoard = null;
        this.playerBoard = null;
        this.solution = null;
        this.conflicts = null;
        this.hintsLeft = 3;
        
        // Configurações de renderização
        this.boardSize = 0;
        this.cellSize = 0;
        
        // Sistemas avançados (opcionais)
        this.highlightSystem = null;
        this.numberCounter = null;
        this.notesSystem = null;
        this.historySystem = null;
        this.hintsSystem = null;
        
        // Força inicialização imediata
        setTimeout(() => this.init(), 0);
    }

    /**
     * Inicializa o jogo
     */
    init() {
        this.setupCanvas();
        
        // Desenha um grid vazio imediatamente
        this.drawInitialGrid();
        
        // Inicializa sistemas avançados de forma assíncrona
        this.initializeAdvancedSystems();
        
        // Inicia o jogo
        this.startNewGame();
        
        // Adiciona event listeners
        this.addEventListeners();
        
        // Adiciona listener para redimensionamento com debounce
        window.addEventListener('resize', debounce(() => this.resizeAndDraw(), 250));
    }

    /**
     * Inicializa os sistemas avançados de forma assíncrona
     */
    async initializeAdvancedSystems() {
        try {
            // Importar e inicializar sistemas avançados
            try {
                const { HighlightSystem } = await import('./highlight-system.js');
                this.highlightSystem = new HighlightSystem(this);
            } catch (error) {
                console.warn('HighlightSystem não disponível');
            }
            
            try {
                const { NumberCounter } = await import('./number-counter.js');
                this.numberCounter = new NumberCounter(this);
            } catch (error) {
                console.warn('NumberCounter não disponível');
            }
            
            try {
                const { NotesSystem } = await import('./notes-system.js');
                this.notesSystem = new NotesSystem(this);
            } catch (error) {
                console.warn('NotesSystem não disponível');
            }
            
            try {
                const { HistorySystem } = await import('./history-system.js');
                this.historySystem = new HistorySystem(this);
            } catch (error) {
                console.warn('HistorySystem não disponível');
            }
            
            try {
                const { HintsSystem } = await import('./hints-system.js');
                this.hintsSystem = new HintsSystem(this);
            } catch (error) {
                console.warn('HintsSystem não disponível');
            }
            
            // Criar controles móveis
            this.createMobileControls();
            
        } catch (error) {
            console.warn('Sistemas avançados não disponíveis, usando funcionalidade básica');
        }
    }

    /**
     * Configura as dimensões do canvas
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const size = container.clientWidth;
        this.canvas.width = size;
        this.canvas.height = size;
        this.boardSize = size;
        this.cellSize = this.boardSize / 9;
    }

    /**
     * Desenha um grid inicial vazio para mostrar que o jogo está carregado
     */
    drawInitialGrid() {
        this.ctx.clearRect(0, 0, this.boardSize, this.boardSize);
        this.drawGrid();
        
        // Desenha texto "Carregando..." no centro
        this.ctx.font = `${this.cellSize * 0.3}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#999';
        this.ctx.fillText('Carregando...', this.boardSize / 2, this.boardSize / 2);
    }

    /**
     * Inicia um novo jogo
     */
    startNewGame() {
        this.showLoader();
        
        // Limpa o canvas e mostra estado de carregamento
        this.drawInitialGrid();
        
        // Usa setTimeout para não bloquear a UI durante a geração
        setTimeout(() => {
            try {
                // Seleciona puzzle baseado na dificuldade
                const difficultyKey = (this.difficulty === 'easy' || this.difficulty === 'facil') ? 'easy' : 'medium';
                const selectedPuzzle = this.puzzles[difficultyKey];
                
                if (selectedPuzzle && selectedPuzzle.puzzle && selectedPuzzle.solution) {
                    this.initialBoard = selectedPuzzle.puzzle.map(row => [...row]);
                    this.solution = selectedPuzzle.solution.map(row => [...row]);
                    this.playerBoard = this.initialBoard.map(row => [...row]);
                    this.conflicts = this.createEmptyGrid(false);
                    this.selected = { row: -1, col: -1 };
                    this.hintsLeft = 3;
                    
                    // Reset dos sistemas avançados
                    this.resetAdvancedSystems();
                    
                    this.updateHintButton();
                    this.updateConflicts();
                    
                    // Força o desenho imediato
                    this.draw();
                    this.hideLoader();
                    
                    // Força um redesenho após um breve delay
                    setTimeout(() => this.draw(), 100);
                    
                    // Notificar início de novo jogo
                    this.dispatchGameEvent('new-game');
                } else {
                    throw new Error('Puzzle não encontrado');
                }
            } catch (error) {
                console.error('Erro ao gerar puzzle:', error);
                this.createFallbackGame();
            }
        }, 10);
    }

    /**
     * Cria um jogo de fallback em caso de erro
     */
    createFallbackGame() {
        // Puzzle simples para fallback
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
        
        this.initialBoard = fallbackPuzzle;
        this.solution = fallbackSolution;
        this.playerBoard = this.initialBoard.map(row => [...row]);
        this.conflicts = this.createEmptyGrid(false);
        this.selected = { row: -1, col: -1 };
        this.hintsLeft = 3;
        
        try {
            this.updateHintButton();
            this.updateConflicts();
            this.draw();
            
            // Força um redesenho após um breve delay
            setTimeout(() => this.draw(), 100);
        } catch (error) {
            console.error('Erro crítico no fallback:', error);
        }
        
        this.hideLoader();
    }

    /**
     * Reset dos sistemas avançados
     */
    resetAdvancedSystems() {
        try {
            if (this.highlightSystem) {
                this.highlightSystem.clearHighlight();
            }
            
            if (this.numberCounter) {
                this.numberCounter.reset();
            }
            
            if (this.notesSystem) {
                this.notesSystem.reset();
            }
            
            if (this.historySystem) {
                this.historySystem.reset();
            }
            
            if (this.hintsSystem) {
                this.hintsSystem.reset();
            }
        } catch (error) {
            console.warn('Erro ao resetar sistemas avançados:', error);
        }
    }

    /**
     * Reseta o tabuleiro para o estado inicial
     */
    resetBoard() {
        if (!this.initialBoard) return;
        
        this.playerBoard = this.initialBoard.map(row => [...row]);
        this.updateConflicts();
        this.draw();
        
        // Reset dos sistemas avançados
        this.resetAdvancedSystems();
        
        this.dispatchGameEvent('reset');
    }

    /**
     * Mostra o loader
     */
    showLoader() {
        if (this.loader) {
            removeClass(this.loader, 'hidden');
        }
    }

    /**
     * Esconde o loader
     */
    hideLoader() {
        if (this.loader) {
            addClass(this.loader, 'hidden');
        }
    }

    /**
     * Cria uma grade vazia com valor inicial
     */
    createEmptyGrid(initialValue) {
        return Array(9).fill().map(() => Array(9).fill(initialValue));
    }

    /**
     * Adiciona os event listeners
     */
    addEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleCanvasClick(e));
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Event listeners para botões
        getElementById('new-game-btn')?.addEventListener('click', () => this.startNewGame());
        getElementById('reset-btn')?.addEventListener('click', () => this.resetBoard());
        getElementById('hint-btn')?.addEventListener('click', () => this.useHint());
        
        // Difficulty selector
        getElementById('difficulty-select')?.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.startNewGame();
        });
    }

    /**
     * Manipula cliques no canvas
     */
    handleCanvasClick(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < 9 && col >= 0 && col < 9) {
            this.selected = { row, col };
            this.draw();
            
            // Notificar seleção para sistemas avançados
            const cellValue = this.playerBoard[row][col];
            if (this.highlightSystem && cellValue !== 0) {
                this.highlightSystem.selectNumber(cellValue);
            }
        }
    }

    /**
     * Manipula teclas pressionadas
     */
    handleKeyDown(e) {
        const key = e.key;
        
        // Números 1-9
        if (/^[1-9]$/.test(key)) {
            const num = parseInt(key);
            if (this.selected.row !== -1 && this.selected.col !== -1) {
                this.placeNumber(this.selected.row, this.selected.col, num);
            }
        }
        
        // Teclas de navegação
        else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            this.moveSelection(key);
        }
        
        // Delete/Backspace para apagar
        else if (['Delete', 'Backspace'].includes(key)) {
            if (this.selected.row !== -1 && this.selected.col !== -1) {
                this.placeNumber(this.selected.row, this.selected.col, 0);
            }
        }
    }

    /**
     * Move a seleção com as setas do teclado
     */
    moveSelection(key) {
        if (this.selected.row === -1 || this.selected.col === -1) {
            this.selected = { row: 4, col: 4 }; // Centro do tabuleiro
        } else {
            switch (key) {
                case 'ArrowUp':
                    this.selected.row = Math.max(0, this.selected.row - 1);
                    break;
                case 'ArrowDown':
                    this.selected.row = Math.min(8, this.selected.row + 1);
                    break;
                case 'ArrowLeft':
                    this.selected.col = Math.max(0, this.selected.col - 1);
                    break;
                case 'ArrowRight':
                    this.selected.col = Math.min(8, this.selected.col + 1);
                    break;
            }
        }
        this.draw();
    }

    /**
     * Coloca um número no tabuleiro
     */
    placeNumber(row, col, num) {
        // Não pode alterar números originais
        if (this.initialBoard[row][col] !== 0) return;
        
        const previousValue = this.playerBoard[row][col];
        
        // Só atualiza se o valor mudou
        if (previousValue === num) return;
        
        this.playerBoard[row][col] = num;
        this.updateConflicts();
        this.draw();
        
        // Notificar mudança para sistemas avançados
        const cellIndex = row * 9 + col;
        this.dispatchCellChange(cellIndex, previousValue, num);
        
        // Verificar se o jogo foi completado
        if (this.checkWinCondition()) {
            this.showWinModal();
        }
        
        // Atualizar sistema de notas se uma célula foi preenchida
        if (num !== 0 && this.notesSystem) {
            this.notesSystem.onCellFilled(cellIndex, num);
        }
    }

    /**
     * Usa uma dica
     */
    useHint() {
        if (this.hintsLeft <= 0) return;
        
        // Usar sistema de dicas se disponível
        if (this.hintsSystem) {
            this.hintsSystem.getHint();
            return;
        }
        
        // Dica básica como fallback
        const emptyCells = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.playerBoard[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) return;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const correctNumber = this.solution[randomCell.row][randomCell.col];
        
        this.placeNumber(randomCell.row, randomCell.col, correctNumber);
        this.hintsLeft--;
        this.updateHintButton();
    }

    /**
     * Atualiza o botão de dica
     */
    updateHintButton() {
        if (this.hintBtn) {
            const t = getCurrentTranslations();
            this.hintBtn.textContent = `${t.hint} (${this.hintsLeft})`;
            this.hintBtn.disabled = this.hintsLeft <= 0;
        }
    }

    /**
     * Mostra a resposta completa
     */
    showAnswer() {
        this.playerBoard = this.solution.map(row => [...row]);
        this.updateConflicts();
        this.draw();
        this.showWinModal();
    }

    /**
     * Atualiza os conflitos
     */
    updateConflicts() {
        this.conflicts = this.createEmptyGrid(false);
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.playerBoard[row][col] !== 0) {
                    if (!this.validator.isValidPlacement(this.playerBoard, row, col, this.playerBoard[row][col])) {
                        this.conflicts[row][col] = true;
                    }
                }
            }
        }
    }

    /**
     * Verifica se o jogo foi vencido
     */
    checkWinCondition() {
        // Verifica se todas as células estão preenchidas
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.playerBoard[row][col] === 0) return false;
            }
        }
        
        // Verifica se não há conflitos
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.conflicts[row][col]) return false;
            }
        }
        
        return true;
    }

    /**
     * Mostra o modal de vitória
     */
    showWinModal() {
        setTimeout(() => {
            showModal('success-modal');
            this.dispatchGameEvent('complete');
        }, 100);
    }

    /**
     * Mostra modal de confirmação
     */
    showConfirmModal() {
        showModal('confirm-modal');
    }

    /**
     * Define a dificuldade
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    /**
     * Despacha evento de mudança de célula
     */
    dispatchCellChange(cellIndex, previousValue, newValue) {
        const event = new CustomEvent('sudoku-cell-changed', {
            detail: {
                cellIndex,
                previousValue,
                newValue,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Despacha evento genérico do jogo
     */
    dispatchGameEvent(type, data = {}) {
        const event = new CustomEvent(`sudoku-game-${type}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * Cria controles móveis para os recursos avançados
     */
    createMobileControls() {
        // Verificar se é dispositivo móvel
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile) return;
        
        // Criar painel de controles flutuante
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls-panel';
        mobileControls.innerHTML = `
            <div class="mobile-controls-header">
                <h4>Controles</h4>
                <button class="mobile-controls-toggle">▼</button>
            </div>
            <div class="mobile-controls-content">
                <div class="mobile-control-section">
                    <h5>Números</h5>
                    <div class="mobile-number-pad">
                        ${Array.from({length: 9}, (_, i) => 
                            `<button class="mobile-num-btn" data-number="${i + 1}">${i + 1}</button>`
                        ).join('')}
                        <button class="mobile-num-btn mobile-erase-btn" data-number="0">⌫</button>
                    </div>
                </div>
                <div class="mobile-control-section">
                    <h5>Ações</h5>
                    <div class="mobile-action-buttons">
                        <button class="mobile-action-btn mobile-notes-btn">
                            <span>📝</span>
                            <span>Notas</span>
                        </button>
                        <button class="mobile-action-btn mobile-hint-btn">
                            <span>💡</span>
                            <span>Dica</span>
                        </button>
                        <button class="mobile-action-btn mobile-undo-btn">
                            <span>↶</span>
                            <span>Desfazer</span>
                        </button>
                        <button class="mobile-action-btn mobile-redo-btn">
                            <span>↷</span>
                            <span>Refazer</span>
                        </button>
                    </div>
                </div>
                <div class="mobile-control-section">
                    <h5>Controles do Jogo</h5>
                    <div class="mobile-game-buttons">
                        <button class="mobile-game-btn mobile-new-game-btn">Novo Jogo</button>
                        <button class="mobile-game-btn mobile-reset-btn">Resetar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(mobileControls);
        
        // Event listeners para controles móveis
        this.setupMobileControlEvents(mobileControls);
    }

    /**
     * Configura eventos dos controles móveis
     */
    setupMobileControlEvents(controlsPanel) {
        // Toggle do painel
        const toggle = controlsPanel.querySelector('.mobile-controls-toggle');
        const content = controlsPanel.querySelector('.mobile-controls-content');
        let isExpanded = false;
        
        toggle.addEventListener('click', () => {
            isExpanded = !isExpanded;
            content.style.display = isExpanded ? 'block' : 'none';
            toggle.textContent = isExpanded ? '▲' : '▼';
        });
        
        // Botões de números
        controlsPanel.querySelectorAll('.mobile-num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.number);
                if (this.selected.row !== -1 && this.selected.col !== -1) {
                    this.placeNumber(this.selected.row, this.selected.col, number);
                }
                btn.classList.add('mobile-btn-pressed');
                setTimeout(() => btn.classList.remove('mobile-btn-pressed'), 150);
            });
        });
        
        // Botão de notas
        const notesBtn = controlsPanel.querySelector('.mobile-notes-btn');
        notesBtn.addEventListener('click', () => {
            if (this.notesSystem) {
                this.notesSystem.toggleNotesMode();
            }
            notesBtn.classList.add('mobile-btn-pressed');
            setTimeout(() => notesBtn.classList.remove('mobile-btn-pressed'), 150);
        });
        
        // Botão de dica
        const hintBtn = controlsPanel.querySelector('.mobile-hint-btn');
        hintBtn.addEventListener('click', () => {
            this.useHint();
            hintBtn.classList.add('mobile-btn-pressed');
            setTimeout(() => hintBtn.classList.remove('mobile-btn-pressed'), 150);
        });
        
        // Botões de undo/redo
        const undoBtn = controlsPanel.querySelector('.mobile-undo-btn');
        const redoBtn = controlsPanel.querySelector('.mobile-redo-btn');
        
        undoBtn.addEventListener('click', () => {
            if (this.historySystem) {
                this.historySystem.undo();
            }
            undoBtn.classList.add('mobile-btn-pressed');
            setTimeout(() => undoBtn.classList.remove('mobile-btn-pressed'), 150);
        });
        
        redoBtn.addEventListener('click', () => {
            if (this.historySystem) {
                this.historySystem.redo();
            }
            redoBtn.classList.add('mobile-btn-pressed');
            setTimeout(() => redoBtn.classList.remove('mobile-btn-pressed'), 150);
        });
        
        // Botões do jogo
        const newGameBtn = controlsPanel.querySelector('.mobile-new-game-btn');
        const resetBtn = controlsPanel.querySelector('.mobile-reset-btn');
        
        newGameBtn.addEventListener('click', () => {
            this.startNewGame();
            newGameBtn.classList.add('mobile-btn-pressed');
            setTimeout(() => newGameBtn.classList.remove('mobile-btn-pressed'), 150);
        });
        
        resetBtn.addEventListener('click', () => {
            this.resetBoard();
            resetBtn.classList.add('mobile-btn-pressed');
            setTimeout(() => resetBtn.classList.remove('mobile-btn-pressed'), 150);
        });
    }

    /**
     * Desenha o tabuleiro
     */
    draw() {
        if (!this.ctx || !this.boardSize || !this.cellSize) {
            console.warn('Canvas não inicializado corretamente');
            this.setupCanvas();
            return;
        }
        
        this.ctx.clearRect(0, 0, this.boardSize, this.boardSize);
        this.drawGrid();
        
        if (this.playerBoard) {
            this.drawNumbers();
        }
        
        this.drawSelection();
    }

    /**
     * Desenha a grade
     */
    drawGrid() {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        
        // Linhas horizontais e verticais
        for (let i = 0; i <= 9; i++) {
            const pos = i * this.cellSize;
            
            // Linhas mais grossas para separar os quadrantes 3x3
            if (i % 3 === 0) {
                this.ctx.lineWidth = 3;
                this.ctx.strokeStyle = '#333';
            } else {
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = '#ddd';
            }
            
            // Linha horizontal
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.boardSize, pos);
            this.ctx.stroke();
            
            // Linha vertical
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.boardSize);
            this.ctx.stroke();
        }
    }

    /**
     * Desenha os números
     */
    drawNumbers() {
        if (!this.playerBoard) {
            return;
        }
        
        this.ctx.font = `${this.cellSize * 0.6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const number = this.playerBoard[row][col];
                if (number !== 0) {
                    const x = col * this.cellSize + this.cellSize / 2;
                    const y = row * this.cellSize + this.cellSize / 2;
                    
                    // Cor diferente para números originais vs inseridos pelo jogador
                    if (this.initialBoard && this.initialBoard[row][col] !== 0) {
                        this.ctx.fillStyle = '#000';
                    } else if (this.conflicts && this.conflicts[row][col]) {
                        this.ctx.fillStyle = '#e74c3c';
                    } else {
                        this.ctx.fillStyle = '#3498db';
                    }
                    
                    this.ctx.fillText(number.toString(), x, y);
                }
            }
        }
    }

    /**
     * Desenha a seleção atual
     */
    drawSelection() {
        if (this.selected.row >= 0 && this.selected.col >= 0) {
            const x = this.selected.col * this.cellSize;
            const y = this.selected.row * this.cellSize;
            
            this.ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            
            this.ctx.strokeStyle = '#3498db';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        }
    }

    /**
     * Redimensiona e redesenha
     */
    resizeAndDraw() {
        this.setupCanvas();
        this.draw();
    }

    /**
     * Getters para sistemas avançados
     */
    getCurrentGrid() {
        return this.playerBoard;
    }

    getOriginalGrid() {
        return this.initialBoard;
    }

    getSolution() {
        return this.solution;
    }

    getSelectedCell() {
        return this.selected;
    }

    getDifficulty() {
        return this.difficulty;
    }
}
