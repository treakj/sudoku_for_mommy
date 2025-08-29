/**
 * Sistema de indicador visual do número selecionado
 * Mostra claramente qual número está atualmente selecionado
 */

export class SelectedNumberIndicator {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.selectedNumber = null;
        this.element = null;
        this.setup();
    }

    setup() {
        this.createIndicatorElement();
        this.attachEventListeners();
    }

    createIndicatorElement() {
        // Remove indicador existente se houver
        const existing = document.querySelector('.selected-number-indicator');
        if (existing) existing.remove();

        // Criar container principal
        this.element = document.createElement('div');
        this.element.className = 'selected-number-indicator';
        this.element.innerHTML = `
            <div class="indicator-container">
                <div class="indicator-label">Número Selecionado:</div>
                <div class="indicator-number" id="selected-number-display">-</div>
            </div>
        `;

        // Adicionar estilos CSS
        this.addStyles();

        // Inserir no DOM
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.insertBefore(this.element, gameContainer.firstChild);
        } else {
            document.body.appendChild(this.element);
        }
    }

    addStyles() {
        const styleId = 'selected-number-indicator-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .selected-number-indicator {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
                background: linear-gradient(135deg, #2980b9, #1f5f8b);
                border-radius: 10px;
                padding: 12px 20px;
                box-shadow: 0 3px 12px rgba(41, 128, 185, 0.4);
                border: 2px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(8px);
                transition: all 0.3s ease;
            }

            .indicator-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .indicator-label {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                font-weight: 500;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }

            .indicator-number {
                background: rgba(255, 255, 255, 0.95);
                color: #2d3748;
                font-size: 20px;
                font-weight: bold;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
            }

            .indicator-number.has-selection {
                background: #48bb78;
                color: white;
                transform: scale(1.1);
                box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.3);
            }

            .selected-number-indicator.hidden {
                opacity: 0;
                transform: translateX(-50%) translateY(-10px);
                pointer-events: none;
            }

            /* Responsivo */
            @media (max-width: 768px) {
                .selected-number-indicator {
                    top: 10px;
                    padding: 6px 12px;
                }
                
                .indicator-label {
                    font-size: 12px;
                }
                
                .indicator-number {
                    width: 28px;
                    height: 28px;
                    font-size: 16px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    attachEventListeners() {
        // Escutar mudanças no sistema de destaque
        document.addEventListener('number-selected', (e) => {
            this.updateDisplay(e.detail.number);
        });

        // Escutar limpeza de seleção
        document.addEventListener('selection-cleared', () => {
            this.clearDisplay();
        });

        // Escutar seleção via teclado
        document.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                this.updateDisplay(num);
            } else if (e.key === 'Escape') {
                this.clearDisplay();
            }
        });
    }

    updateDisplay(number) {
        if (!this.element) return;

        this.selectedNumber = number;
        const displayElement = this.element.querySelector('#selected-number-display');
        
        if (displayElement) {
            displayElement.textContent = number;
            displayElement.classList.add('has-selection');
        }

        // Mostrar indicador se estava oculto
        this.show();

        // Animação de feedback
        this.animateSelection();
    }

    clearDisplay() {
        if (!this.element) return;

        this.selectedNumber = null;
        const displayElement = this.element.querySelector('#selected-number-display');
        
        if (displayElement) {
            displayElement.textContent = '-';
            displayElement.classList.remove('has-selection');
        }
    }

    animateSelection() {
        if (!this.element) return;

        this.element.style.transform = 'translateX(-50%) scale(1.05)';
        setTimeout(() => {
            this.element.style.transform = 'translateX(-50%) scale(1)';
        }, 150);
    }

    show() {
        if (this.element) {
            this.element.classList.remove('hidden');
        }
    }

    hide() {
        if (this.element) {
            this.element.classList.add('hidden');
        }
    }

    getSelectedNumber() {
        return this.selectedNumber;
    }

    reset() {
        this.clearDisplay();
    }

    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }

        // Remover estilos
        const style = document.getElementById('selected-number-indicator-styles');
        if (style) {
            style.remove();
        }
    }
}