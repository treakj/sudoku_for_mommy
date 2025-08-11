/**
 * Helpers para manipulação do DOM
 * Funções utilitárias para interação com elementos HTML
 */

/**
 * Seleciona um elemento por ID
 * @param {string} id - ID do elemento
 * @returns {HTMLElement|null} Elemento encontrado ou null
 */
export function getElementById(id) {
    return document.getElementById(id);
}

/**
 * Seleciona elementos por seletor CSS
 * @param {string} selector - Seletor CSS
 * @returns {NodeList} Lista de elementos encontrados
 */
export function querySelectorAll(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Adiciona event listener a um elemento
 * @param {HTMLElement} element - Elemento
 * @param {string} event - Tipo do evento
 * @param {function} handler - Função manipuladora
 * @param {object} options - Opções do evento
 */
export function addEventListener(element, event, handler, options = {}) {
    if (element) {
        element.addEventListener(event, handler, options);
    }
}

/**
 * Remove classe de um elemento
 * @param {HTMLElement} element - Elemento
 * @param {string} className - Nome da classe
 */
export function removeClass(element, className) {
    if (element && element.classList) {
        element.classList.remove(className);
    }
}

/**
 * Adiciona classe a um elemento
 * @param {HTMLElement} element - Elemento
 * @param {string} className - Nome da classe
 */
export function addClass(element, className) {
    if (element && element.classList) {
        element.classList.add(className);
    }
}

/**
 * Alterna classe de um elemento
 * @param {HTMLElement} element - Elemento
 * @param {string} className - Nome da classe
 */
export function toggleClass(element, className) {
    if (element && element.classList) {
        element.classList.toggle(className);
    }
}

/**
 * Verifica se elemento tem uma classe
 * @param {HTMLElement} element - Elemento
 * @param {string} className - Nome da classe
 * @returns {boolean} True se tem a classe, false caso contrário
 */
export function hasClass(element, className) {
    return element && element.classList && element.classList.contains(className);
}

/**
 * Define o texto de um elemento
 * @param {HTMLElement} element - Elemento
 * @param {string} text - Texto a ser definido
 */
export function setText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

/**
 * Obtém o texto de um elemento
 * @param {HTMLElement} element - Elemento
 * @returns {string} Texto do elemento
 */
export function getText(element) {
    return element ? element.textContent : '';
}

/**
 * Define um atributo do elemento
 * @param {HTMLElement} element - Elemento
 * @param {string} attribute - Nome do atributo
 * @param {string} value - Valor do atributo
 */
export function setAttribute(element, attribute, value) {
    if (element) {
        element.setAttribute(attribute, value);
    }
}

/**
 * Obtém o valor de um atributo
 * @param {HTMLElement} element - Elemento
 * @param {string} attribute - Nome do atributo
 * @returns {string|null} Valor do atributo
 */
export function getAttribute(element, attribute) {
    return element ? element.getAttribute(attribute) : null;
}

/**
 * Mostra um modal adicionando/removendo classes CSS
 * @param {HTMLElement} modal - Elemento do modal
 */
export function showModal(modal) {
    if (modal) {
        removeClass(modal, 'hidden');
        setTimeout(() => {
            const modalContent = modal.querySelector('div');
            if (modalContent) {
                removeClass(modalContent, 'scale-95');
            }
        }, 10);
    }
}

/**
 * Esconde um modal adicionando/removendo classes CSS
 * @param {HTMLElement} modal - Elemento do modal
 */
export function hideModal(modal) {
    if (modal) {
        const modalContent = modal.querySelector('div');
        if (modalContent) {
            addClass(modalContent, 'scale-95');
        }
        setTimeout(() => {
            addClass(modal, 'hidden');
        }, 150);
    }
}

/**
 * Obtém as coordenadas do mouse/touch relativas a um elemento
 * @param {Event} event - Evento de click/touch
 * @param {HTMLElement} element - Elemento de referência
 * @returns {object} Coordenadas {x, y}
 */
export function getRelativeCoordinates(event, element) {
    const rect = element.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

/**
 * Executa uma função quando o DOM estiver carregado
 * @param {function} callback - Função a ser executada
 */
export function onDOMReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

/**
 * Debounce function para limitar execução de funções
 * @param {function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {function} Função com debounce aplicado
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
