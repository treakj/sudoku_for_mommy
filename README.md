# 🧩 Sudoku for Mommy - v0.9

Um jogo de Sudoku moderno e responsivo com suporte a múltiplos idiomas (Português, Inglês e Japonês).

## 🎮 Recursos da Versão 0.9

### 🎨 **Sistema de Paletas de Cores para Notas**
- **6 Paletas Únicas**: Laranja, Azul, Verde, Roxo, Rosa, Vermelho
- **Tecla C**: Alterna entre paletas de cores
- **Visual Dinâmico**: Botão de notas muda de cor conforme a paleta
- **Persistência**: Lembra da sua paleta preferida

### ⌨️ **Novos Atalhos de Teclado**
- **Q ou N**: Ativa/desativa modo de anotações
- **C**: Alterna entre paletas de cores das notas
- **1-9**: Adiciona números ou notas (dependendo do modo)

### 🎯 **Melhorias Visuais**
- **Botão de Notas Aprimorado**: Bordas bold e animação pulse quando ativo
- **Feedback Visual**: Notificações ao trocar paletas
- **Fontes Corrigidas**: Números principais mantêm tamanho consistente

## 🌟 Características

- **Múltiplos Níveis de Dificuldade**: Fácil, Médio, Difícil, Expert e Insano
- **Suporte Multilíngue**: Português, Inglês e Japonês
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Sistema de Dicas**: 3 dicas por jogo
- **Validação em Tempo Real**: Destaque de conflitos
- **Navegação por Teclado**: Suporte completo para teclado
- **Design Moderno**: Interface limpa usando Tailwind CSS
- **Sistema de Paletas de Cores**: 6 paletas para personalizar notas
- **Sistema de Notas**: Anotações integradas com cores personalizadas
- **Undo/Redo**: Desfaça e refaça qualquer ação
- **Interface Organizada**: Controles intuitivos em 2 linhas

## 🚀 Como Usar

### Controles de Teclado
- **Setas**: Navegar pelo tabuleiro
- **1-9**: Inserir números
- **Q ou N**: Ativar/desativar modo notas
- **C**: Alternar entre paletas de cores das notas
- **Backspace/Delete**: Apagar números
- **H**: Usar dica
- **Ctrl+Z**: Desfazer última ação
- **Ctrl+Y**: Refazer última ação

### Controles Touch/Mouse
- **Click/Tap**: Selecionar célula
- **Shift + Click**: Aplicar cor na célula sem selecioná-la
- **Painel de Números**: Para dispositivos móveis

### Layout de Botões
**Linha Superior (5 botões):**
- **Novo Jogo**: Começa um novo puzzle
- **Limpar**: Limpa o tabuleiro atual
- **Desfazer**: Desfaz última ação
- **Refazer**: Refaz última ação desfeita
- **Notas**: Alterna modo de notas

**Linha Inferior (4 botões):**
- **Dica**: Revela uma célula correta
- **Resposta**: Mostra solução completa
- **Limpar Cores**: Remove todas as marcações de cor
- **Configurações**: Ajustes adicionais

### 🎨 Sistema de Cores Avançado

**Funcionalidades:**
- **Indicador Visual**: Canto superior esquerdo mostra a cor atualmente selecionada
- **6 Cores Disponíveis**: Vermelho, Azul, Verde, Amarelo, Roxo, Laranja + opção Limpar
- **Sempre Ativo**: Sistema sempre ligado, cor pré-selecionada (inicia com vermelho)
- **Ciclo de Cores**: Tecla `C` alterna entre todas as cores
- **Aplicação Rápida**: Tecla `Espaço` aplica cor na célula selecionada
- **Aplicação Precisa**: `Shift + Click` aplica cor sem mudar seleção
- **Integração com Notas**: Anotações ficam mais escuras em células coloridas
- **Persistência**: Cores salvas automaticamente no navegador
- **Feedback Visual**: Animações e notificações confirmam ações

## 🛠️ Estrutura do Projeto

```
public/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos customizados
├── js/
│   ├── main.js            # Arquivo principal da aplicação
│   ├── modules/
│   │   ├── game-enhanced.js       # Lógica principal do jogo
│   │   ├── sudoku-generator.js    # Gerador de puzzles
│   │   ├── validator.js           # Validação de movimentos
│   │   ├── color-system.js        # Sistema de cores para células
│   │   ├── notes-system.js        # Sistema de anotações
│   │   ├── history-system.js      # Sistema de histórico (undo/redo)
│   │   ├── hints-system.js        # Sistema de dicas inteligentes
│   │   └── translations.js        # Sistema de traduções
│   └── utils/
│       └── dom-helpers.js         # Utilitários para DOM
└── assets/
    └── favicon.ico        # Favicon do site
```

## 🔥 Deploy no Firebase

### ✅ Aplicação em Produção
**URL:** https://sudoku-for-mom.web.app

### Pré-requisitos
1. Instalar [Node.js](https://nodejs.org/)
2. Instalar Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

### Passos para Deploy

1. **Login no Firebase**:
   ```bash
   firebase login
   ```

2. **Inicializar o projeto** (se ainda não foi feito):
   ```bash
   firebase init hosting
   ```
   - Selecione "Use an existing project" ou "Create a new project"
   - Configure o diretório público como `public`
   - Configure como SPA (Single Page Application): `Yes`
   - NÃO sobrescreva o index.html

3. **Deploy**:
   ```bash
   firebase deploy
   ```

### Configurações do Firebase

O arquivo `firebase.json` já está configurado com:
- Diretório público: `public`
- Reescrita de rotas para SPA
- Cache otimizado para assets estáticos
- Headers de performance
- **Deploy Automático**: Use `deploy.ps1` (Windows) ou `deploy.bat`

## 🧠 Sistema de Geração de Puzzles

### Algoritmo Avançado com Verificação de Unicidade

O gerador de puzzles utiliza um **algoritmo robusto** que garante que cada puzzle gerado tem **exatamente uma solução única**. Diferente de geradores simples que removem números aleatoriamente, nosso sistema verifica a unicidade a cada remoção.

#### 🔍 **Como Funciona**

1. **Geração da Solução Completa**
   ```javascript
   // Usa backtracking para preencher grid 9x9 válido
   this._fillGrid(this.grid);
   ```

2. **Remoção Inteligente de Números**
   ```javascript
   // Para cada número candidato à remoção:
   grid[row][col] = 0;              // Remove temporariamente
   
   if (this._hasUniqueSolution(grid)) {
       // ✅ Pode remover - mantém unicidade
       removedCount++;
   } else {
       // ❌ Restaura - perderia unicidade
       grid[row][col] = originalValue;
   }
   ```

3. **Verificação de Unicidade**
   ```javascript
   _hasUniqueSolution(grid) {
       const solutions = [];
       this._countSolutions(gridCopy, solutions, 2);
       
       // Único se tem EXATAMENTE 1 solução
       return solutions.length === 1;
   }
   ```

#### 🎯 **Níveis de Dificuldade**

| Dificuldade | Números Removidos | Células Preenchidas | Complexidade |
|-------------|-------------------|-------------------|---------------|
| **Fácil**   | ~40 números       | ~41 células       | Técnicas básicas |
| **Médio**   | ~50 números       | ~31 células       | Eliminação avançada |
| **Difícil** | ~56 números       | ~25 células       | Múltiplas técnicas |
| **Expert**  | ~61 números       | ~20 células       | Forcing chains |
| **Insano**  | ~64 números       | ~17 células       | Técnicas extremas |

#### 🚀 **Vantagens do Sistema**

- **✅ Qualidade Garantida**: Todos os puzzles têm solução única
- **✅ Matematicamente Válido**: Nunca gera puzzles impossíveis
- **✅ Sem Ambiguidade**: Cada puzzle tem apenas uma resposta correta
- **✅ Sistema de Backup**: Fallback para puzzles pré-testados se houver erro
- **✅ Logs Detalhados**: Console mostra processo de geração step-by-step

#### 🔧 **Validação Final**

Cada puzzle passa por validação completa antes de ser apresentado:

```javascript
const validationResult = this._validatePuzzle(this.grid, solution);

// Verifica:
// - Tem solução única? ✅
// - Solução está correta? ✅  
// - Número adequado de células? ✅
// - Grid é válido? ✅
```

#### 📊 **Performance**

- **Tempo de Geração**: 200ms - 2s dependendo da dificuldade
- **Complexidade**: O(k × 9^n) onde k=tentativas, n=células vazias
- **Otimização**: Para na 2ª solução encontrada (não busca todas)
- **Memória**: O(81) para grid + stack de recursão

#### 🧪 **Como Testar**

1. **Console do Navegador**: Abra DevTools em https://sudoku-for-mom.web.app
2. **Arquivo de Teste**: Execute `test-generator.html` para logs detalhados
3. **Logs Esperados**:
   ```
   🎯 Meta: remover 50 números mantendo solução única
   ✅ Removido: posição (0,2) = 4 [1/50]
   ❌ Restaurado: posição (1,3) = 1 (perderia unicidade)
   🎯 Resultado: 47 números removidos de 50 desejados
   ✅ Puzzle validado com sucesso!
   ```

#### 🔄 **Tipos de Geradores Disponíveis**

O projeto inclui **2 sistemas de geração** diferentes:

##### 1. **Gerador Clássico** (`sudoku-generator.js`) - 🎯 **Atualmente Ativo**
```javascript
// Backtracking completo com verificação de unicidade
import { SudokuGenerator } from './sudoku-generator.js';
```

**Características:**
- ✅ **Qualidade Máxima**: Backtracking completo + verificação de unicidade
- ✅ **Infinitas Variações**: Cada puzzle é completamente único
- ✅ **Matematicamente Robusto**: Nunca gera puzzles inválidos
- ⏱️ **Tempo**: 200ms - 2s (depende da dificuldade)
- 🧠 **Complexidade**: Alta - algoritmo sofisticado

##### 2. **Gerador Rápido** (`sudoku-generator-fast.js`) - ⚡ **Alternativa**
```javascript
// Transformações geométricas em puzzles pré-gerados
import { SudokuGenerator } from './sudoku-generator-fast.js';
```

**Características:**
- ⚡ **Performance**: <100ms - super rápido
- 🎲 **Transformações**: Rotações, espelhamentos, troca de números
- 📋 **Templates**: Baseado em puzzles pré-testados
- 🔄 **Variações Limitadas**: Finitas mas suficientes
- 💡 **Complexidade**: Baixa - operações simples

##### **Comparação dos Geradores**

| Aspecto | Gerador Clássico | Gerador Rápido |
|---------|------------------|----------------|
| **Qualidade** | 🌟🌟🌟🌟🌟 Perfeita | 🌟🌟🌟🌟 Muito Boa |
| **Performance** | 🌟🌟 Moderada | 🌟🌟🌟🌟🌟 Excelente |
| **Variedade** | 🌟🌟🌟🌟🌟 Infinita | 🌟🌟🌟 Limitada |
| **Uso de CPU** | 🌟🌟 Alto | 🌟🌟🌟🌟🌟 Baixo |
| **Confiabilidade** | 🌟🌟🌟🌟🌟 100% | 🌟🌟🌟🌟 99% |

**Para alternar entre geradores:**
```javascript
// No arquivo game-enhanced.js, linha 6:
// import { SudokuGenerator } from './sudoku-generator.js';        // Clássico
// import { SudokuGenerator } from './sudoku-generator-fast.js';   // Rápido
```

---

## 🎨 Sistema de Notas (Modo Lápis)

### Funcionalidade Avançada para Anotações

O jogo inclui um **sistema completo de notas** que permite fazer anotações de números possíveis em células vazias.

#### 🎯 **Como Usar**

- **Botão Notas**: Clique no botão laranja para ativar/desativar
- **Tecla Shift**: Pressione Shift para alternar modo notas rapidamente
- **Números 1-9**: No modo notas, adiciona/remove anotações
- **Visual**: Notas aparecem como números pequenos em laranja

#### 🎨 **Cores e Visual**

- **🟫 Preto**: Números originais do puzzle
- **🔵 Azul**: Números inseridos pelo jogador  
- **🟠 Laranja**: Notas/anotações do modo lápis
- **🔴 Vermelho**: Números em conflito (erro)

#### ⚙️ **Funcionalidades**

- **Grid 3x3**: Notas organizadas em grid 3x3 dentro de cada célula
- **Persistência**: Notas salvas no localStorage
- **Auto-limpeza**: Remove notas relacionadas quando célula é preenchida
- **Múltiplas Notas**: Até 9 notas por célula
- **Touch/Mobile**: Funciona perfeitamente em dispositivos móveis

---

## �️ Arquitetura Técnica Detalhada

### 📁 **Estrutura de Módulos**

```
public/js/modules/
├── game-enhanced.js         # 🎮 Lógica principal do jogo
├── sudoku-generator.js      # 🧠 Gerador clássico com verificação
├── sudoku-generator-fast.js # ⚡ Gerador rápido com transformações
├── notes-system.js          # 📝 Sistema completo de notas
├── color-system.js          # 🎨 Sistema de cores para células
├── highlight-system.js      # 🌈 Sistema de destaque visual
├── number-counter.js        # 🔢 Contador de números restantes
├── history-system.js        # ⏮️ Histórico de movimentos (undo/redo)
├── hints-system.js          # 💡 Sistema de dicas inteligentes
├── translations.js          # 🌍 Sistema de traduções
└── validator.js            # ✅ Validação de regras do Sudoku
```

### 🔧 **Sistemas Integrados**

#### 1. **Game Engine** (`game-enhanced.js`)
```javascript
class SudokuGame {
    init() {
        this.initializeAdvancedSystems();  // Inicializa todos os subsistemas
        this.setupCanvas();                 // Configura canvas HTML5
        this.addEventListeners();           // Eventos de teclado/mouse/touch
    }
    
    draw() {
        this.drawGrid();                    // Desenha grade 9x9
        this.drawNumbers();                 // Números com cores diferenciadas
        this.drawCellNotes();              // Notas do sistema de lápis
        this.highlightSystem.draw();        // Destaques e seleções
    }
}
```

#### 2. **Notes System** (`notes-system.js`)
```javascript
class NotesSystem {
    constructor(gameInstance) {
        this.notesData = new Map();        // Map<cellIndex, Set<numbers>>
        this.isNotesMode = false;          // Estado do modo notas
    }
    
    toggleNote(cell, number) {
        // Grid 3x3 de notas por célula
        // Persistência em localStorage
        // Integração com canvas drawing
    }
}
```

#### 3. **Generator System** (2 implementações)
```javascript
// Gerador Clássico - Backtracking + Verificação
_removeNumbers(grid, difficulty) {
    for (const [row, col] of candidates) {
        grid[row][col] = 0;                // Remove temporariamente
        
        if (this._hasUniqueSolution(grid)) {
            removedCount++;                // ✅ Mantém remoção
        } else {
            grid[row][col] = originalValue; // ❌ Restaura
        }
    }
}

// Gerador Rápido - Transformações Geométricas  
createVariation(basePuzzle) {
    const transformations = ['rotate90', 'flipHorizontal', 'swapNumbers'];
    const chosen = transformations[Math.random() * transformations.length];
    return this[chosen](basePuzzle);
}
```

#### 4. **Multi-Language System** (`translations.js`)
```javascript
const translations = {
    pt: { newGame: "Novo Jogo", hints: "Dicas" },
    en: { newGame: "New Game", hints: "Hints" },  
    ja: { newGame: "新しいゲーム", hints: "ヒント" }
};

function updateUIText() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = getCurrentTranslations()[key];
    });
}
```

### 🎨 **Rendering Pipeline**

#### Canvas Drawing Sequence:
1. **`drawGrid()`** - Grade 9x9 com bordas diferenciadas
2. **`drawNumbers()`** - Números com cores por categoria:
   - `#000000` - Números originais (preto)
   - `#1E3A8A` - Números do jogador (azul)
   - `#F97316` - Notas do lápis (laranja)
   - `#dc2626` - Conflitos (vermelho)
3. **`drawCellNotes()`** - Grid 3x3 de notas por célula
4. **`drawSelection()`** - Destaque da célula selecionada
5. **`drawHighlights()`** - Números relacionados destacados

### 📱 **Touch/Mobile Optimization**

```javascript
// Detecção de dispositivo
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/.test(navigator.userAgent);

// Events otimizados
addEventListener(canvas, 'touchstart', handleTouch, { passive: false });
addEventListener(canvas, 'touchmove', handleTouch, { passive: false });

// Debounce para resize
window.addEventListener('resize', debounce(() => this.resizeAndDraw(), 250));
```

### 🔍 **Debug e Monitoring**

#### Console Logs Estruturados:
```javascript
console.log('🔧 Iniciando geração do puzzle...');
console.log('✅ Removido: posição (0,2) = 4 [1/50]');
console.log('❌ Restaurado: posição (1,3) = 1 (perderia unicidade)');
console.log('🎯 Resultado: 47 números removidos de 50 desejados');
console.log('📊 Estatísticas:', { filledCells: 34, emptyCells: 47 });
```

#### Performance Tracking:
```javascript
const startTime = performance.now();
const result = generator.generate(difficulty);
const endTime = performance.now();
console.log(`⏱️ Tempo de geração: ${(endTime - startTime).toFixed(2)}ms`);
```

---

## �🎯 Funcionalidades Técnicas

### Arquitetura Modular
- **ES6 Modules**: Código organizado em módulos
- **Separação de Responsabilidades**: Cada módulo tem uma função específica
- **Reutilização de Código**: Utilitários e helpers compartilhados

### Performance
- **Geração Assíncrona**: Puzzles gerados sem bloquear a UI
- **Debounce**: Redimensionamento otimizado
- **Cache de Assets**: Configurado no Firebase

### Acessibilidade
- **ARIA Labels**: Suporte a leitores de tela
- **Navegação por Teclado**: Totalmente acessível via teclado
- **Contraste**: Cores adequadas para visibilidade
- **Focus Management**: Indicadores visuais de foco

### Responsividade
- **Mobile First**: Projetado primeiro para mobile
- **Touch Optimized**: Controles otimizados para touch
- **Adaptive Layout**: Layout que se adapta ao tamanho da tela

## 🌍 Idiomas Suportados

- **Português (PT)**: Idioma padrão
- **English (EN)**: Inglês
- **日本語 (JA)**: Japonês (com fonte específica)

## 🎨 Tecnologias Utilizadas

- **HTML5 Canvas**: Para renderização do tabuleiro
- **Vanilla JavaScript**: ES6+ com módulos
- **Tailwind CSS**: Framework CSS utilitário
- **Google Fonts**: Inter e Noto Sans JP
- **Firebase Hosting**: Deploy e hospedagem

## 📱 PWA Ready

O projeto está preparado para ser convertido em PWA:
- Meta tags configuradas
- Service Worker comentado (descomente para ativar)
- Manifest.json pode ser adicionado

## 🐛 Suporte e Contribuições

Este projeto foi criado com carinho para proporcionar uma experiência de jogo de Sudoku moderna e acessível.

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é livre para uso pessoal e educacional.

---

Feito com ❤️ para a mamãe 🎮
