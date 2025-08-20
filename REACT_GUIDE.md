# 📚 Documentação dos Componentes - Sudoku React

## 🎯 Visão Geral

Esta documentação descreve os componentes React criados para o jogo de Sudoku, suas props, estado interno e exemplos de uso.

---

## 🎮 `SudokuCanvas`

### Descrição
Componente responsável por renderizar o tabuleiro de Sudoku usando HTML5 Canvas. Gerencia a visualização do jogo e interações de clique.

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `puzzle` | `number[][]` | ✅ | Array 9x9 com o puzzle original (0 = vazio) |
| `playerBoard` | `number[][]` | ✅ | Array 9x9 com o estado atual do jogo |
| `selected` | `{row: number, col: number}` | ✅ | Célula atualmente selecionada |
| `conflicts` | `number[][]` | ❌ | Array com células em conflito |
| `onCellClick` | `(row: number, col: number) => void` | ✅ | Callback para clique em célula |

### Estado Interno
```jsx
const canvasRef = useRef(null); // Referência para o elemento canvas
```

### Exemplo de Uso
```jsx
import SudokuCanvas from './components/Game/SudokuCanvas';

function Game() {
    const [gameState, setGameState] = useState({
        puzzle: [[5,3,0,/*...*/], /*...*/],
        playerBoard: [[5,3,4,/*...*/], /*...*/],
        selected: { row: 0, col: 2 }
    });

    const handleCellClick = (row, col) => {
        setGameState(prev => ({
            ...prev,
            selected: { row, col }
        }));
    };

    return (
        <SudokuCanvas 
            puzzle={gameState.puzzle}
            playerBoard={gameState.playerBoard}
            selected={gameState.selected}
            onCellClick={handleCellClick}
        />
    );
}
```

### Métodos Internos

#### `drawGrid(ctx, size, cellSize)`
- Desenha as linhas do grid 9x9
- Linhas finas para células, grossas para quadrantes 3x3

#### `drawNumbers(ctx, board, cellSize)`
- Renderiza os números no canvas
- Aplica cores diferentes: preto (originais), azul (jogador)

#### `drawSelection(ctx, selected, cellSize)`
- Destaca a célula selecionada com overlay azul translúcido

---

## 🎮 `GameControls`

### Descrição
Componente que agrupa todos os controles do jogo: botões de ação, painel de números e seletor de idioma.

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `gameState` | `GameState` | ✅ | Estado completo do jogo |
| `onNumberInput` | `(number: number) => void` | ✅ | Callback para entrada de números |
| `onNewGame` | `() => void` | ✅ | Callback para novo jogo |
| `onToggleNotes` | `() => void` | ✅ | Callback para alternar modo notas |
| `language` | `string` | ✅ | Idioma atual ('pt', 'en', 'ja') |
| `onLanguageChange` | `(lang: string) => void` | ✅ | Callback para mudança de idioma |

### Tipos
```typescript
interface GameState {
    puzzle: number[][];
    solution: number[][];
    playerBoard: number[][];
    selected: { row: number; col: number };
    difficulty: string;
    isComplete: boolean;
    conflicts: number[][];
    isNotesMode: boolean;
}
```

### Exemplo de Uso
```jsx
import GameControls from './components/Game/GameControls';

function App() {
    const gameHook = useSudokuGame();
    const { language, setLanguage } = useTranslations();

    const handleNumberInput = (number) => {
        const { row, col } = gameHook.gameState.selected;
        if (row >= 0 && col >= 0) {
            gameHook.placeNumber(row, col, number);
        }
    };

    return (
        <GameControls 
            gameState={gameHook.gameState}
            onNumberInput={handleNumberInput}
            onNewGame={() => gameHook.startNewGame()}
            onToggleNotes={gameHook.toggleNotesMode}
            language={language}
            onLanguageChange={setLanguage}
        />
    );
}
```

---

## 🎯 `DifficultySelector`

### Descrição
Componente para seleção do nível de dificuldade do jogo.

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `currentDifficulty` | `string` | ✅ | Dificuldade atual ('easy', 'medium', 'hard', etc.) |
| `onDifficultyChange` | `(difficulty: string) => void` | ✅ | Callback para mudança de dificuldade |
| `disabled` | `boolean` | ❌ | Desabilita seletor durante geração |

### Estado Interno
```jsx
const difficulties = ['easy', 'medium', 'hard', 'expert', 'insane'];
```

### Exemplo de Uso
```jsx
import DifficultySelector from './components/Game/DifficultySelector';

function Game() {
    const [difficulty, setDifficulty] = useState('medium');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDifficultyChange = async (newDifficulty) => {
        setIsGenerating(true);
        await generateNewGame(newDifficulty);
        setDifficulty(newDifficulty);
        setIsGenerating(false);
    };

    return (
        <DifficultySelector 
            currentDifficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            disabled={isGenerating}
        />
    );
}
```

---

## 🔢 `NumberPad`

### Descrição
Painel com números 1-9 para entrada em dispositivos móveis.

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `onNumberClick` | `(number: number) => void` | ✅ | Callback para clique em número |
| `isNotesMode` | `boolean` | ❌ | Indica se está no modo notas |

### Exemplo de Uso
```jsx
import NumberPad from './components/Game/NumberPad';

function MobileControls() {
    const [isNotesMode, setIsNotesMode] = useState(false);

    const handleNumberClick = (number) => {
        if (isNotesMode) {
            addNote(number);
        } else {
            placeNumber(number);
        }
    };

    return (
        <NumberPad 
            onNumberClick={handleNumberClick}
            isNotesMode={isNotesMode}
        />
    );
}
```

---

## 📝 `NotesButton`

### Descrição
Botão para alternar entre modo normal e modo notas (lápis).

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `isActive` | `boolean` | ✅ | Estado atual do modo notas |
| `onClick` | `() => void` | ✅ | Callback para clique no botão |

### Exemplo de Uso
```jsx
import NotesButton from './components/UI/NotesButton';

function GameControls() {
    const [isNotesMode, setIsNotesMode] = useState(false);

    const toggleNotesMode = () => {
        setIsNotesMode(prev => !prev);
    };

    return (
        <NotesButton 
            isActive={isNotesMode}
            onClick={toggleNotesMode}
        />
    );
}
```

---

## 🌍 `LanguageSelector`

### Descrição
Seletor de idioma com suporte a Português, Inglês e Japonês.

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `currentLanguage` | `string` | ✅ | Idioma atual ('pt', 'en', 'ja') |
| `onLanguageChange` | `(lang: string) => void` | ✅ | Callback para mudança de idioma |

### Estado Interno
```jsx
const languages = [
    { code: 'pt', label: 'PT', name: 'Português' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'ja', label: 'JP', name: '日本語' }
];
```

### Exemplo de Uso
```jsx
import LanguageSelector from './components/UI/LanguageSelector';

function Header() {
    const { language, setLanguage } = useTranslations();

    return (
        <header>
            <h1>Sudoku Game</h1>
            <LanguageSelector 
                currentLanguage={language}
                onLanguageChange={setLanguage}
            />
        </header>
    );
}
```

---

## 🎮 Hook: `useSudokuGame`

### Descrição
Hook customizado que gerencia todo o estado e lógica do jogo de Sudoku.

### Retorno

```typescript
interface UseSudokuGameReturn {
    // Estado
    gameState: {
        puzzle: number[][];
        solution: number[][];
        playerBoard: number[][];
        selected: { row: number; col: number };
        difficulty: string;
        isComplete: boolean;
        conflicts: number[][];
        isNotesMode: boolean;
    };
    uiState: {
        isGenerating: boolean;
        showHint: boolean;
        language: string;
    };
    
    // Ações
    startNewGame: (difficulty?: string) => Promise<void>;
    placeNumber: (row: number, col: number, number: number) => void;
    selectCell: (row: number, col: number) => void;
    toggleNotesMode: () => void;
    setLanguage: (lang: string) => void;
}
```

### Exemplo de Uso
```jsx
import { useSudokuGame } from './hooks/useSudokuGame';

function App() {
    const {
        gameState,
        uiState,
        startNewGame,
        placeNumber,
        selectCell,
        toggleNotesMode
    } = useSudokuGame();

    // Usar estado e ações conforme necessário
    const handleCellClick = (row, col) => {
        selectCell(row, col);
    };

    const handleNumberInput = (number) => {
        const { row, col } = gameState.selected;
        if (row >= 0 && col >= 0) {
            placeNumber(row, col, number);
        }
    };

    return (
        <div>
            {/* Usar gameState e uiState para renderizar UI */}
        </div>
    );
}
```

---

## 🌍 Hook: `useTranslations`

### Descrição
Hook para gerenciamento de traduções multilíngues.

### Retorno

```typescript
interface UseTranslationsReturn {
    t: (key: string) => string;
    language: string;
    setLanguage: (lang: string) => void;
    languages: Array<{code: string, label: string, name: string}>;
}
```

### Exemplo de Uso
```jsx
import { useTranslations } from './hooks/useTranslations';

function GameUI() {
    const { t, language, setLanguage } = useTranslations();

    return (
        <div>
            <h1>{t('title')}</h1>
            <button onClick={() => setLanguage('en')}>
                {t('changeLanguage')}
            </button>
            <p>{t('currentLanguage')}: {language}</p>
        </div>
    );
}
```

---

## 💾 Hook: `useLocalStorage`

### Descrição
Hook para persistência de dados no localStorage.

### Parâmetros
- `key: string` - Chave do localStorage
- `initialValue: T` - Valor inicial se não existir

### Retorno
```typescript
[value: T, setValue: (value: T) => void]
```

### Exemplo de Uso
```jsx
import { useLocalStorage } from './hooks/useLocalStorage';

function Settings() {
    const [difficulty, setDifficulty] = useLocalStorage('difficulty', 'medium');
    const [language, setLanguage] = useLocalStorage('language', 'pt');

    return (
        <div>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
            </select>
        </div>
    );
}
```

---

## 🎯 Boas Práticas Implementadas

### 1. **Separação de Responsabilidades**
- Cada componente tem uma única responsabilidade
- Lógica de negócio separada em hooks customizados
- UI separada da lógica de estado

### 2. **Estado Imutável**
```jsx
// ✅ Sempre criar novos objetos/arrays
setGameState(prev => ({
    ...prev,
    playerBoard: newBoard.map(row => [...row])
}));
```

### 3. **Otimização de Performance**
```jsx
// ✅ useCallback para funções estáveis
const placeNumber = useCallback((row, col, number) => {
    // lógica
}, [gameState.puzzle]);

// ✅ useMemo para cálculos pesados
const conflictCells = useMemo(() => {
    return calculateConflicts(playerBoard);
}, [playerBoard]);
```

### 4. **Props Tipadas**
```jsx
// ✅ Props bem definidas e documentadas
interface SudokuCanvasProps {
    puzzle: number[][];
    playerBoard: number[][];
    selected: { row: number; col: number };
    onCellClick: (row: number, col: number) => void;
}
```

### 5. **Tratamento de Eventos**
```jsx
// ✅ Prevent default quando necessário
const handleSubmit = (e) => {
    e.preventDefault(); // Previne reload da página
    // lógica do submit
};
```

### 6. **Loading States**
```jsx
// ✅ Feedback visual durante operações assíncronas
{uiState.isGenerating ? (
    <LoadingSpinner />
) : (
    <SudokuCanvas {...props} />
)}
```

---

*Documentação criada para facilitar o desenvolvimento e manutenção dos componentes React do jogo de Sudoku.*
