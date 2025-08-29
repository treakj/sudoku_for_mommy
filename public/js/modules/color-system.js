/**
 * Sistema de Cores para Sudoku
 * Permite colorir células do tabuleiro para organização visual
 */

export class ColorSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.selectedColor = 'red';
        this.cellColors = new Map(); // cellIndex -> colorName
        
        // Cores disponíveis para as células
        this.availableColors = [
            { name: 'red', value: '#ef4444', display: 'Vermelho' },
            { name: 'blue', value: '#3b82f6', display: 'Azul' },
            { name: 'green', value: '#10b981', display: 'Verde' },
            { name: 'yellow', value: '#f59e0b', display: 'Amarelo' },
            { name: 'purple', value: '#8b5cf6', display: 'Roxo' },
            { name: 'orange', value: '#f97316', display: 'Laranja' },
            { name: 'clear', value: 'transparent', display: 'Limpar' }
        ];
        
        this.currentColorIndex = 0;
        this.setup();
    }

    setup() {
        this.loadColorsFromStorage();
        this.setupKeyboardShortcuts();
    }

    /**
     * Configura atalhos de teclado para cores
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Tecla C para alternar entre cores
            if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                this.cycleColor();
            }
        });
    }

    /**
     * Alterna entre as cores disponíveis
     */
    cycleColor() {
        this.currentColorIndex = (this.currentColorIndex + 1) % this.availableColors.length;
        this.selectedColor = this.availableColors[this.currentColorIndex].name;
        
        this.showColorFeedback(`Cor selecionada: ${this.availableColors[this.currentColorIndex].display}`);
        this.updateColorIndicator();
    }

    /**
     * Pinta uma célula com a cor especificada
     */
    paintCell(cellIndex, colorName) {
        if (colorName === 'clear') {
            this.clearCellColor(cellIndex);
            return;
        }

        this.cellColors.set(cellIndex, colorName);
        this.saveColorsToStorage();
        
        // Redesenhar para mostrar a cor
        if (this.game && this.game.draw) {
            this.game.draw();
        }
    }

    /**
     * Remove a cor de uma célula
     */
    clearCellColor(cellIndex) {
        this.cellColors.delete(cellIndex);
        this.saveColorsToStorage();
        
        // Redesenhar para remover a cor
        if (this.game && this.game.draw) {
            this.game.draw();
        }
    }

    /**
     * Remove todas as cores
     */
    clearAllColors() {
        this.cellColors.clear();
        this.saveColorsToStorage();
        
        // Redesenhar para remover todas as cores
        if (this.game && this.game.draw) {
            this.game.draw();
        }
        
        this.showColorFeedback('Todas as cores foram removidas! 🗑️');
    }

    /**
     * Obtém a cor de uma célula
     */
    getCellColor(cellIndex) {
        const colorName = this.cellColors.get(cellIndex);
        if (!colorName) return null;
        
        return this.availableColors.find(c => c.name === colorName);
    }

    /**
     * Mostra feedback visual da ação de cor
     */
    showColorFeedback(message) {
        // Criar notificação temporária
        const notification = document.createElement('div');
        notification.className = 'color-feedback fixed top-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        
        document.body.appendChild(notification);

        // Remover após 2 segundos
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    /**
     * Atualiza indicador visual da cor selecionada
     */
    updateColorIndicator() {
        // Criar ou atualizar indicador de cor no topo da tela
        let indicator = document.getElementById('color-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'color-indicator';
            indicator.className = 'fixed top-2 left-2 w-6 h-6 rounded-full border-2 border-white shadow-lg z-40';
            document.body.appendChild(indicator);
        }

        const currentColor = this.availableColors[this.currentColorIndex];
        indicator.style.backgroundColor = currentColor.value;
        indicator.title = `Cor atual: ${currentColor.display}`;
    }

    /**
     * Reseta o sistema de cores
     */
    reset() {
        this.cellColors.clear();
        this.selectedColor = 'red';
        this.currentColorIndex = 0;
        this.saveColorsToStorage();
        this.updateColorIndicator();
    }

    /**
     * Salva cores no localStorage
     */
    saveColorsToStorage() {
        try {
            const colorsData = {};
            this.cellColors.forEach((colorName, cellIndex) => {
                colorsData[cellIndex] = colorName;
            });
            
            localStorage.setItem('sudoku-colors', JSON.stringify({
                cellColors: colorsData,
                selectedColor: this.selectedColor,
                currentColorIndex: this.currentColorIndex
            }));
        } catch (e) {
            console.warn('Erro ao salvar cores:', e);
        }
    }

    /**
     * Carrega cores do localStorage
     */
    loadColorsFromStorage() {
        try {
            const saved = localStorage.getItem('sudoku-colors');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Restaurar cores das células
                if (data.cellColors) {
                    Object.entries(data.cellColors).forEach(([cellIndex, colorName]) => {
                        this.cellColors.set(parseInt(cellIndex), colorName);
                    });
                }
                
                // Restaurar cor selecionada
                if (data.selectedColor) {
                    this.selectedColor = data.selectedColor;
                }
                
                if (data.currentColorIndex !== undefined) {
                    this.currentColorIndex = data.currentColorIndex;
                }
                
                this.updateColorIndicator();
            }
        } catch (e) {
            console.warn('Erro ao carregar cores:', e);
        }
    }
}
