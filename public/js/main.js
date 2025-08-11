/**
 * Arquivo principal da aplicação Sudoku
 * Inicializa o jogo e configura todos os event listeners
 */

import { SudokuGame } from './modules/game.js';
import { updateUIText, toggleLanguage, getCurrentTranslations } from './modules/translations.js';
import { 
    getElementById, 
    querySelectorAll, 
    addEventListener, 
    removeClass, 
    addClass, 
    onDOMReady 
} from './utils/dom-helpers.js';

/**
 * Configuração inicial da aplicação
 */
function initializeApp() {
    // Inicializa o jogo
    const game = new SudokuGame('sudoku-canvas');
    
    // Configuração dos controles de dificuldade
    setupDifficultyControls(game);
    
    // Configuração dos controles de ação
    setupActionControls(game);
    
    // Configuração do painel de números para mobile
    setupNumberPanel(game);
    
    // Configuração dos modais
    setupModals(game);
    
    // Configuração do seletor de idioma
    setupLanguageToggle(game);
    
    // Inicializa a UI com o idioma padrão
    updateUIText();
    
    console.log('🎮 Jogo de Sudoku inicializado com sucesso!');
}

/**
 * Configura os controles de dificuldade
 * @param {SudokuGame} game - Instância do jogo
 */
function setupDifficultyControls(game) {
    const difficultyButtons = querySelectorAll('.btn-difficulty');
    
    difficultyButtons.forEach(btn => {
        addEventListener(btn, 'click', () => {
            // Remove classe ativa de todos os botões
            difficultyButtons.forEach(b => removeClass(b, 'active'));
            
            // Adiciona classe ativa ao botão clicado
            addClass(btn, 'active');
            
            // Define nova dificuldade e inicia novo jogo
            const difficulty = btn.dataset.difficulty;
            game.setDifficulty(difficulty);
            game.startNewGame();
        });
    });
}

/**
 * Configura os controles de ação (Novo Jogo, Reset, etc.)
 * @param {SudokuGame} game - Instância do jogo
 */
function setupActionControls(game) {
    // Botão Novo Jogo
    const newGameBtn = getElementById('new-game-btn');
    addEventListener(newGameBtn, 'click', () => {
        game.startNewGame();
    });
    
    // Botão Reset
    const resetBtn = getElementById('reset-btn');
    addEventListener(resetBtn, 'click', () => {
        game.resetBoard();
    });
    
    // Botão Mostrar Resposta
    const showAnswerBtn = getElementById('show-answer-btn');
    addEventListener(showAnswerBtn, 'click', () => {
        game.showConfirmModal();
    });
}

/**
 * Configura o painel de números para dispositivos móveis
 * @param {SudokuGame} game - Instância do jogo
 */
function setupNumberPanel(game) {
    const numberButtons = querySelectorAll('.num-btn');
    
    numberButtons.forEach(btn => {
        addEventListener(btn, 'click', () => {
            if (game.selected.row !== -1) {
                const num = parseInt(btn.dataset.num);
                game.placeNumber(game.selected.row, game.selected.col, num);
            }
        });
        
        // Adiciona feedback visual para touch
        addEventListener(btn, 'touchstart', () => {
            addClass(btn, 'bg-blue-300');
        }, { passive: true });
        
        addEventListener(btn, 'touchend', () => {
            removeClass(btn, 'bg-blue-300');
        }, { passive: true });
    });
}

/**
 * Configura os modais do jogo
 * @param {SudokuGame} game - Instância do jogo
 */
function setupModals(game) {
    // Modal de vitória
    const modalNewGameBtn = getElementById('modal-new-game-btn');
    addEventListener(modalNewGameBtn, 'click', () => {
        const winModal = getElementById('win-modal');
        addClass(winModal, 'hidden');
        game.startNewGame();
    });
    
    // Modal de confirmação para mostrar resposta
    const confirmCancelBtn = getElementById('confirm-cancel-btn');
    addEventListener(confirmCancelBtn, 'click', () => {
        game.hideConfirmModal();
    });
    
    const confirmShowBtn = getElementById('confirm-show-btn');
    addEventListener(confirmShowBtn, 'click', () => {
        game.showAnswer();
        game.hideConfirmModal();
    });
    
    // Fecha modais clicando no backdrop
    setupModalBackdropClose('win-modal');
    setupModalBackdropClose('confirm-modal');
}

/**
 * Configura fechamento de modal clicando no backdrop
 * @param {string} modalId - ID do modal
 */
function setupModalBackdropClose(modalId) {
    const modal = getElementById(modalId);
    if (modal) {
        addEventListener(modal, 'click', (e) => {
            if (e.target === modal) {
                addClass(modal, 'hidden');
            }
        });
    }
}

/**
 * Configura o seletor de idioma
 * @param {SudokuGame} game - Instância do jogo
 */
function setupLanguageToggle(game) {
    const langToggle = getElementById('lang-toggle');
    
    addEventListener(langToggle, 'click', () => {
        toggleLanguage();
        game.updateHintButton();
        
        // Adiciona animação de feedback
        addClass(langToggle, 'transform', 'scale-95');
        setTimeout(() => {
            removeClass(langToggle, 'scale-95');
        }, 150);
    });
}

/**
 * Configura atalhos de teclado globais
 */
function setupKeyboardShortcuts() {
    addEventListener(document, 'keydown', (e) => {
        // Atalhos apenas quando não há inputs focados
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl/Cmd + N para novo jogo
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            getElementById('new-game-btn').click();
        }
        
        // Ctrl/Cmd + R para reset
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            getElementById('reset-btn').click();
        }
        
        // H para dica
        if (e.key === 'h' || e.key === 'H') {
            e.preventDefault();
            getElementById('hint-btn').click();
        }
        
        // L para alternar idioma
        if (e.key === 'l' || e.key === 'L') {
            e.preventDefault();
            getElementById('lang-toggle').click();
        }
    });
}

/**
 * Configura detecção de dispositivo móvel
 */
function setupMobileDetection() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Adiciona classe para dispositivos móveis
        addClass(document.body, 'mobile-device');
        
        // Previne zoom em inputs
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
}

/**
 * Configura Service Worker para PWA (Progressive Web App)
 */
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registrado com sucesso:', registration);
                })
                .catch((registrationError) => {
                    console.log('Falha ao registrar SW:', registrationError);
                });
        });
    }
}

/**
 * Função de inicialização principal
 */
function main() {
    setupMobileDetection();
    setupKeyboardShortcuts();
    // setupServiceWorker(); // Descomente se quiser PWA
    initializeApp();
}

// Inicializa quando o DOM estiver pronto
onDOMReady(main);
