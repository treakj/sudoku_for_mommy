/**
 * Classe principal do Jogo de Sudoku
 * Gerencia toda a lógica do jogo, renderização e interações
 */

import { SudokuGenerator } from './sudoku-generator.js';
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
        this.generator = new SudokuGenerator();
        
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
        
        this.init();
    }

    /**
     * Inicializa o jogo
     */
    init() {
        this.setupCanvas();
        this.initializeAdvancedSystems();
        this.startNewGame();
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
            const { HighlightSystem } = await import('./highlight-system.js');
            this.highlightSystem = new HighlightSystem(this);
            
            const { NumberCounter } = await import('./number-counter.js');
            this.numberCounter = new NumberCounter(this);
            
            const { NotesSystem } = await import('./notes-system.js');
            this.notesSystem = new NotesSystem(this);
            
            const { HistorySystem } = await import('./history-system.js');
            this.historySystem = new HistorySystem(this);
            
            const { HintsSystem } = await import('./hints-system.js');
            this.hintsSystem = new HintsSystem(this);
            
            console.log('✅ Sistemas avançados inicializados com sucesso');
            
            // Criar controles móveis
            this.createMobileControls();
            
        } catch (error) {
            console.warn('⚠️ Alguns sistemas avançados não puderam ser carregados:', error);
            console.warn('Continuando com funcionalidade básica...');
        }
    }
        this.startNewGame();
        this.addEventListeners();
        
        // Adiciona listener para redimensionamento com debounce
        window.addEventListener('resize', debounce(() => this.resizeAndDraw(), 250));
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
     * Inicia um novo jogo
     */
    startNewGame() {
        this.showLoader();
        
        // Usa setTimeout para não bloquear a UI durante a geração
        setTimeout(() => {
            const { puzzle, solution } = this.generator.generate(this.difficulty);
            this.initialBoard = puzzle;
            this.solution = solution;
            this.playerBoard = this.initialBoard.map(row => [...row]);
            this.conflicts = this.createEmptyGrid(false);
            this.selected = { row: -1, col: -1 };
            this.hintsLeft = 3;
            
            this.updateHintButton();
            this.updateConflicts();
            this.draw();
            this.hideLoader();
        }, 50);
    }

    /**
     * Reseta o tabuleiro para o estado inicial
     */
    resetBoard() {
        if (!this.initialBoard) return;
        
        this.playerBoard = this.initialBoard.map(row => [...row]);
        this.updateConflicts();
        this.draw();
    }

    /**
     * Mostra o loader
     */
    showLoader() {
        removeClass(this.loader, 'hidden');
    }

    /**
     * Esconde o loader
     */
    hideLoader() {
        addClass(this.loader, 'hidden');
    }

    /**
     * Cria uma grade vazia
     * @param {any} initialValue - Valor inicial para as células
     * @returns {any[][]} Grade vazia
     */
    createEmptyGrid(initialValue) {
        return Array(9).fill(0).map(() => Array(9).fill(initialValue));
    }

    /**
     * Adiciona event listeners
     */
    addEventListeners() {
        // Canvas events
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        this.canvas.addEventListener('touchstart', this.handleCanvasClick.bind(this), { passive: true });
        
        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Hint button
        this.hintBtn.addEventListener('click', this.useHint.bind(this));
        
        // Torna o canvas focável para eventos de teclado
        this.canvas.setAttribute('tabindex', '0');
    }

    /**
     * Manipula clicks no canvas
     * @param {Event} e - Evento de click/touch
     */
    handleCanvasClick(e) {
        e.preventDefault();
        
        const { x, y } = getRelativeCoordinates(e, this.canvas);
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (col >= 0 && col < 9 && row >= 0 && row < 9) {
            this.selected = { row, col };
            this.draw();
            this.canvas.focus(); // Garante foco para eventos de teclado
        }
    }

    /**
     * Manipula eventos de teclado
     * @param {KeyboardEvent} e - Evento de teclado
     */
    handleKeyDown(e) {
        if (this.selected.row === -1) return;
        
        if (e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            this.placeNumber(this.selected.row, this.selected.col, parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            e.preventDefault();
            this.placeNumber(this.selected.row, this.selected.col, 0);
        } else if (e.key.startsWith('Arrow')) {
            e.preventDefault();
            this.moveSelection(e.key);
        }
    }

    /**
     * Move a seleção com as setas do teclado
     * @param {string} key - Tecla pressionada
     */
    moveSelection(key) {
        let { row, col } = this.selected;
        
        switch (key) {
            case 'ArrowUp':
                if (row > 0) row--;
                break;
            case 'ArrowDown':
                if (row < 8) row++;
                break;
            case 'ArrowLeft':
                if (col > 0) col--;
                break;
            case 'ArrowRight':
                if (col < 8) col++;
                break;
        }
        
        this.selected = { row, col };
        this.draw();
    }

    /**
     * Coloca um número no tabuleiro
     * @param {number} row - Linha
     * @param {number} col - Coluna
     * @param {number} num - Número (0 para limpar)
     */
    placeNumber(row, col, num) {
        // Não permite modificar células iniciais
        if (row === -1 || (this.initialBoard && this.initialBoard[row][col] !== 0)) {
            return;
        }
        
        this.playerBoard[row][col] = num;
        this.updateConflicts();
        this.draw();
        this.checkWinCondition();
    }

    /**
     * Usa uma dica
     */
    useHint() {
        if (this.hintsLeft <= 0) return;
        
        // Encontra células vazias
        const emptyCells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.playerBoard[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            // Escolhe uma célula aleatória
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const { r, c } = randomCell;
            const correctNumber = this.solution[r][c];
            
            this.placeNumber(r, c, correctNumber);
            this.hintsLeft--;
            this.updateHintButton();
        }
    }

    /**
     * Atualiza o botão de dica
     */
    updateHintButton() {
        const t = getCurrentTranslations();
        this.hintBtn.textContent = `${t.hint} (${this.hintsLeft})`;
        this.hintBtn.disabled = this.hintsLeft <= 0;
    }

    /**
     * Mostra a resposta completa
     */
    showAnswer() {
        this.playerBoard = this.solution.map(row => [...row]);
        this.updateConflicts();
        this.draw();
    }

    /**
     * Atualiza o grid de conflitos
     */
    updateConflicts() {
        this.conflicts = this.validator.findConflicts(this.playerBoard);
    }

    /**
     * Verifica condição de vitória
     */
    checkWinCondition() {
        if (this.validator.isBoardComplete(this.playerBoard)) {
            this.showWinModal();
        }
    }

    /**
     * Mostra modal de vitória
     */
    showWinModal() {
        const modal = getElementById('win-modal');
        showModal(modal);
    }

    /**
     * Mostra modal de confirmação
     */
    showConfirmModal() {
        const modal = getElementById('confirm-modal');
        showModal(modal);
    }

    /**
     * Esconde modal de confirmação
     */
    hideConfirmModal() {
        const modal = getElementById('confirm-modal');
        hideModal(modal);
    }

    /**
     * Desenha o tabuleiro completo
     */
    draw() {
        this.ctx.clearRect(0, 0, this.boardSize, this.boardSize);
        this.drawHighlights();
        this.drawGrid();
        this.drawNumbers();
    }

    /**
     * Desenha as linhas do grid
     */
    drawGrid() {
        this.ctx.strokeStyle = '#9CA3AF';
        
        for (let i = 0; i <= 9; i++) {
            this.ctx.lineWidth = (i % 3 === 0) ? 3 : 1;
            
            // Linhas verticais
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.boardSize);
            this.ctx.stroke();
            
            // Linhas horizontais
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.boardSize, i * this.cellSize);
            this.ctx.stroke();
        }
    }

    /**
     * Desenha os highlights de seleção
     */
    drawHighlights() {
        if (this.selected.row === -1) return;
        
        const { row, col } = this.selected;
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        
        // Destaca linha e coluna
        this.ctx.fillStyle = '#EBF4FF';
        this.ctx.fillRect(0, y, this.boardSize, this.cellSize);
        this.ctx.fillRect(x, 0, this.cellSize, this.boardSize);
        
        // Destaca quadrante 3x3
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        this.ctx.fillRect(
            startCol * this.cellSize,
            startRow * this.cellSize,
            this.cellSize * 3,
            this.cellSize * 3
        );
        
        // Destaca célula selecionada
        this.ctx.fillStyle = '#BFDBFE';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    }

    /**
     * Desenha os números no tabuleiro
     */
    drawNumbers() {
        const fontSize = this.cellSize * 0.6;
        this.ctx.font = `bold ${fontSize}px 'Inter', 'Noto Sans JP', sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const num = this.playerBoard[r][c];
                if (num === 0) continue;
                
                const x = c * this.cellSize + this.cellSize / 2;
                const y = r * this.cellSize + this.cellSize / 2;
                
                // Define cor baseada no estado
                if (this.conflicts[r][c]) {
                    this.ctx.fillStyle = '#EF4444'; // Vermelho para conflitos
                } else if (this.initialBoard[r][c] !== 0) {
                    this.ctx.fillStyle = '#1F2937'; // Cinza escuro para números iniciais
                } else {
                    this.ctx.fillStyle = '#1E40AF'; // Azul para números do jogador
                }
                
                this.ctx.fillText(num.toString(), x, y);
            }
        }
    }

    /**
     * Redimensiona e redesenha o canvas
     */
    resizeAndDraw() {
        this.setupCanvas();
        this.draw();
    }

    /**
     * Define a dificuldade do jogo
     * @param {string} difficulty - Nova dificuldade
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
}
