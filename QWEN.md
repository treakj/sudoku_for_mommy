# Sudoku for Mom - Project Context

## Project Overview

This is a modern, responsive Sudoku game built with HTML5 Canvas and vanilla JavaScript. The project was created as a special gift for the developer's mother, with features designed to make the Sudoku experience enjoyable and accessible.

### Key Features
- **Multi-language Support**: Portuguese (default), English, and Japanese
- **Multiple Difficulty Levels**: Easy, Medium, Hard, Expert, Insane
- **Advanced Puzzle Generation**: Algorithm ensures each puzzle has exactly one unique solution
- **Pencil Notes System**: Allows players to make annotations in empty cells
- **Hint System**: 3 hints per game
- **Real-time Validation**: Highlights conflicts immediately
- **Keyboard Navigation**: Full keyboard support for gameplay
- **Responsive Design**: Works on both desktop and mobile devices
- **Modern UI**: Clean interface using Tailwind CSS

## Project Structure

```
sudoku_for_mom/
├── .firebase/                 # Firebase deployment cache
├── .git/                      # Git repository
├── public/                    # Deployed website files
│   ├── assets/                # Static assets (favicon)
│   ├── css/
│   │   └── styles.css         # Custom CSS styles
│   ├── js/
│   │   ├── main.js            # Main application entry point
│   │   ├── modules/           # Game modules (generator, validator, etc.)
│   │   └── utils/             # Utility functions
│   └── index.html             # Main HTML file
├── .gitignore
├── deploy.bat                 # Windows deployment script
├── deploy.ps1                 # PowerShell deployment script
├── firebase.json              # Firebase hosting configuration
├── index.html                 # Development version with all code in one file
├── README.md                  # Project documentation
├── TECHNICAL.md               # Technical documentation
└── test-generator.html        # Puzzle generator testing tool
```

## Core Technologies

- **HTML5 Canvas**: For rendering the Sudoku board
- **Vanilla JavaScript (ES6+)**: Modular architecture with ES6 modules
- **Tailwind CSS**: Utility-first CSS framework
- **Google Fonts**: Inter and Noto Sans JP for typography
- **Firebase Hosting**: Deployment platform

## Game Architecture

### Main Components

1. **SudokuGame (game-enhanced.js)**: Main game controller managing state, rendering, and user interactions
2. **SudokuGenerator (sudoku-generator.js)**: Advanced puzzle generator with uniqueness verification
3. **Validator (validator.js)**: Move validation logic
4. **NotesSystem (notes-system.js)**: Pencil notes functionality
5. **HighlightSystem (highlight-system.js)**: Visual highlighting of related cells
6. **HistorySystem (history-system.js)**: Undo/redo functionality
7. **HintsSystem (hints-system.js)**: Intelligent hint system
8. **NumberCounter (number-counter.js)**: Tracks number usage
9. **Translations (translations.js)**: Multi-language support

### Puzzle Generation

The generator uses a sophisticated algorithm that:
1. Creates a fully filled valid Sudoku grid using backtracking
2. Removes numbers strategically while verifying the puzzle maintains a unique solution
3. Validates each removal to ensure the puzzle remains solvable with exactly one solution
4. Includes a fallback system with pre-tested puzzles for error recovery

### Advanced Features

- **Pencil Notes**: Players can add annotations in empty cells using Shift+Number or the Notes mode
- **Visual Highlighting**: Automatically highlights related numbers, rows, columns, and 3x3 boxes
- **History System**: Full undo/redo functionality with visual timeline
- **Intelligent Hints**: Provides strategic hints rather than just filling random cells
- **Number Counter**: Shows how many of each number have been placed

## Development Workflow

### Prerequisites
- Modern web browser for development/testing
- Firebase CLI for deployment (`npm install -g firebase-tools`)

### Running Locally
1. Open `index.html` directly in a browser for development
2. Or serve files through a local web server to avoid CORS issues

### Building and Deployment
1. All source files are in the `public/` directory
2. Deployment is handled by Firebase Hosting
3. Run `deploy.bat` (Windows) or `deploy.ps1` (PowerShell) to deploy
4. Alternatively, use `firebase deploy` after `firebase login`

### Firebase Configuration
- Public directory: `public`
- Hosting configuration in `firebase.json` includes cache headers and SPA routing

## Code Organization

### JavaScript Modules
- **Modular Architecture**: Each feature is separated into its own module
- **ES6 Imports**: Clean dependency management
- **Class-based Design**: Object-oriented approach for maintainability

### CSS Styling
- **Tailwind CSS**: Utility classes for rapid UI development
- **Custom Styles**: `styles.css` contains component-specific styling
- **Responsive Design**: Mobile-first approach with media queries

### Internationalization
- **Language System**: Support for Portuguese, English, and Japanese
- **Dynamic Text Updates**: All UI text updates when language changes
- **Font Support**: Appropriate fonts for each language (Inter for PT/EN, Noto Sans JP for Japanese)

## Testing and Debugging

### Test Generator
- `test-generator.html` provides detailed logs of puzzle generation
- Shows step-by-step process of puzzle creation
- Displays statistics and validation results

### Browser Console
- Extensive logging throughout the application
- Structured logs with emojis for easy identification
- Performance timing measurements

## Key Files for Development

- `public/js/main.js`: Application entry point
- `public/js/modules/game-enhanced.js`: Main game logic
- `public/js/modules/sudoku-generator.js`: Puzzle generation algorithm
- `public/css/styles.css`: All custom styling
- `public/index.html`: Deployed HTML file (no script tags)
- `index.html`: Development HTML file with embedded scripts

## Deployment Process

1. Firebase CLI must be installed
2. Run login command: `firebase login`
3. Deploy with: `firebase deploy` or use the provided scripts
4. The public directory (`public/`) is deployed as-is
5. Cache headers are configured for optimal performance

## Special Considerations

- **Mobile Optimization**: Touch events, responsive layout, and mobile controls
- **Accessibility**: Keyboard navigation, ARIA labels, and focus management
- **Performance**: Asynchronous puzzle generation, debounce for resize events
- **Error Handling**: Fallback puzzle generation and validation recovery
- **User Experience**: Loading states, animations, and visual feedback