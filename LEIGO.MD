# 📖 Guia Leigo - Sudoku for Mommy

**Uma explicação simples de como tudo funciona no jogo**

---

## 🎮 O Que Cada Botão Faz

### 📱 **Linha Superior - Botões Principais**

#### 1. **Novo Jogo** 🆕
- **O que faz**: Cria um novo puzzle de Sudoku
- **Função no código**: `startNewGame()` em `game-enhanced.js:160`
- **Como é detectado**: Click no botão → evento `click` → chama a função
- **O que acontece**:
  1. Mostra tela de carregamento
  2. Gera novo puzzle com números únicos
  3. Limpa todas as anotações e cores
  4. Reseta contador de dicas para 3

#### 2. **Limpar** 🧹
- **O que faz**: Apaga tudo que você escreveu, volta ao puzzle original
- **Função no código**: `resetBoard()` em `game-enhanced.js:224`
- **Como é detectado**: Click no botão → evento `click` → chama a função
- **O que acontece**:
  1. Copia o puzzle original de volta
  2. Remove todos os números que você colocou
  3. Limpa notas e cores
  4. Mantém as dicas disponíveis

#### 3. **Desfazer** ↶
- **O que faz**: Volta uma jogada para trás
- **Função no código**: `undo()` em `history-system.js`
- **Como é detectado**: Click no botão OU tecla `Ctrl+Z`
- **O que acontece**:
  1. Pega a última ação do histórico
  2. Reverte a mudança
  3. Atualiza o tabuleiro
  4. Remove essa ação da lista de "feitos"

#### 4. **Refazer** ↷
- **O que faz**: Refaz uma jogada que você desfez
- **Função no código**: `redo()` em `history-system.js`
- **Como é detectado**: Click no botão OU tecla `Ctrl+Y`
- **O que acontece**:
  1. Pega a última ação desfeita
  2. Aplica novamente
  3. Atualiza o tabuleiro
  4. Move a ação de volta para "feitos"

#### 5. **Notas** 📝
- **O que faz**: Liga/desliga o modo de anotações (números pequenos)
- **Função no código**: `toggleNotesMode()` em `notes-system.js:131`
- **Como é detectado**: Click no botão OU teclas `Q` ou `N`
- **O que acontece quando LIGA**:
  1. Botão fica colorido (cor da paleta atual)
  2. Números 1-9 viram anotações pequenas
  3. Modo especial: escrever não substitui, adiciona nota
- **O que acontece quando DESLIGA**:
  1. Botão volta ao normal (cinza)
  2. Números 1-9 voltam a ser normais
  3. Anotações ficam visíveis mas paradas

---

### 📱 **Linha Inferior - Botões de Ajuda**

#### 6. **Dica** 💡
- **O que faz**: Revela um número correto automaticamente
- **Função no código**: `giveHint()` em `game-enhanced.js:499`
- **Como é detectado**: Click no botão OU tecla `H`
- **O que acontece**:
  1. Procura uma célula vazia
  2. Pega o número correto da solução
  3. Coloca o número na célula
  4. Reduz contador de dicas (-1)
  5. Quando chegam a 0, botão fica desabilitado

#### 7. **Resposta** 📋
- **O que faz**: Mostra a solução completa do puzzle
- **Função no código**: Sistema de modal com solução
- **Como é detectado**: Click no botão
- **O que acontece**:
  1. Abre janela popup
  2. Mostra tabuleiro com todos os números corretos
  3. Você pode ver mas não altera seu jogo
  4. Fechar a janela volta ao seu progresso

#### 8. **Limpar Cores** 🎨
- **O que faz**: Remove todas as marcações coloridas das células
- **Função no código**: `clearAllColors()` em sistema de cores
- **Como é detectado**: Click no botão
- **O que acontece**:
  1. Percorre todas as 81 células
  2. Remove cor de fundo de cada uma
  3. Mantém números e anotações
  4. Atualiza a tela

#### 9. **Configurações** ⚙️
- **O que faz**: Abre menu com opções do jogo
- **Função no código**: Sistema de modal de configurações
- **Como é detectado**: Click no botão
- **O que acontece**:
  1. Abre janela de configurações
  2. Permite trocar idioma (PT/EN/JP)
  3. Ajustar dificuldade
  4. Outras preferências

---

## 🖱️ **Como o Jogo Detecta Suas Ações**

### **1. Cliques no Tabuleiro**
```
Você clica → JavaScript pega posição X,Y → Calcula qual célula → Seleciona a célula
```
- **Função**: `handleCellClick()` em `game-enhanced.js:261`
- **Como funciona**: 
  1. Pega onde você clicou (coordenadas)
  2. Divide pelo tamanho da célula
  3. Descobre linha e coluna
  4. Seleciona a célula

### **2. Teclas do Teclado**
```
Você pressiona tecla → JavaScript detecta → Verifica qual tecla → Executa ação
```
- **Função**: `handleKeyPress()` em `game-enhanced.js:320`
- **Teclas especiais**:
  - `1-9`: Coloca número OU faz anotação
  - `Delete/Backspace`: Apaga número
  - `Q` ou `N`: Liga/desliga notas
  - `C`: Troca cor das anotações
  - `Setas`: Move seleção
  - `Espaço`: Aplica cor na célula

### **3. Números e Anotações**
```
Modo normal: Número substitui célula
Modo notas: Número vira anotação pequena
```
- **Como decide**: Verifica se `isNotesMode` está ligado
- **Se modo normal**: `setNumber()` coloca número grande
- **Se modo notas**: `toggleNoteByIndex()` adiciona nota pequena

---

## 🎨 **Sistema de Cores das Anotações**

### **Como Funciona**
1. **6 cores disponíveis**: Laranja, Azul, Verde, Roxo, Rosa, Vermelho
2. **Tecla C**: Troca entre as cores
3. **Cada nota lembra sua cor**: Mesmo mudando paleta, nota mantém cor original

### **Exemplo Prático**
```
1. Liga modo notas (Q)
2. Escreve "5" → nota laranja
3. Troca cor (C) → agora é azul
4. Escreve "7" → nota azul
5. Escreve "5" de novo → muda para azul (ao invés de apagar)
6. Escreve "5" de novo → agora apaga (mesma cor)
```

---

## 🔄 **Fluxo de Uma Jogada Completa**

### **Exemplo: Colocar número 7 na célula**

1. **Você clica numa célula**
   - `handleCellClick()` detecta posição
   - `selectCell()` marca a célula

2. **Você pressiona tecla "7"**
   - `handleKeyPress()` detecta a tecla
   - Verifica se é modo notas ou normal

3. **Se modo NORMAL**:
   - `setNumber()` coloca o 7 na célula
   - `updateConflicts()` verifica se tem erro
   - `draw()` redesenha tudo na tela
   - `historySystem` salva a jogada

4. **Se modo NOTAS**:
   - `toggleNoteByIndex()` adiciona nota "7"
   - Usa cor atual da paleta
   - `draw()` redesenha com nota pequena
   - Salva no localStorage

5. **Sistema verifica se ganhou**:
   - `isGameComplete()` verifica se acabou
   - Se sim: mostra parabéns
   - Se não: continua jogando

---

## 🧠 **Como o Jogo "Lembra" das Coisas**

### **localStorage (Memória do Navegador)**
- **Anotações**: Cada nota com sua cor específica
- **Progresso**: Estado atual do jogo
- **Preferências**: Idioma, cor favorita, etc.

### **Memória da Sessão**
- **Histórico**: Lista de todas as jogadas (undo/redo)
- **Estado atual**: Números no tabuleiro
- **Seleção**: Qual célula está marcada

---

## 🎯 **Resumo Simples**

### **Para Jogar Normal**
1. Clica numa célula vazia
2. Pressiona número 1-9
3. Número aparece grande na célula

### **Para Fazer Anotações**
1. Pressiona Q (liga modo notas)
2. Clica numa célula vazia  
3. Pressiona números → aparecem pequenos
4. Pressiona Q de novo (desliga modo notas)

### **Para Trocar Cores das Anotações**
1. Pressiona C → muda cor
2. Próximas notas terão nova cor
3. Notas antigas mantêm cor original

### **Se Errar**
1. Ctrl+Z para desfazer
2. Ou clica na célula e apaga (Delete)

---

**💡 Dica**: O jogo é como um caderno inteligente que lembra de tudo que você fez e ajuda você a não se perder!