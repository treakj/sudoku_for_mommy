# 🎮 Sudoku for Mommy

Um jogo de Sudoku moderno e responsivo com suporte a múltiplos idiomas (Português, Inglês e Japonês).

## 🌟 Características

- **Múltiplos Níveis de Dificuldade**: Fácil, Médio, Difícil, Expert e Insano
- **Suporte Multilíngue**: Português, Inglês e Japonês
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Sistema de Dicas**: 3 dicas por jogo
- **Validação em Tempo Real**: Destaque de conflitos
- **Navegação por Teclado**: Suporte completo para teclado
- **Design Moderno**: Interface limpa usando Tailwind CSS

## 🚀 Como Usar

### Controles de Teclado
- **Setas**: Navegar pelo tabuleiro
- **1-9**: Inserir números
- **Backspace/Delete/0**: Apagar números
- **H**: Usar dica
- **L**: Alternar idioma
- **Ctrl+N**: Novo jogo
- **Ctrl+R**: Reset do tabuleiro

### Controles Touch/Mouse
- **Click/Tap**: Selecionar célula
- **Painel de Números**: Para dispositivos móveis

## 🛠️ Estrutura do Projeto

```
public/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos customizados
├── js/
│   ├── main.js            # Arquivo principal da aplicação
│   ├── modules/
│   │   ├── game.js        # Lógica principal do jogo
│   │   ├── sudoku-generator.js  # Gerador de puzzles
│   │   ├── validator.js   # Validação de movimentos
│   │   └── translations.js # Sistema de traduções
│   └── utils/
│       └── dom-helpers.js # Utilitários para DOM
└── assets/
    └── favicon.ico        # Favicon do site
```

## 🔥 Deploy no Firebase

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

## 🎯 Funcionalidades Técnicas

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
