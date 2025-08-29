# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern Sudoku game built with vanilla JavaScript ES6 modules, HTML5 Canvas, and Tailwind CSS. Features multilingual support (Portuguese, English, Japanese), multiple difficulty levels, sophisticated puzzle generation with uniqueness verification, and comprehensive game systems including notes, hints, color coding, and undo/redo.

## Key Commands

### Development & Testing
- **Run validator tests**: `node tests/validator.test.js`
- **Test generator performance**: Open `test-generator.html` in browser for detailed generation logs
- **Test color system**: Open `test-colors.html` in browser

### Deployment (Firebase Hosting)
- **Windows**: `deploy.bat` (automated script with checks)
- **PowerShell**: `deploy.ps1` 
- **Manual**: `firebase deploy`
- **Login**: `firebase login` (if needed)
- **Live URL**: https://sudoku-for-mom.web.app

## Architecture

### Module System (ES6)
The codebase uses a modular architecture with clear separation of concerns:

```
public/js/
├── main.js                    # App initialization, event binding
├── modules/                   # Core game systems
│   ├── game-enhanced.js      # Main game engine with canvas rendering
│   ├── sudoku-generator.js   # Puzzle generator with uniqueness verification
│   ├── validator.js          # Game rules validation
│   ├── notes-system.js       # Note-taking in pencil mode
│   ├── color-system.js       # Cell color coding system
│   ├── hints-system.js       # Smart hint system
│   ├── history-system.js     # Undo/redo functionality
│   └── translations.js       # Multi-language support
└── utils/
    └── dom-helpers.js        # DOM utilities and mobile detection
```

### Core Classes
- **SudokuGame**: Main game engine managing canvas, state, and all subsystems
- **SudokuGenerator**: Advanced puzzle generation with backtracking + uniqueness verification
- **Validator**: Rule validation and conflict detection
- **NotesSystem**: 3x3 grid note-taking within cells
- **ColorSystem**: 6-color cell marking system
- **HistorySystem**: Move tracking for undo/redo

### Rendering Pipeline
Canvas-based rendering with layered approach:
1. Grid drawing (9x9 with thick borders for 3x3 regions)  
2. Numbers with color coding (black=original, blue=player, orange=notes, red=conflicts)
3. Notes as 3x3 mini-grids within cells
4. Selection highlighting and related number highlighting
5. Color overlays for marked cells

## Game Systems Integration

### Puzzle Generation Algorithm
The generator uses a sophisticated two-phase approach:
1. **Complete Solution**: Backtracking to fill valid 9x9 grid
2. **Intelligent Removal**: Test each removal to ensure exactly one solution remains

Difficulty levels determined by number removal attempts (not guaranteed removals):
- Easy: ~40 removals (41 filled cells)
- Medium: ~50 removals (31 filled cells) 
- Hard: ~56 removals (25 filled cells)
- Expert: ~61 removals (20 filled cells)
- Insane: ~64 removals (17 filled cells)

### Multi-Language System
Dynamic UI translation using data attributes:
```html
<button data-translate="newGame">Novo Jogo</button>
```
Language toggle cycles PT → EN → JA with font family switching for Japanese.

### Mobile Optimization
- Touch event handling with passive listeners
- Responsive canvas resizing with debounce
- Mobile device detection for UI adaptations
- Viewport optimization to prevent zoom

## Development Guidelines

### Code Organization
- Each system is a separate ES6 module with clear dependencies
- Game state managed centrally in SudokuGame class
- Canvas rendering optimized with requestAnimationFrame when needed
- Local storage integration for persistence (colors, notes, settings)

### Testing Approach
- Custom lightweight test framework in `tests/validator.test.js`
- Browser-based testing for generator performance and UI systems
- Console logging for debugging generation algorithms and game state

### Performance Considerations
- Generator can take 200ms-2s depending on difficulty
- Canvas redraws optimized to avoid unnecessary operations  
- Mobile touch events use passive listeners where possible
- Debounced resize handling

### Debugging Tools
- Detailed console logging for puzzle generation process
- Test pages for isolated system testing
- Performance timing for generation algorithms
- Visual feedback for all user interactions

## File Structure Notes
- `public/` contains all client-side code (no build process needed)
- Multiple documentation files exist (README.md has comprehensive details)
- Version controlled in `VERSION` file (currently 0.9.4)
- Firebase configuration in `firebase.json` with optimized caching headers