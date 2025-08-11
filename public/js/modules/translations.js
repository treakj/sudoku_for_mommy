/**
 * Módulo de Traduções
 * Gerencia todos os textos do jogo em múltiplos idiomas
 */

export const translations = {
    en: {
        mainTitle: "Sudoku Game",
        subtitle: "Challenge your logic and have fun!",
        difficultyLabel: "Difficulty:",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        expert: "Expert",
        insane: "Insane",
        newGame: "New Game",
        reset: "Reset",
        hint: "Hint",
        showAnswer: "Answer",
        winTitle: "Congratulations!",
        winSubtitle: "You have completed the Sudoku!",
        playAgain: "Play Again",
        confirmTitle: "Show Answer?",
        confirmSubtitle: "This will fill the entire board and end the current game. Are you sure?",
        cancel: "Cancel",
        confirm: "Confirm",
        langToggle: "JP"
    },
    pt: {
        mainTitle: "Jogo de Sudoku",
        subtitle: "Desafie sua lógica e divirta-se!",
        difficultyLabel: "Dificuldade:",
        easy: "Fácil",
        medium: "Médio",
        hard: "Difícil",
        expert: "Dificílimo",
        insane: "Dificílimo Mesmo",
        newGame: "Novo Jogo",
        reset: "Limpar",
        hint: "Dica",
        showAnswer: "Resposta",
        winTitle: "Parabéns!",
        winSubtitle: "Você completou o Sudoku!",
        playAgain: "Jogar Novamente",
        confirmTitle: "Mostrar Resposta?",
        confirmSubtitle: "Isso preencherá todo o tabuleiro e encerrará o jogo atual. Você tem certeza?",
        cancel: "Cancelar",
        confirm: "Confirmar",
        langToggle: "EN"
    },
    ja: {
        mainTitle: "数独ゲーム　（母ちゃん用）",
        subtitle: "論理に挑戦して楽しんでください！",
        difficultyLabel: "難易度:",
        easy: "簡単",
        medium: "中級",
        hard: "難しい",
        expert: "エキスパート",
        insane: "超難関　【真弓用）",
        newGame: "新しいゲーム",
        reset: "リセット",
        hint: "ヒント",
        showAnswer: "答え",
        winTitle: "おめでとうございます！",
        winSubtitle: "数独をクリアしました！",
        playAgain: "もう一度プレイ",
        confirmTitle: "答えを表示しますか？",
        confirmSubtitle: "これにより、すべてのマスが埋められ、現在のゲームは終了します。よろしいですか？",
        cancel: "キャンセル",
        confirm: "確認",
        langToggle: "PT"
    }
};

let currentLang = 'ja'; // Japonês como padrão

/**
 * Atualiza o idioma atual
 * @param {string} lang - Código do idioma (en, pt, ja)
 */
export function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        updateUIText();
    }
}

/**
 * Obtém o idioma atual
 * @returns {string} Código do idioma atual
 */
export function getCurrentLanguage() {
    return currentLang;
}

/**
 * Obtém as traduções do idioma atual
 * @returns {object} Objeto com as traduções
 */
export function getCurrentTranslations() {
    return translations[currentLang];
}

/**
 * Atualiza todos os textos da interface
 */
export function updateUIText() {
    // Atualiza a classe do body para controle de fonte
    document.body.className = document.body.className.replace(/lang-\w+/g, '');
    document.body.classList.add(`lang-${currentLang}`);

    const t = translations[currentLang];
    
    // Atualiza elementos principais
    const elements = [
        { id: 'main-title', key: 'mainTitle' },
        { id: 'subtitle', key: 'subtitle' },
        { id: 'difficulty-label', key: 'difficultyLabel' },
        { id: 'new-game-btn', key: 'newGame' },
        { id: 'reset-btn', key: 'reset' },
        { id: 'show-answer-btn', key: 'showAnswer' },
        { id: 'win-title', key: 'winTitle' },
        { id: 'win-subtitle', key: 'winSubtitle' },
        { id: 'modal-new-game-btn', key: 'playAgain' },
        { id: 'confirm-title', key: 'confirmTitle' },
        { id: 'confirm-subtitle', key: 'confirmSubtitle' },
        { id: 'confirm-cancel-btn', key: 'cancel' },
        { id: 'confirm-show-btn', key: 'confirm' },
        { id: 'lang-toggle', key: 'langToggle' }
    ];

    elements.forEach(({ id, key }) => {
        const element = document.getElementById(id);
        if (element && t[key]) {
            element.textContent = t[key];
        }
    });

    // Atualiza botões de dificuldade
    const difficultyButtons = [
        { selector: '[data-difficulty="easy"]', key: 'easy' },
        { selector: '[data-difficulty="medium"]', key: 'medium' },
        { selector: '[data-difficulty="hard"]', key: 'hard' },
        { selector: '[data-difficulty="expert"]', key: 'expert' },
        { selector: '[data-difficulty="insane"]', key: 'insane' }
    ];

    difficultyButtons.forEach(({ selector, key }) => {
        const element = document.querySelector(selector);
        if (element && t[key]) {
            element.textContent = t[key];
        }
    });
}

/**
 * Alterna para o próximo idioma
 */
export function toggleLanguage() {
    if (currentLang === 'ja') currentLang = 'pt';
    else if (currentLang === 'pt') currentLang = 'en';
    else currentLang = 'ja';
    
    updateUIText();
    return currentLang;
}
