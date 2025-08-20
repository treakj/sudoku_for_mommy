/**
 * Sistema de Anotações Inteligentes para Sudoku
 * Versão 0.9.2 - Modo Anotação Inteligente
 * 
 * Funcionalidades:
 * - Calcula automaticamente números possíveis para cada célula
 * - Considera restrições de linha, coluna e quadrante 3x3
 * - Permite inserir todas as anotações possíveis com espaço
 * - Integração com sistema de notas existente
 */

import { NotesSystem } from './notes-system.js';

export class SmartNotesSystem extends NotesSystem {
    constructor(gameInstance) {
        super(gameInstance);
        
        // Configurações do modo inteligente
        this.isSmartMode = false;
        this.smartToggleButton = null;
        this.spaceListenerActive = false;
        
        // Cache de possibilidades calculadas
        this.possibilitiesCache = new Map();
        this.cacheValid = false;
        
        this.setupSmartMode();
    }

    /**
     * Configura o modo de anotação inteligente
     */
    setupSmartMode() {
        this.createSmartToggle();
        this.attachSmartEventListeners();
    }

    /**
     * Cria o botão de alternância para o modo inteligente
     */
    createSmartToggle() {
        const controlsContainer = document.querySelector('.game-controls');
        if (!controlsContainer) return;

        this.smartToggleButton = document.createElement('button');
        this.smartToggleButton.id = 'smart-notes-btn';
        this.smartToggleButton.className = 'btn-control bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2';
        this.smartToggleButton.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Modo Inteligente</span>
        `;

        // Insere o botão após o botão de notas
        const notesBtn = document.getElementById('notes-btn');
        if (notesBtn && notesBtn.parentNode) {
            notesBtn.parentNode.insertBefore(this.smartToggleButton, notesBtn.nextSibling);
        } else {
            controlsContainer.appendChild(this.smartToggleButton);
        }

        this.smartToggleButton.addEventListener('click', () => this.toggleSmartMode());
    }

    /**
     * Anexa event listeners específicos do modo inteligente
     */
    attachSmartEventListeners() {
        // Atalho de teclado: S para modo inteligente
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                this.toggleSmartMode();
            }
        });

        // Espaço para inserir anotações inteligentes
        this.attachSpaceListener();
    }

    /**
     * Anexa listener para a tecla espaço
     */
    attachSpaceListener() {
        if (this.spaceListenerActive) return;

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isSmartMode && this.isNotesMode) {
                // Verifica se há uma célula selecionada
                if (this.game.selected && this.game.selected.row !== -1 && this.game.selected.col !== -1) {
                    const cellValue = this.game.playerBoard[this.game.selected.row][this.game.selected.col];
                    
                    // Só permite anotações em células vazias
                    if (cellValue === 0) {
                        e.preventDefault();
                        const cellIndex = this.game.selected.row * 9 + this.game.selected.col;
                        this.insertSmartAnnotations(cellIndex);
                    }
                }
            }
        });

        this.spaceListenerActive = true;
    }

    /**
     * Alterna o modo de anotação inteligente
     */
    toggleSmartMode() {
        this.setSmartMode(!this.isSmartMode);
    }

    /**
     * Define o estado do modo inteligente
     * @param {boolean} enabled - Se deve ativar o modo inteligente
     */
    setSmartMode(enabled) {
        this.isSmartMode = enabled;
        this.cacheValid = false; // Invalida o cache quando muda o modo

        // Atualizar visual do botão
        if (this.smartToggleButton) {
            if (enabled) {
                this.smartToggleButton.classList.remove('bg-purple-500', 'hover:bg-purple-600');
                this.smartToggleButton.classList.add('bg-green-500', 'hover:bg-green-600');
                this.smartToggleButton.style.animation = 'pulse 2s infinite';
                this.smartToggleButton.querySelector('span').textContent = 'Inteligente Ativo';
            } else {
                this.smartToggleButton.classList.remove('bg-green-500', 'hover:bg-green-600');
                this.smartToggleButton.classList.add('bg-purple-500', 'hover:bg-purple-600');
                this.smartToggleButton.style.animation = '';
                this.smartToggleButton.querySelector('span').textContent = 'Modo Inteligente';
            }
        }

        // Atualizar classe no body
        document.body.classList.toggle('smart-notes-mode', enabled);

        // Mostrar feedback visual
        this.showSmartModeFeedback(enabled);

        // Redesenhar canvas
        if (this.game && this.game.draw) {
            this.game.draw();
        }
    }

    /**
     * Calcula os números possíveis para uma célula específica
     * @param {number} row - Linha da célula (0-8)
     * @param {number} col - Coluna da célula (0-8)
     * @returns {number[]} Array de números possíveis (1-9)
     */
    calculatePossibleNumbers(row, col) {
        const cacheKey = `${row}-${col}`;
        
        // Usar cache se válido
        if (this.possibilitiesCache.has(cacheKey) && this.cacheValid) {
            return this.possibilitiesCache.get(cacheKey);
        }

        const possibleNumbers = [];
        
        // Verifica cada número de 1 a 9
        for (let num = 1; num <= 9; num++) {
            if (this.isNumberValidForCell(row, col, num)) {
                possibleNumbers.push(num);
            }
        }

        // Armazenar no cache
        this.possibilitiesCache.set(cacheKey, possibleNumbers);
        return possibleNumbers;
    }

    /**
     * Verifica se um número é válido para uma célula específica
     * @param {number} row - Linha da célula
     * @param {number} col - Coluna da célula
     * @param {number} num - Número a verificar (1-9)
     * @returns {boolean} True se o número é válido para a célula
     */
    isNumberValidForCell(row, col, num) {
        // Verificar linha
        for (let c = 0; c < 9; c++) {
            if (this.game.playerBoard[row][c] === num) {
                return false;
            }
        }

        // Verificar coluna
        for (let r = 0; r < 9; r++) {
            if (this.game.playerBoard[r][col] === num) {
                return false;
            }
        }

        // Verificar quadrante 3x3
        const quadrantRow = Math.floor(row / 3) * 3;
        const quadrantCol = Math.floor(col / 3) * 3;
        
        for (let r = quadrantRow; r < quadrantRow + 3; r++) {
            for (let c = quadrantCol; c < quadrantCol + 3; c++) {
                if (this.game.playerBoard[r][c] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Insere anotações inteligentes para uma célula
     * @param {number} cellIndex - Índice da célula (0-80)
     */
    insertSmartAnnotations(cellIndex) {
        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;
        
        // Calcular números possíveis
        const possibleNumbers = this.calculatePossibleNumbers(row, col);
        
        if (possibleNumbers.length === 0) {
            // Nenhum número possível - mostrar feedback
            this.showNoPossibilitiesFeedback();
            return;
        }

        // Limpar notas existentes na célula
        this.clearNotesByIndex(cellIndex);

        // Adicionar todas as anotações possíveis
        possibleNumbers.forEach(num => {
            this.addNoteByIndex(cellIndex, num);
        });

        // Mostrar feedback
        this.showSmartAnnotationsFeedback(possibleNumbers.length);

        // Redesenhar canvas
        if (this.game && this.game.draw) {
            this.game.draw();
        }
    }

    /**
     * Limpa o cache de possibilidades
     */
    invalidateCache() {
        this.possibilitiesCache.clear();
        this.cacheValid = false;
    }

    /**
     * Atualiza o cache quando o tabuleiro muda
     */
    updateCache() {
        this.cacheValid = true;
        this.invalidateCache();
    }

    /**
     * Mostra feedback visual para o modo inteligente
     * @param {boolean} enabled - Se o modo foi ativado ou desativado
     */
    showSmartModeFeedback(enabled) {
        const message = enabled ? 
            '🧠 Modo Inteligente Ativado! Use ESPAÇO para anotações automáticas.' : 
            'Modo Inteligente Desativado';
        
        this.showToast(message, enabled ? 'success' : 'info');
    }

    /**
     * Mostra feedback quando não há possibilidades
     */
    showNoPossibilitiesFeedback() {
        this.showToast('❌ Nenhum número possível para esta célula!', 'warning');
    }

    /**
     * Mostra feedback sobre as anotações inseridas
     * @param {number} count - Número de anotações inseridas
     */
    showSmartAnnotationsFeedback(count) {
        const message = count === 1 ? 
            `✅ 1 anotação inserida!` : 
            `✅ ${count} anotações inseridas!`;
        
        this.showToast(message, 'success');
    }

    /**
     * Mostra uma notificação toast
     * @param {string} message - Mensagem a exibir
     * @param {string} type - Tipo de notificação (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 transform translate-x-full`;
        toast.textContent = message;

        // Estilos baseados no tipo
        const styles = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };

        toast.classList.add(...styles[type].split(' '));
        document.body.appendChild(toast);

        // Animação de entrada
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Remover após 3 segundos
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Sobrescreve o método toggleNotesMode para integrar com o modo inteligente
     */
    toggleNotesMode() {
        super.toggleNotesMode();
        
        // Se desativar o modo notas, também desativa o modo inteligente
        if (!this.isNotesMode) {
            this.setSmartMode(false);
        }
    }

    /**
     * Sobrescreve o método setNotesMode para integrar com o modo inteligente
     */
    setNotesMode(enabled) {
        super.setNotesMode(enabled);
        
        // Se desativar o modo notas, também desativa o modo inteligente
        if (!enabled) {
            this.setSmartMode(false);
        }
    }

    /**
     * Atualiza o cache quando o tabuleiro é modificado
     */
    onBoardChanged() {
        this.invalidateCache();
        
        // Se o modo inteligente estiver ativo, atualizar cache
        if (this.isSmartMode) {
            this.updateCache();
        }
    }

    /**
     * Obtém informações sobre o estado do sistema inteligente
     * @returns {Object} Informações sobre o estado atual
     */
    getSmartModeInfo() {
        return {
            isSmartMode: this.isSmartMode,
            isNotesMode: this.isNotesMode,
            cacheSize: this.possibilitiesCache.size,
            cacheValid: this.cacheValid
        };
    }
}

// Estilos CSS adicionais para o modo inteligente
const smartNotesStyles = `
    .smart-notes-mode .cell:hover {
        box-shadow: 0 0 0 2px #8B5CF6;
    }
    
    .smart-notes-mode .notes-active {
        box-shadow: 0 0 0 3px #10B981 !important;
    }
    
    .toast {
        animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }
`;

// Adicionar estilos ao documento
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = smartNotesStyles;
    document.head.appendChild(style);
}