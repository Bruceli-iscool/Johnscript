const fs = require('fs');
const path = require('path');
const readline = require('readline');

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

function lexer(sourceCode) {
    const tokens = [];
    let position = 0;

    const tokenSyntax = [
        { type: 'KEYWORD', pattern: /\b(if|else|while)\b/ },
        { type: 'IDENTIFIER', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
        { type: 'LITERAL', pattern: /\b\d+\b/ },
        { type: 'OPERATOR', pattern: /\b(\+|\-|\*|\/)\b/ },
        { type: 'PUNCTUATION', pattern: /\b(\(|\)|\{|\}|\;)\b/ },
        { type: 'COMMENT', pattern: /(?:\/\/|#).*$/ },
        { type: 'FUNCTION', pattern: /\b(write|ask)\b/ },
        { type: 'STRING', pattern: /\".*?\"/ },
        { type: 'FUNCTION_DEF', pattern: /\bdefine\b/ }
    ];

    while (position < sourceCode.length) {
        let match = null;

        for (const { type, pattern } of tokenSyntax) {
            match = sourceCode.substr(position).match(pattern);

            if (match) {
                const value = match[0];
                position += match.index + match[0].length;

                if (type !== 'COMMENT') {
                    tokens.push(new Token(type, value));
                }

                break;
            }
        }

        if (!match) {
            position++;
        }
    }

    console.log('Tokens:', tokens); // Add this line to log the tokens

    return tokens;
}

class Interpreter {
    constructor() {
        this.variables = {};
    }

    FunctionCall(node) {
        const functionName = node.name;
        const parameters = node.parameters.map(param => this.visit(param));

        switch (functionName) {
            case 'write':
                console.log(parameters[0]);
                break;

            case 'ask':
                const userInput = prompt(parameters[0]);
                return userInput;

            default:
                throw new Error(`Undefined function: ${functionName}`);
        }
    }

    visitLit(node) {
        return parseInt(node.value);
    }

    visit(node) {
        if (node.type === 'Program') {
            for (const statement of node.body) {
                this.visit(statement);
            }
        } else if (node.type === 'PrintStatement') {
            this.visit(node.expression);
        } else if (node.type === 'FunctionCall') {
            this.FunctionCall(node);  // Fix: Removed semicolon
        } else if (node.type === 'Literal') {
            return this.visitLit(node);
        } else {
            throw new Error(`Unsupported node type: ${node.type}`);
        }
    }

    interpret(ast) {
        console.log('Visiting AST:', ast);
        return this.visit(ast);
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.currentTokenIndex = 0;
    }

    parseProgram() {
        const statements = [];

        while (this.currentTokenIndex < this.tokens.length) {
            const statement = this.parseStatement();
            if (statement) {
                statements.push(statement);
            } else {
                console.log('Skipped null statement.');
            }
        }

        console.log('Parsed statements:', statements);

        return { type: 'Program', body: statements };
    }

    parseStatement() {
        const token = this.tokens[this.currentTokenIndex];
    
        if (token.type === 'KEYWORD' && token.value === 'print') {
            return this.parsePrintStatement();
        } else if (token.type === 'IDENTIFIER') {
            const nextToken = this.tokens[this.currentTokenIndex + 1];
    
            if (nextToken && nextToken.type === 'PUNCTUATION' && nextToken.value === '(') {
                return this.parseFunctionCall();
            } else {
                return this.parseVariableDeclaration();
            }
        }
    
        this.consumeToken();
        return null;
    }
    
    parseVariableDeclaration() {
        const identifierToken = this.consumeToken();
    
        if (this.checkToken('OPERATOR', '=')) {
            this.consumeToken();
            const expression = this.parseExpression();
            if (this.checkToken('PUNCTUATION', ';')) {
                this.consumeToken(); 
                return {
                    type: 'VariableDeclaration',
                    identifier: identifierToken.value,
                    expression,
                };
            } else {
                throw new Error('Expected ";" after variable declaration.');
            }
        } else {
            throw new Error('Expected "=" in variable declaration.');
        }
    }
    
    
    parsePrintStatement() {
        this.consumeToken();
        const expression = this.parseExpression();
        this.consumePunctuation(';');
        return { type: 'PrintStatement', expression };
    }

    parseFunctionCall() {
        const functionName = this.consumeIdentifier();
        this.consumePunctuation('(');
        const arg = this.parseArgumentList();
        this.consumePunctuation(')');
        this.consumePunctuation(';');
        return { type: 'FunctionCall', name: functionName, parameters: arg };
    }

    parseArgumentList() {
        const arg = [];

        while (this.tokens[this.currentTokenIndex]?.type !== 'PUNCTUATION' || this.tokens[this.currentTokenIndex]?.value !== ')') {
            arg.push(this.parseExpression());

            if (this.tokens[this.currentTokenIndex]?.type === 'PUNCTUATION' && this.tokens[this.currentTokenIndex]?.value === ',') {
                this.consumePunctuation(',');
            }
        }

        return arg;
    }

    parseExpression() {
        return { type: 'Literal', value: '123' };
    }

    consumeToken() {
        this.currentTokenIndex++;
    }

    consumePunctuation(expectedPunctuation) {
        const token = this.tokens[this.currentTokenIndex];

        if (token.type === 'PUNCTUATION' && token.value === expectedPunctuation) {
            this.consumeToken();
        } else {
            throw new Error(`Expected '${expectedPunctuation}' but found '${token.value}'`);
        }
    }

    consumeIdentifier() {
        const token = this.tokens[this.currentTokenIndex];

        if (token.type === 'IDENTIFIER') {
            this.consumeToken();
            return token.value;
        } else {
            throw new Error(`Expected an identifier but found '${token.value}'`);
        }
    }
}

function interpretFile(filePath) {
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    interpret(sourceCode);
}

function interpret(sourceCode) {
    const tokens = lexer(sourceCode);
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();

    const interpreter = new Interpreter();
    const result = interpreter.interpret(ast);
    console.log('Result:', result);
}

const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Usage: node johnscript.js <filename.john>');
} else {
    const filePath = path.resolve(args[0]);
    interpretFile(filePath);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter the filename to run: ', (filename) => {
    rl.close();

    try {
        const sourceCode = fs.readFileSync(filename, 'utf-8');
        const tokens = lexer(sourceCode);
        const parser = new Parser(tokens);
        const ast = parser.parseProgram();
        const interpreter = new Interpreter();
        const result = interpreter.interpret(ast);
        console.log('Result:', result);
    } catch (error) {
        console.error('Error:', error.message);
    }
});
