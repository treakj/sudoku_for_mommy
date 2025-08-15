# Sudoku for Mom - Documentação Completa

## Visão Geral

**Sudoku for Mom** é uma aplicação web de Sudoku desenvolvida especialmente para dispositivos móveis, com foco em acessibilidade e facilidade de uso. A aplicação foi construída com tecnologias web modernas (HTML5, CSS3, JavaScript ES6+) e não requer instalação.

## Arquitetura do Sistema

A aplicação segue uma arquitetura modular baseada em componentes, onde cada funcionalidade é encapsulada em classes independentes que se comunicam através de eventos customizados.

### Estrutura de Diretórios

```
sudoku_for_mom/
├── public/
│   ├── index.html          # Página principal
│   ├── js/
│   │   ├── main.js         # Ponto de entrada da aplicação
│   │   ├── modules/        # Módulos do jogo
│   │   │   ├── game-enhanced.js    # Core do jogo
│   │   │   ├── sudoku-generator.js # Gerador de puzzles
│   │   │   ├── validator.js        # Validador de movimentos
│   │   │   ├── notes-system.js     # Sistema de anotações
│   │   │   ├── highlight-system.js # Sistema de destaque
│   │   │   ├── hints-system.js     # Sistema de dicas
│   │   │   ├── history-system.js   # Sistema de histórico
│   │   │   ├── number-counter.js   # Contador de números
│   │   │   └── translations.js     # Sistema de traduções
│   │   └── utils/
│   │       └── dom-helpers.js      # Utilitários DOM
│   ├── css/
│   └── assets/
├── CHANGELOG.md            # Registro de mudanças
├── README.md              # Documentação inicial
└── DOCUMENTATION.md       # Este arquivo
```

## Componentes Principais

### 1. SudokuGame (game-enhanced.js)

**Responsabilidade**: Gerenciar toda a lógica do jogo, estado do tabuleiro e coordenação entre sistemas.

**Funcionalidades**:
- Inicialização do jogo e canvas
- Gerenciamento de estado (tabuleiro inicial, tabuleiro do jogador, solução)
- Coordenação entre todos os sistemas auxiliares
- Manipulação de eventos de usuário (cliques, teclado, toque)
- Renderização do tabuleiro
- Controle de dificuldade

**Métodos principais**:
- `init()`: Inicializa o jogo
- `startNewGame()`: Inicia novo puzzle
- `resetBoard()`: Reseta para estado inicial
- `handleCellClick()`: Processa cliques no tabuleiro
- `handleKeyPress()`: Processa entrada do teclado
- `draw()`: Renderiza o tabuleiro completo

**Integração com outros sistemas**:
- Inicializa: `HighlightSystem`, `NumberCounter`, `NotesSystem`, `HistorySystem`, `HintsSystem`
- Comunicação via eventos customizados: `sudoku-cell-changed`, `sudoku-notes-changed`

### 2. SudokuGenerator (sudoku-generator.js)

**Responsabilidade**: Gerar puzzles válidos de Sudoku com diferentes níveis de dificuldade.

**Algoritmo de Geração**:
1. **Preenchimento**: Usa backtracking para preencher completamente o grid 9x9
2. **Remoção**: Remove números baseado no nível de dificuldade
3. **Validação**: Verifica unicidade da solução e validade do puzzle
4. **Fallback**: Usa puzzle pré-definido caso a geração falhe

**Níveis de Dificuldade**:
- **Easy**: 36-40 números removidos (41-45 preenchidos)
- **Medium**: 40-44 números removidos (37-41 preenchidos)
- **Hard**: 44-48 números removidos (33-37 preenchidos)
- **Expert**: 48-52 números removidos (29-33 preenchidos)
- **Insane**: 52-56 números removidos (25-29 preenchidos)

**Métodos principais**:
- `generate(difficulty)`: Gera novo puzzle
- `_fillGrid(grid)`: Preenche grid com backtracking
- `_removeNumbers(grid, difficulty)`: Remove números para criar puzzle
- `_validatePuzzle(puzzle, solution)`: Valida puzzle gerado

### 3. Validator (validator.js)

**Responsabilidade**: Validar regras do Sudoku e verificar movimentos.

**Regras Validadas**:
- Números únicos por linha
- Números únicos por coluna
- Números únicos por quadrante 3x3
- Conflitos entre células
- Completude do tabuleiro

**Métodos principais**:
- `isMoveValid(board, row, col, num)`: Verifica se movimento é válido
- `isBoardComplete(board)`: Verifica se puzzle está completo
- `findConflicts(board)`: Encontra todos os conflitos
- `getPossibleNumbers(board, row, col)`: Retorna números possíveis para posição

### 4. NotesSystem (notes-system.js)

**Responsabilidade**: Gerenciar o modo "lápis" para anotações nas células.

**Funcionalidades**:
- Toggle de modo notas via botão ou teclas (Q/N)
- Paletas de cores (6 cores disponíveis)
- Anotações em células vazias
- Persistência em localStorage
- Integração com sistema de cores

**Ciclo de cores disponíveis**:
1. Laranja (#F97316)
2. Azul (#3B82F6)
3. Verde (#10B981)
4. Roxo (#8B5CF6)
5. Rosa (#EC4899)
6. Vermelho (#EF4444)

**Métodos principais**:
- `toggleNotesMode()`: Alterna modo notas
- `toggleNoteByIndex(cellIndex, number)`: Adiciona/remove nota
- `cyclePalette()`: Alterna entre paletas de cores
- `reset()`: Limpa todas as notas

### 5. HighlightSystem (highlight-system.js)

**Responsabilidade**: Fornecer feedback visual inteligente ao usuário.

**Tipos de Destaque**:
- **Números iguais**: Destaca todas as células com o mesmo número
- **Conflitos**: Mostra células em conflito em vermelho
- **Guias**: Destaca linha, coluna e quadrante da célula selecionada
- **Modo daltônico**: Suporte para usuários com deficiência visual

**Métodos principais**:
- `selectNumber(number)`: Seleciona número para destaque
- `applyHighlight()`: Aplica destaques ao tabuleiro
- `clearHighlight()`: Remove todos os destaques
- `handleCellClick(cell)`: Processa cliques para destaque

### 6. HintsSystem (hints-system.js)

**Responsabilidade**: Fornecer dicas inteligentes baseadas em estratégias de Sudoku.

**Estratégias Implementadas**:
1. **Naked Single**: Único número possível para célula
2. **Hidden Single**: Único local para número em região
3. **Naked Pair**: Par de números que só podem ir em duas células
4. **Pointing Pair**: Técnica de eliminação entre box e linha/coluna
5. **Box-Line Reduction**: Redução de possibilidades

**Métodos principais**:
- `getHint()`: Solicita nova dica
- `findBestHint()`: Encontra melhor dica disponível
- `displayHint(hint)`: Mostra dica ao usuário
- `applyCurrentHint()`: Aplica dica no tabuleiro

### 7. HistorySystem (history-system.js)

**Responsabilidade**: Gerenciar histórico de jogadas com undo/redo.

**Funcionalidades**:
- Registro completo de todas as jogadas
- Undo/Redo via botões ou atalhos (Ctrl+Z / Ctrl+Y)
- Persistência em localStorage
- Visualização de histórico detalhado
- Limite de 100 jogadas no histórico

**Tipos de jogadas registradas**:
- `place`: Colocar número
- `erase`: Apagar número
- `change`: Trocar número
- `note-add`: Adicionar nota
- `note-remove`: Remover nota

**Métodos principais**:
- `recordMove(moveData)`: Registra nova jogada
- `undo()`: Desfaz última jogada
- `redo()`: Refaz jogada desfeita
- `clearHistory()`: Limpa histórico

### 8. NumberCounter (number-counter.js)

**Responsabilidade**: Contar e exibir uso de cada número (1-9).

**Funcionalidades**:
- Contagem em tempo real de números usados
- Barra de progresso visual
- Indicação de números completos (9 usados)
- Clique para destacar todas as ocorrências
- Toggle de visibilidade

**Métodos principais**:
- `updateAllCounts()`: Atualiza contagens
- `selectNumber(number)`: Seleciona número para destaque
- `toggleVisibility()`: Mostra/esconde contador
- `getIncompleteNumbers()`: Retorna números não completos

### 9. Translations (translations.js)

**Responsabilidade**: Gerenciar traduções para múltiplos idiomas.

**Idiomas Suportados**:
- Português (pt)
- English (en)
- 日本語 (ja)

**Funcionalidades**:
- Tradução dinâmica de interface
- Tradução de instruções "How to Play"
- Persistência de preferência de idioma
- Toggle de idioma via botão na interface

### 10. DOM Helpers (dom-helpers.js)

**Responsabilidade**: Fornecer utilitários para manipulação do DOM.

**Funções disponíveis**:
- Seleção de elementos com tratamento de erros
- Manipulação de classes CSS
- Controle de modais
- Coordenadas relativas para toque/clique
- Função debounce para otimização

## Fluxo de Execução

### Inicialização
1. `main.js` é carregado e executa `initializeApp()`
2. `SudokuGame` é instanciado com o canvas
3. Canvas é configurado com dimensões responsivas
4. Todos os sistemas auxiliares são inicializados
5. Primeiro puzzle é gerado e exibido

### Interação do Usuário
1. **Clique em célula**: `SudokuGame.handleCellClick()` processa seleção
2. **Entrada de número**: `SudokuGame.handleKeyPress()` valida e aplica mudança
3. **Mudança detectada**: Evento `sudoku-cell-changed` é disparado
4. **Sistemas reagem**: Cada sistema atualiza seu estado baseado no evento
5. **Renderização**: Tabuleiro é redesenhado com novos estados

### Ciclo de Vida de uma Jogada
1. Usuário interage (clique/teclado)
2. `SudokuGame` processa a ação
3. `Validator` verifica validade do movimento
4. `HistorySystem` registra a jogada
5. `NumberCounter` atualiza contagens
6. `HighlightSystem` atualiza destaques
7. Tabuleiro é redesenhado

## Eventos Customizados

### Eventos Disparados
- `sudoku-cell-changed`: Quando uma célula é modificada
- `sudoku-notes-changed`: Quando notas são modificadas
- `new-game`: Quando novo jogo é iniciado
- `reset`: Quando tabuleiro é resetado

### Eventos Escutados
- Cada sistema escuta eventos relevantes para manter consistência

## Armazenamento Local

### localStorage Keys
- `sudoku-notes`: Notas do usuário
- `sudoku-notes-palette`: Paleta de cores selecionada
- `sudoku-history`: Histórico de jogadas
- `sudoku-language`: Idioma preferido
- `sudoku-difficulty`: Nível de dificuldade

### Persistência
- Dados são salvos automaticamente após cada mudança
- Recuperação automática ao carregar a página
- Limpeza automática ao iniciar novo jogo

## Responsividade

### Design Mobile-First
- Canvas responsivo que se adapta à tela
- Touch events para dispositivos móveis
- Botões grandes para fácil interação
- Scroll prevention para evitar zoom acidental

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Performance

### Otimizações
- Debounce em eventos de resize
- Renderização eficiente com Canvas 2D
- Lazy loading de sistemas auxiliares
- Minimização de reflows/repaints

### Métricas
- Tempo de inicialização: < 500ms
- Tempo de geração de puzzle: < 2s
- FPS durante interação: 60fps

## Segurança

### Validação de Entrada
- Todos os inputs são validados antes de processamento
- Proteção contra XSS via escape de strings
- Limites de tamanho em dados armazenados

### Isolamento
- Cada sistema opera em seu próprio escopo
- Comunicação apenas via eventos
- Sem dependências externas críticas

## Extensibilidade

### Adicionar Novos Sistemas
1. Criar nova classe no diretório `modules/`
2. Importar em `game-enhanced.js`
3. Inicializar no método `initializeAdvancedSystems()`
4. Escutar eventos relevantes

### Adicionar Novos Idiomas
1. Adicionar traduções em `translations.js`
2. Atualizar array de idiomas disponíveis
3. Adicionar botão de seleção na interface

## Debugging

### Console Logs
- Logs detalhados em desenvolvimento
- Níveis: info, warn, error
- Prefixos identificadores para cada sistema

### Ferramentas de Desenvolvimento
- Modo debug via parâmetro URL: `?debug=true`
- Visualização de estado interno
- Testes de performance integrados

## Deploy

### Firebase Hosting
- Deploy automático via GitHub Actions
- CDN global para performance otimizada
- SSL automático
- Cache estratégico de assets

### Build Process
- Minificação de JavaScript
- Otimização de imagens
- Geração de service worker
- Versionamento automático

## Suporte

### Navegadores Suportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Features Requeridas
- Canvas 2D
- localStorage
- ES6 Modules
- Touch events (mobile)

## Contribuição

### Guidelines
- Seguir padrão de código existente
- Adicionar documentação JSDoc
- Incluir testes para novos sistemas
- Manter compatibilidade mobile

### Processo
1. Fork do repositório
2. Feature branch: `feature/nova-funcionalidade`
3. Pull request com descrição detalhada
4. Code review antes do merge

## Licença

Este projeto é open source sob a licença MIT. Veja o arquivo LICENSE para detalhes.

---

## Índice de Arquivos

| Arquivo | Descrição | Classes/Funções Principais |
|---------|-----------|---------------------------|
| `index.html` | Estrutura HTML da aplicação | - |
| `main.js` | Ponto de entrada e inicialização | `initializeApp()`, `setupDifficultyControls()` |
| `game-enhanced.js` | Core do jogo | `SudokuGame` |
| `sudoku-generator.js` | Gerador de puzzles | `SudokuGenerator` |
| `validator.js` | Validador de regras | `Validator` |
| `notes-system.js` | Sistema de anotações | `NotesSystem` |
| `highlight-system.js` | Sistema de destaque | `HighlightSystem` |
| `hints-system.js` | Sistema de dicas | `HintsSystem` |
| `history-system.js` | Sistema de histórico | `HistorySystem` |
| `number-counter.js` | Contador de números | `NumberCounter` |
| `translations.js` | Sistema de traduções | `getCurrentTranslations()`, `toggleLanguage()` |
| `dom-helpers.js` | Utilitários DOM | `getElementById()`, `debounce()`, etc. |

---

*Documentação gerada automaticamente em ${new Date().toLocaleDateString('pt-BR')}*