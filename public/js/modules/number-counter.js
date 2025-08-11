/**
 * Contador de números para Sudoku
 * Mostra quantas vezes cada número de 1-9 foi usado
 */

export class NumberCounter {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.counts = new Array(10).fill(0); // índice 0 não usado, 1-9 para os números
        this.maxCount = 9; // Cada número pode aparecer no máximo 9 vezes
        this.element = null;
        this.isVisible = true;
        this.animationEnabled = true;
        this.setup();
    }

    setup() {
        this.createCounterElement();
        this.updateAllCounts();
        this.attachEventListeners();
    }

    createCounterElement() {
        // Remove contador existente se houver
        const existing = document.querySelector('.number-counter');
        if (existing) existing.remove();

        // Criar container principal
        this.element = document.createElement('div');
        this.element.className = 'number-counter';
        this.element.innerHTML = `
            <div class="counter-header">
                <h3>Números</h3>
                <button class="counter-toggle" title="Mostrar/Esconder contador">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>
            </div>
            <div class="counter-grid">
                ${this.generateCounterItems()}
            </div>
        `;

        // Inserir no DOM
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.element);
        }
    }

    generateCounterItems() {
        let html = '';
        for (let i = 1; i <= 9; i++) {
            const count = this.counts[i];
            const isComplete = count >= this.maxCount;
            
            html += `
                <div class="counter-item ${isComplete ? 'counter-complete' : ''}" data-number="${i}">
                    <div class="counter-number">${i}</div>
                    <div class="counter-count">
                        <span class="current-count">${count}</span>
                        <span class="max-count">/${this.maxCount}</span>
                    </div>
                    <div class="counter-progress">
                        <div class="counter-progress-bar" style="width: ${(count / this.maxCount) * 100}%"></div>
                    </div>
                </div>
            `;
        }
        return html;
    }

    attachEventListeners() {
        // Toggle de visibilidade
        const toggleBtn = this.element.querySelector('.counter-toggle');
        toggleBtn?.addEventListener('click', () => this.toggleVisibility());

        // Clique nos itens do contador para destacar números
        this.element.querySelectorAll('.counter-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const number = parseInt(e.currentTarget.dataset.number);
                this.selectNumber(number);
            });
        });

        // Escutar mudanças no jogo
        document.addEventListener('sudoku-cell-changed', () => {
            this.updateAllCounts();
        });
    }

    updateAllCounts() {
        // Reset counts
        this.counts.fill(0);

        // Contar números no grid
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const value = parseInt(cell.textContent);
            if (value >= 1 && value <= 9) {
                this.counts[value]++;
            }
        });

        // Atualizar display
        this.updateCounterDisplay();
    }

    updateCounterDisplay() {
        if (!this.element) return;

        for (let i = 1; i <= 9; i++) {
            const item = this.element.querySelector(`[data-number="${i}"]`);
            if (!item) continue;

            const count = this.counts[i];
            const isComplete = count >= this.maxCount;
            const currentCountEl = item.querySelector('.current-count');
            const progressBar = item.querySelector('.counter-progress-bar');

            // Atualizar valores
            if (currentCountEl) {
                const oldCount = parseInt(currentCountEl.textContent);
                currentCountEl.textContent = count;

                // Animação se o número mudou
                if (this.animationEnabled && oldCount !== count) {
                    this.animateCountChange(item, count > oldCount);
                }
            }

            // Atualizar barra de progresso
            if (progressBar) {
                progressBar.style.width = `${(count / this.maxCount) * 100}%`;
            }

            // Classe de completo
            item.classList.toggle('counter-complete', isComplete);

            // Destacar se selecionado
            if (this.game.highlightSystem && this.game.highlightSystem.selectedNumber === i) {
                item.classList.add('counter-selected');
            } else {
                item.classList.remove('counter-selected');
            }
        }
    }

    animateCountChange(item, isIncrease) {
        const animation = isIncrease ? 'counter-increase' : 'counter-decrease';
        item.classList.add(animation);
        
        setTimeout(() => {
            item.classList.remove(animation);
        }, 300);
    }

    selectNumber(number) {
        // Integrar com sistema de destaque
        if (this.game.highlightSystem) {
            this.game.highlightSystem.selectNumber(number);
        }
        
        // Atualizar visual do contador
        this.updateCounterDisplay();
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        const counterGrid = this.element.querySelector('.counter-grid');
        const toggleBtn = this.element.querySelector('.counter-toggle');
        
        if (this.isVisible) {
            counterGrid.style.display = 'grid';
            toggleBtn.style.transform = 'rotate(0deg)';
        } else {
            counterGrid.style.display = 'none';
            toggleBtn.style.transform = 'rotate(-90deg)';
        }
    }

    getNumberCount(number) {
        return this.counts[number] || 0;
    }

    isNumberComplete(number) {
        return this.getNumberCount(number) >= this.maxCount;
    }

    getIncompleteNumbers() {
        const incomplete = [];
        for (let i = 1; i <= 9; i++) {
            if (!this.isNumberComplete(i)) {
                incomplete.push(i);
            }
        }
        return incomplete;
    }

    reset() {
        this.counts.fill(0);
        this.updateCounterDisplay();
    }

    setAnimationEnabled(enabled) {
        this.animationEnabled = enabled;
    }

    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}
