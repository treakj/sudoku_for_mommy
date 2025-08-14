/**
 * Sistema de cores personalizadas para células do Sudoku
 * Permite pintar células com cores diferentes para estratégias avançadas
 */

export class ColorSystem {
    constructor(game) {
        this.game = game;
        this.cellColors = new Map(); // cellIndex -> color
        this.availableColors = [
            { name: 'red', value: '#ffcdd2', emoji: '🔴' },
            { name: 'blue', value: '#bbdefb', emoji: '🔵' },
            { name: 'green', value: '#c8e6c9', emoji: '🟢' },
            { name: 'yellow', value: '#fff9c4', emoji: '🟡' },
            { name: 'purple', value: '#e1bee7', emoji: '🟣' },
            { name: 'orange', value: '#ffe0b2', emoji: '🟠' },
            { name: 'clear', value: null, emoji: '🚫' }
        ];
        this.selectedColor = 'red'; // Vermelho pré-selecionado
        this.currentColorIndex = 0; // Índice da cor atual
        this.isActive = true; // Sempre ativo
        this.setup();
    }

    setup() {
        console.log('Iniciando setup do ColorSystem');
        this.createColorPalette();
        this.createColorIndicator();
        this.attachEventListeners();
        this.selectColor('red'); // Seleciona vermelho por padrão
        this.loadColorsFromStorage();
        console.log('✅ Sistema de cores inicializado');
    }

    createColorPalette() {
        // Verificar se já existe
        if (document.querySelector('.color-palette')) return;

        const palette = document.createElement('div');
        palette.className = 'color-palette hidden fixed bottom-20 left-4 bg-white rounded-lg shadow-lg p-3 z-50 flex flex-col gap-2';
        palette.innerHTML = `
            <div class="text-sm font-medium text-gray-700 mb-2">Cores para Células</div>
            <div class="flex gap-2 flex-wrap">
                ${this.availableColors.map(color => `
                    <button class="color-btn w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors flex items-center justify-center text-sm" 
                            data-color="${color.name}" 
                            style="background-color: ${color.value}" 
                            title="${color.name}">
                        ${color.emoji}
                    </button>
                `).join('')}
                <button class="color-btn w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors flex items-center justify-center text-sm bg-white" 
                        data-color="clear" 
                        title="Limpar cor">
                    🚫
                </button>
            </div>
            <button class="close-palette-btn text-xs text-gray-500 hover:text-gray-700 mt-2">
                Fechar
            </button>
        `;

        document.body.appendChild(palette);
        this.palette = palette;

        // Criar botão para abrir a paleta
        this.createColorToggleButton();
    }

    setupToggleButton() {
        // Sistema de cores sempre ativo, botão não necessário
        this.toggleButton = null;
    }

    createColorIndicator() {
        // Criar indicador visual da cor selecionada
        const indicator = document.createElement('div');
        indicator.id = 'color-indicator';
        indicator.className = 'fixed top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-40 flex items-center gap-2';
        indicator.innerHTML = `
            <span class="text-sm font-medium text-gray-700">Cor:</span>
            <div class="w-6 h-6 rounded-full border-2 border-gray-300" id="current-color-display"></div>
            <span class="text-sm text-gray-600" id="current-color-name">Vermelho</span>
        `;
        
        document.body.appendChild(indicator);
        this.colorIndicator = indicator;
        console.log('✅ Indicador de cor criado:', indicator);
    }

    attachEventListeners() {
        // Sistema de cores sempre ativo, sem botão de toggle

        // Listeners para a paleta de cores
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-btn')) {
                const color = e.target.dataset.color;
                this.selectColor(color);
            }

            if (e.target.classList.contains('close-palette-btn')) {
                this.toggleColorPalette(false);
            }
        });

        // Aplicação de cores integrada ao handleCellClick do game-enhanced.js

        // Tecla C para alternar entre cores
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.altKey) {
                console.log('Atalho C pressionado para alternar cores');
                e.preventDefault();
                this.cycleColor();
            }
            
            // Aplicação com Espaço integrada ao game-enhanced.js
        });
        console.log('Event listener de teclado para cores anexado');

        // Fechar paleta ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.palette && !this.palette.contains(e.target) && e.target.id !== 'color-btn') {
                this.toggleColorPalette(false);
            }
        });
    }

    toggleColorPalette(show = null) {
        if (!this.palette) {
            console.error('Paleta de cores não encontrada');
            return;
        }

        const shouldShow = show !== null ? show : this.palette.classList.contains('hidden');
        
        if (shouldShow) {
            this.palette.classList.remove('hidden');
            this.isColorMode = true;
            this.updateToggleButton(true);
            console.log('🎨 Modo de cores ATIVADO - Clique em uma cor e depois em uma célula');
            this.showColorFeedback('Modo de cores ativado! Selecione uma cor.');
        } else {
            this.palette.classList.add('hidden');
            this.isColorMode = false;
            this.selectedColor = null;
            this.updateToggleButton(false);
            this.clearColorSelection();
            console.log('🎨 Modo de cores DESATIVADO');
        }
    }

    selectColor(colorName) {
        this.selectedColor = colorName;
        this.currentColorIndex = this.availableColors.findIndex(c => c.name === colorName);
        this.updateColorSelection(colorName);
        this.updateColorIndicator(colorName);
        // Feedback visual
        this.showColorFeedback(colorName);
    }

    cycleColor() {
        this.currentColorIndex = (this.currentColorIndex + 1) % this.availableColors.length;
        this.selectedColor = this.availableColors[this.currentColorIndex].name;
        this.updateColorSelection(this.selectedColor);
        this.updateColorIndicator(this.selectedColor);
        this.showColorFeedback(this.selectedColor);
    }
    
    updateColorIndicator(colorName) {
        if (!this.colorIndicator) return;
        
        const color = this.availableColors.find(c => c.name === colorName);
        if (!color) return;
        
        const colorDisplay = document.getElementById('current-color-display');
        const colorNameEl = document.getElementById('current-color-name');
        
        if (colorDisplay && colorNameEl) {
            if (color.value) {
                colorDisplay.style.backgroundColor = color.value;
                colorDisplay.style.border = '2px solid #374151';
            } else {
                colorDisplay.style.backgroundColor = 'transparent';
                colorDisplay.style.border = '2px dashed #9CA3AF';
            }
            
            // Traduzir nome da cor
            const colorNames = {
                red: { pt: 'Vermelho', en: 'Red', ja: '赤' },
                blue: { pt: 'Azul', en: 'Blue', ja: '青' },
                green: { pt: 'Verde', en: 'Green', ja: '緑' },
                yellow: { pt: 'Amarelo', en: 'Yellow', ja: '黄' },
                purple: { pt: 'Roxo', en: 'Purple', ja: '紫' },
                orange: { pt: 'Laranja', en: 'Orange', ja: 'オレンジ' },
                clear: { pt: 'Limpar', en: 'Clear', ja: 'クリア' }
            };
            
            // Importar getCurrentLanguage para obter o idioma atual
            import('./translations.js').then(module => {
                const currentLang = module.getCurrentLanguage();
                colorNameEl.textContent = colorNames[colorName]?.[currentLang] || colorName;
            }).catch(() => {
                // Fallback se não conseguir importar
                const currentLang = document.body.className.match(/lang-(\w+)/)?.[1] || 'pt';
                colorNameEl.textContent = colorNames[colorName]?.[currentLang] || colorName;
            });
        }
    }

    updateColorSelection(selectedColor) {
        const colorBtns = this.palette.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            if (btn.dataset.color === selectedColor) {
                btn.classList.add('ring-2', 'ring-blue-500');
            } else {
                btn.classList.remove('ring-2', 'ring-blue-500');
            }
        });
    }

    clearColorSelection() {
        const colorBtns = this.palette.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500');
        });
    }

    updateToggleButton(active) {
        if (!this.toggleButton) return;

        if (active) {
            this.toggleButton.classList.add('bg-blue-500', 'text-white');
            this.toggleButton.classList.remove('bg-gray-200', 'text-gray-700');
        } else {
            this.toggleButton.classList.remove('bg-blue-500', 'text-white');
            this.toggleButton.classList.add('bg-gray-200', 'text-gray-700');
        }
    }

    showColorFeedback(colorName) {
        const color = this.availableColors.find(c => c.name === colorName);
        let message;
        
        if (typeof colorName === 'string' && colorName.includes('aplicada')) {
            message = colorName; // Já é uma mensagem de aplicação
        } else {
            message = colorName === 'clear' ? 'Modo limpar cor ativo' : `Cor ${colorName} selecionada`;
        }
        
        // Criar feedback temporário
        const feedback = document.createElement('div');
        feedback.className = 'fixed top-4 right-4 bg-black bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm z-50 shadow-lg border border-gray-600';
        feedback.style.animation = 'fadeIn 0.3s ease-in';
        
        // Adicionar emoji da cor se disponível
        if (color && color.emoji && !message.includes('aplicada')) {
            feedback.innerHTML = `<div class="flex items-center gap-2">
                <span class="text-lg">${color.emoji}</span>
                <span>${message}</span>
            </div>`;
        } else {
            feedback.textContent = message;
        }
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.parentNode.removeChild(feedback);
                    }
                }, 300);
            }
        }, 2000);
    }

    paintCell(cellIndex, colorName) {
        const color = this.availableColors.find(c => c.name === colorName);
        if (!color) return;

        this.cellColors.set(cellIndex, colorName);
        
        // Redesenhar o jogo para mostrar as cores
        if (this.game && this.game.draw) {
            this.game.draw();
        }

        this.saveColorsToStorage();
        
        // Dispatch event para outros sistemas
        const event = new CustomEvent('sudoku-cell-colored', {
            detail: {
                cellIndex,
                color: colorName,
                colorValue: color.value
            }
        });
        document.dispatchEvent(event);
    }

    clearCellColor(cellIndex) {
        this.cellColors.delete(cellIndex);
        
        // Redesenhar o jogo para remover as cores
        if (this.game && this.game.draw) {
            this.game.draw();
        }

        this.saveColorsToStorage();
        
        // Dispatch event
        const event = new CustomEvent('sudoku-cell-colored', {
            detail: {
                cellIndex,
                color: null,
                colorValue: null
            }
        });
        document.dispatchEvent(event);
    }

    clearAllColors() {
        this.cellColors.clear();
        
        // Redesenhar o jogo para remover todas as cores
        if (this.game && this.game.draw) {
            this.game.draw();
        }
        
        this.saveColorsToStorage();
    }

    // Métodos removidos - não são necessários para implementação canvas
    // getCellIndex e getCellByIndex não são necessários pois 
    // trabalhamos diretamente com coordenadas do canvas

    saveColorsToStorage() {
        try {
            const colorsData = Object.fromEntries(this.cellColors);
            localStorage.setItem('sudoku-cell-colors', JSON.stringify(colorsData));
        } catch (error) {
            console.warn('Erro ao salvar cores:', error);
        }
    }

    loadColorsFromStorage() {
        try {
            const saved = localStorage.getItem('sudoku-cell-colors');
            if (saved) {
                const colorsData = JSON.parse(saved);
                this.cellColors = new Map(Object.entries(colorsData));
                
                // Redesenhar o jogo para aplicar as cores carregadas
                if (this.game && this.game.draw) {
                    setTimeout(() => this.game.draw(), 100);
                }
            }
        } catch (error) {
            console.warn('Erro ao carregar cores:', error);
            this.cellColors = new Map();
        }
    }

    reset() {
        this.clearAllColors();
        this.toggleColorPalette(false);
        this.selectedColor = null;
    }

    // Método para integração com outros sistemas
    getCellColor(cellIndex) {
        return this.cellColors.get(cellIndex) || null;
    }

    // Método para definir cores programaticamente
    setCellColor(cellIndex, colorName) {
        if (colorName === null || colorName === 'clear') {
            this.clearCellColor(cellIndex);
        } else {
            this.paintCell(cellIndex, colorName);
        }
    }
}