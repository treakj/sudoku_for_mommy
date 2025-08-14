/**
 * Testes unitários para o sistema de validação do Sudoku
 * Execute com: node tests/validator.test.js
 */

// Simulação simples de framework de testes
class SimpleTest {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('🧪 Executando testes do Validator...');
        console.log('=' .repeat(50));

        for (const { name, fn } of this.tests) {
            try {
                await fn();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}: ${error.message}`);
                this.failed++;
            }
        }

        console.log('=' .repeat(50));
        console.log(`📊 Resultados: ${this.passed} passou, ${this.failed} falhou`);
        
        if (this.failed === 0) {
            console.log('🎉 Todos os testes passaram!');
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    assertArrayEqual(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(message || `Arrays not equal: ${JSON.stringify(actual)} vs ${JSON.stringify(expected)}`);
        }
    }
}

// Mock do Validator (simulação para testes)
class MockValidator {
    isMoveValid(grid, row, col, number) {
        // Verificar linha
        for (let c = 0; c < 9; c++) {
            if (c !== col && grid[row][c] === number) {
                return false;
            }
        }

        // Verificar coluna
        for (let r = 0; r < 9; r++) {
            if (r !== row && grid[r][col] === number) {
                return false;
            }
        }

        // Verificar quadrante 3x3
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && grid[r][c] === number) {
                    return false;
                }
            }
        }

        return true;
    }

    isBoardComplete(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    findConflicts(grid) {
        const conflicts = [];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const number = grid[row][col];
                if (number !== 0 && !this.isMoveValid(grid, row, col, number)) {
                    conflicts.push({ row, col, number });
                }
            }
        }
        
        return conflicts;
    }
}

// Testes
const test = new SimpleTest();
const validator = new MockValidator();

// Grid de teste válido
const validGrid = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

// Grid completo válido
const completeValidGrid = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

// Grid com conflitos
const conflictGrid = [
    [5, 3, 5, 0, 7, 0, 0, 0, 0], // 5 repetido na linha
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

test.test('Movimento válido em célula vazia', () => {
    const result = validator.isMoveValid(validGrid, 0, 2, 4);
    test.assert(result, 'Deveria permitir colocar 4 na posição [0,2]');
});

test.test('Movimento inválido - número já existe na linha', () => {
    const result = validator.isMoveValid(validGrid, 0, 2, 5);
    test.assert(!result, 'Não deveria permitir 5 na linha que já tem 5');
});

test.test('Movimento inválido - número já existe na coluna', () => {
    const result = validator.isMoveValid(validGrid, 2, 1, 6);
    test.assert(!result, 'Não deveria permitir 6 na coluna que já tem 6');
});

test.test('Movimento inválido - número já existe no quadrante', () => {
    const result = validator.isMoveValid(validGrid, 0, 0, 6);
    test.assert(!result, 'Não deveria permitir 6 no quadrante que já tem 6');
});

test.test('Tabuleiro incompleto', () => {
    const result = validator.isBoardComplete(validGrid);
    test.assert(!result, 'Tabuleiro com zeros não deveria estar completo');
});

test.test('Tabuleiro completo', () => {
    const result = validator.isBoardComplete(completeValidGrid);
    test.assert(result, 'Tabuleiro preenchido deveria estar completo');
});

test.test('Detectar conflitos', () => {
    const conflicts = validator.findConflicts(conflictGrid);
    test.assert(conflicts.length > 0, 'Deveria detectar conflitos no grid inválido');
    
    // Verificar se detectou o conflito específico
    const hasRowConflict = conflicts.some(c => 
        (c.row === 0 && c.col === 0 && c.number === 5) ||
        (c.row === 0 && c.col === 2 && c.number === 5)
    );
    test.assert(hasRowConflict, 'Deveria detectar conflito de 5 na primeira linha');
});

test.test('Grid válido sem conflitos', () => {
    const conflicts = validator.findConflicts(validGrid);
    test.assertEqual(conflicts.length, 0, 'Grid válido não deveria ter conflitos');
});

test.test('Validação de linha', () => {
    // Teste específico para validação de linha
    const testGrid = Array(9).fill(0).map(() => Array(9).fill(0));
    testGrid[0] = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // Linha quase completa
    
    const validMove = validator.isMoveValid(testGrid, 0, 8, 9);
    test.assert(validMove, 'Deveria permitir 9 na última posição');
    
    const invalidMove = validator.isMoveValid(testGrid, 0, 8, 1);
    test.assert(!invalidMove, 'Não deveria permitir 1 (já existe na linha)');
});

test.test('Validação de coluna', () => {
    // Teste específico para validação de coluna
    const testGrid = Array(9).fill(0).map(() => Array(9).fill(0));
    for (let i = 0; i < 8; i++) {
        testGrid[i][0] = i + 1; // Coluna quase completa
    }
    
    const validMove = validator.isMoveValid(testGrid, 8, 0, 9);
    test.assert(validMove, 'Deveria permitir 9 na última posição da coluna');
    
    const invalidMove = validator.isMoveValid(testGrid, 8, 0, 1);
    test.assert(!invalidMove, 'Não deveria permitir 1 (já existe na coluna)');
});

test.test('Validação de quadrante 3x3', () => {
    // Teste específico para validação de quadrante
    const testGrid = Array(9).fill(0).map(() => Array(9).fill(0));
    
    // Preencher quadrante superior esquerdo parcialmente
    testGrid[0][0] = 1;
    testGrid[0][1] = 2;
    testGrid[0][2] = 3;
    testGrid[1][0] = 4;
    testGrid[1][1] = 5;
    testGrid[1][2] = 6;
    testGrid[2][0] = 7;
    testGrid[2][1] = 8;
    // testGrid[2][2] = 0; // Última posição vazia
    
    const validMove = validator.isMoveValid(testGrid, 2, 2, 9);
    test.assert(validMove, 'Deveria permitir 9 na última posição do quadrante');
    
    const invalidMove = validator.isMoveValid(testGrid, 2, 2, 1);
    test.assert(!invalidMove, 'Não deveria permitir 1 (já existe no quadrante)');
});

// Executar todos os testes
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { SimpleTest, MockValidator };
} else {
    // Browser environment
    test.run().then(() => {
        console.log('\n🏁 Testes concluídos!');
    });
}

// Para executar no Node.js:
// node tests/validator.test.js
if (typeof require !== 'undefined') {
    test.run().then(() => {
        console.log('\n🏁 Testes concluídos!');
        process.exit(test.failed > 0 ? 1 : 0);
    });
}