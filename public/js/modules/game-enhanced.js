/**
 * Classe principal do Jogo de Sudoku
 * Gerencia toda a lógica do jogo, renderização e interações
 */

import { SudokuGenerator } from './sudoku-generator.js';
import { Validator } from './validator.js';
import { getCurrentTranslations } from './translations.js';
import { HighlightSystem } from './highlight-system.js';
import { NumberCounter } from './number-counter.js';
import { NotesSystem } from './notes-system.js';
import { HistorySystem } from './history-system.js';
import { HintsSystem } from './hints-system.js';
import { ColorSystem } from './color-system.js';
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
        
        // Sistemas avançados
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
        // Desenha grid vazio imediatamente após configurar o canvas
        this.drawEmptyGrid();
        this.initializeAdvancedSystems();
        this.startNewGame();
        this.addEventListeners();
        
        // Adiciona listener para redimensionamento com debounce
        window.addEventListener('resize', debounce(() => this.resizeAndDraw(), 250));
    }

    /**
     * Inicializa os sistemas avançados
     */
    initializeAdvancedSystems() {
        try {
            // Sistema de destaque
            this.highlightSystem = new HighlightSystem(this);
            
            // Contador de números
            this.numberCounter = new NumberCounter(this);
            
            // Sistema de notas
            this.notesSystem = new NotesSystem(this);
            
            // Sistema de histórico
            this.historySystem = new HistorySystem(this);
            
            // Sistema de dicas
            this.hintsSystem = new HintsSystem(this);
            
            // Sistema de cores
            this.colorSystem = new ColorSystem(this);
            
            console.log('✅ Sistemas avançados inicializados com sucesso');
            
            // Criar controles móveis
            this.createMobileControls();
            
        } catch (error) {
            console.warn('⚠️ Erro ao inicializar sistemas avançados:', error);
            console.warn('Continuando sem os sistemas avançados...');
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
     * Desenha um grid vazio para exibição imediata
     */
    drawEmptyGrid() {
        this.ctx.clearRect(0, 0, this.boardSize, this.boardSize);
        
        // Desenha apenas as linhas do grid
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        
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
     * Inicia um novo jogo
     */
    startNewGame() {
        // Desenha o grid vazio imediatamente para melhor experiência do usuário
        this.drawEmptyGrid();
        this.showLoader();
        
        // Usa setTimeout mínimo para não bloquear a UI durante a geração
        setTimeout(() => {
            const { puzzle, solution } = this.generator.generate(this.difficulty);
            this.initialBoard = puzzle;
            this.solution = solution;
            this.playerBoard = this.initialBoard.map(row => [...row]);
            this.conflicts = this.createEmptyGrid(false);
            this.selected = { row: -1, col: -1 };
            this.hintsLeft = 3;
            
            // Reset dos sistemas avançados
            this.resetAdvancedSystems();
            
            this.updateHintButton();
            this.updateConflicts();
            this.draw();
            this.hideLoader();
            
            // Notificar início de novo jogo
            this.dispatchGameEvent('new-game');
        }, 10);
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
            
            if (this.colorSystem) {
                this.colorSystem.reset();
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
     * Adiciona os event listeners
     */
    addEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCellClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleCellClick(e));
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Event listeners para botões
        getElementById('new-game-btn')?.addEventListener('click', () => this.startNewGame());
        getElementById('reset-btn')?.addEventListener('click', () => this.resetBoard());
        getElementById('hint-btn')?.addEventListener('click', () => this.giveHint());
        
        // Difficulty selector
        getElementById('difficulty-select')?.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.startNewGame();
        });
    }

    /**
     * Manipula cliques nas células
     */
    handleCellClick(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < 9 && col >= 0 && col < 9) {
            const cellIndex = row * 9 + col;
            
            // Verificar se deve aplicar cor com Shift+click
            if (e.shiftKey && this.colorSystem && this.colorSystem.selectedColor) {
                if (this.colorSystem.selectedColor === 'clear') {
                    this.colorSystem.clearCellColor(cellIndex);
                } else {
                    this.colorSystem.paintCell(cellIndex, this.colorSystem.selectedColor);
                }
                return; // Não selecionar a célula
            }
            
            this.selectCell(row, col);
        }
    }

    /**
     * Seleciona uma célula
     */
    selectCell(row, col) {
        this.selected = { row, col };
        this.draw();
        
        // Notificar seleção para sistemas avançados
        const cellIndex = row * 9 + col;
        const cellValue = this.playerBoard[row][col];
        
        if (this.highlightSystem && cellValue !== 0) {
            this.highlightSystem.selectNumber(cellValue);
        }
        
        // Notificar sistema de notas sobre a seleção
        if (this.notesSystem) {
            // Simular um elemento de célula para o sistema de notas
            const mockCell = {
                textContent: cellValue === 0 ? '' : cellValue.toString(),
                classList: {
                    add: () => {},
                    remove: () => {},
                    contains: () => false
                }
            };
            this.notesSystem.setActiveCell(cellValue === 0 ? mockCell : null);
        }
    }

    /**
     * Manipula teclas pressionadas
     */
    handleKeyPress(e) {
        if (this.selected.row === -1 || this.selected.col === -1) return;
        
        const key = e.key;
        
        // Números 1-9 - verificar se modo notas está ativo
        if (/^[1-9]$/.test(key)) {
            // Se modo notas está ativo, deixar o NotesSystem lidar com isso
            if (this.notesSystem && this.notesSystem.isNotesMode) {
                return; // NotesSystem já interceptou via seu próprio listener
            }
            
            const num = parseInt(key);
            this.setNumber(this.selected.row, this.selected.col, num);
        }
        
        // Teclas de navegação
        else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            this.moveSelection(key);
        }
        
        // Delete/Backspace para apagar
        else if (['Delete', 'Backspace'].includes(key)) {
            this.setNumber(this.selected.row, this.selected.col, 0);
        }
        
        // Tecla Espaço para aplicar cor selecionada
        else if (e.code === 'Space' && this.colorSystem && this.colorSystem.selectedColor) {
            e.preventDefault();
            const cellIndex = this.selected.row * 9 + this.selected.col;
            if (this.colorSystem.selectedColor === 'clear') {
                this.colorSystem.clearCellColor(cellIndex);
                this.colorSystem.showColorFeedback('Célula limpa! 🗑️');
            } else {
                this.colorSystem.paintCell(cellIndex, this.colorSystem.selectedColor);
                this.colorSystem.showColorFeedback(`Cor ${this.colorSystem.selectedColor} aplicada! ✨`);
            }
        }
    }

    /**
     * Move a seleção com as setas do teclado
     */
    moveSelection(direction) {
        let newRow = this.selected.row;
        let newCol = this.selected.col;
        
        switch (direction) {
            case 'ArrowUp':
                newRow = Math.max(0, newRow - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(8, newRow + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, newCol - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(8, newCol + 1);
                break;
        }
        
        this.selectCell(newRow, newCol);
    }

    /**
     * Define um número em uma célula
     */
    setNumber(row, col, number) {
        // Não pode alterar células originais
        if (this.initialBoard[row][col] !== 0) return;
        
        const previousValue = this.playerBoard[row][col];
        const cellIndex = row * 9 + col;
        
        // Só atualiza se o valor mudou
        if (previousValue === number) return;
        
        this.playerBoard[row][col] = number;
        this.updateConflicts();
        this.draw();
        
        // Notificar mudança para sistemas avançados
        this.dispatchCellChange(cellIndex, previousValue, number);
        
        // Verificar se o jogo foi completado
        if (this.isGameComplete()) {
            this.handleGameComplete();
        }
        
        // Atualizar sistema de notas se uma célula foi preenchida
        if (number !== 0 && this.notesSystem) {
            this.notesSystem.onCellFilled(cellIndex, number);
        }
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
     * Atualiza os conflitos no tabuleiro
     */
    updateConflicts() {
        // Atualiza conflitos no tabuleiro
        this.conflicts = this.createEmptyGrid(false);
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.playerBoard[row][col] !== 0) {
                    if (!this.validator.isMoveValid(this.playerBoard, row, col, this.playerBoard[row][col])) {
                        this.conflicts[row][col] = true;
                    }
                }
            }
        }
    }

    /**
     * Verifica se o jogo está completo
     */
    isGameComplete() {
        // Verifica se todas as células estão preenchidas
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.playerBoard[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Verifica se não há conflitos
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.conflicts[row][col]) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Manipula a conclusão do jogo
     */
    handleGameComplete() {
        // Reduz delay para melhor responsividade
        setTimeout(() => {
            showModal('success-modal');
            this.dispatchGameEvent('complete');
        }, 50);
    }

    /**
     * Fornece uma dica
     */
    giveHint() {
        if (this.hintsLeft <= 0) return;
        
        // Usar sistema de dicas se disponível
        if (this.hintsSystem) {
            this.hintsSystem.getHint();
            return;
        }
        
        // Fallback para dica básica
        this.giveBasicHint();
    }

    /**
     * Dica básica (fallback)
     */
    giveBasicHint() {
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
        
        this.setNumber(randomCell.row, randomCell.col, correctNumber);
        this.hintsLeft--;
        this.updateHintButton();
    }

    /**
     * Atualiza o botão de dica
     */
    updateHintButton() {
        if (this.hintBtn) {
            const translations = getCurrentTranslations();
            this.hintBtn.textContent = `${translations.hint} (${this.hintsLeft})`;
            this.hintBtn.disabled = this.hintsLeft <= 0;
        }
    }

    /**
     * Desenha o tabuleiro
     */
    draw() {
        this.ctx.clearRect(0, 0, this.boardSize, this.boardSize);
        this.drawCellColors();
        this.drawGrid();
        this.drawNumbers();
        this.drawSelection();
    }

    /**
     * Desenha as cores de fundo das células
     */
    drawCellColors() {
        if (!this.colorSystem || !this.colorSystem.cellColors) return;
        
        this.colorSystem.cellColors.forEach((colorName, cellIndex) => {
            const color = this.colorSystem.availableColors.find(c => c.name === colorName);
            if (!color) return;
            
            const row = Math.floor(cellIndex / 9);
            const col = cellIndex % 9;
            const x = col * this.cellSize;
            const y = row * this.cellSize;
            
            this.ctx.fillStyle = color.value;
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        });
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
                    if (this.initialBoard[row][col] !== 0) {
                        this.ctx.fillStyle = '#000000';  // Preto - números originais
                    } else if (this.conflicts[row][col]) {
                        this.ctx.fillStyle = '#dc2626';  // Vermelho - conflitos
                    } else {
                        this.ctx.fillStyle = '#1E3A8A';  // Azul - números do jogador
                    }
                    
                    this.ctx.fillText(number.toString(), x, y);
                } else {
                    // Desenhar notas se a célula estiver vazia
                    this.drawCellNotes(row, col);
                }
            }
        }
    }

    /**
     * Desenha as notas em uma célula
     */
    drawCellNotes(row, col) {
        if (!this.notesSystem || !this.notesSystem.notesData) return;
        
        const cellIndex = row * 9 + col;
        const notes = this.notesSystem.notesData.get(cellIndex);
        
        if (!notes || notes.size === 0) return;
        
        // Configuração para notas pequenas
        this.ctx.font = `${this.cellSize * 0.2}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Verificar se a célula tem cor personalizada para as notas
        let noteColor = '#F97316'; // Laranja padrão para notas
        if (this.colorSystem && this.colorSystem.cellColors.has(cellIndex)) {
            const colorName = this.colorSystem.cellColors.get(cellIndex);
            const colorData = this.colorSystem.availableColors.find(c => c.name === colorName);
            if (colorData && colorData.value) {
                // Usar uma versão mais escura da cor de fundo para as notas
                noteColor = this.darkenColor(colorData.value, 0.6);
            }
        }
        
        this.ctx.fillStyle = noteColor;
        
        // Desenhar notas em grid 3x3
        for (let i = 1; i <= 9; i++) {
            if (notes.has(i)) {
                const noteRow = Math.floor((i - 1) / 3);
                const noteCol = (i - 1) % 3;
                
                const x = col * this.cellSize + (noteCol + 0.5) * (this.cellSize / 3);
                const y = row * this.cellSize + (noteRow + 0.5) * (this.cellSize / 3);
                
                this.ctx.fillText(i.toString(), x, y);
            }
        }
    }

    /**
     * Escurece uma cor hexadecimal
     */
    darkenColor(hex, factor) {
        // Remove o #
        hex = hex.replace('#', '');
        
        // Converte para RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Escurece multiplicando por fator
        const newR = Math.round(r * factor);
        const newG = Math.round(g * factor);
        const newB = Math.round(b * factor);
        
        // Converte de volta para hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    /**
     * Desenha a seleção atual com linhas de auxílio
     */
    drawSelection() {
        if (this.selected.row >= 0 && this.selected.col >= 0) {
            const x = this.selected.col * this.cellSize;
            const y = this.selected.row * this.cellSize;
            
            // Desenhar linhas de auxílio (linha e coluna completas)
            this.ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
            // Linha horizontal
            this.ctx.fillRect(0, y, this.canvas.width, this.cellSize);
            // Linha vertical
            this.ctx.fillRect(x, 0, this.cellSize, this.canvas.height);
            
            // Destacar o quadrante 3x3
            const boxRow = Math.floor(this.selected.row / 3) * 3;
            const boxCol = Math.floor(this.selected.col / 3) * 3;
            this.ctx.fillStyle = 'rgba(52, 152, 219, 0.05)';
            this.ctx.fillRect(
                boxCol * this.cellSize, 
                boxRow * this.cellSize, 
                3 * this.cellSize, 
                3 * this.cellSize
            );
            
            // Destacar a célula selecionada
            this.ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            
            // Borda da célula selecionada
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
     * Cria uma grade vazia
     */
    createEmptyGrid(defaultValue = 0) {
        const grid = [];
        for (let i = 0; i < 9; i++) {
            grid.push(new Array(9).fill(defaultValue));
        }
        return grid;
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
                    this.setNumber(this.selected.row, this.selected.col, number);
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
            this.giveHint();
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
