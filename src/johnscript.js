class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value
    }
}

function lexer(sourceCode) {
    const tokens = [];
    let position = 0;

    const tokenSyntax = [
        { type: 'KEYWORD', pattern: /\b(if|else|while)\b/},
        { type: 'IDENTIFIER', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
        { type: 'LITERAL', pattern: /\b\d+\b/ },
        { type: 'OPERATOR', pattern: /\b(\+|\-|\*|\/)\b/ },
        { type: 'PUNCTUATION', pattern: /\b(\(|\)|\{|\}|\;)\b/ },
        { type: 'COMMENT', pattern: /\/\/.*$/ },
        { type: 'FUNCTION', pattern: /\b(write)(ask)\b/ },
        { type: 'STRING', pattern: /\".*?\"/ },
        { type: 'FUNCTION_DEF', pattern: /\bdefine\b/ }

    ];
    while (position < sourceCode.length) {
        let match = null;

        for (const { type, pattern } of tokenPatterns) {
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

    return tokens;
}

class Interpreter {
    constructor() {
        this.variables = {};
    }

    FunctionCall(node) {
        const nameFunction = node.name;
        const parameters = node.parameters.map(param => this.visit(param))
    
    switch (functionName){
        case 'write':
            console.log(parameters[0])
            break;

        case 'ask':
            const userInput = prompt(parameters[0])
            return userInput;

        default:
            throw new Error(`Undefined fucntion: ${functionName}`);

        }
    }

    visitLit(node) {
        return parseInt(node.value);

    }

    interpret(ast) {
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
            statements.push(this.parseStatement());
        }

        return { type: 'Program', body: statements };
    }

    parseStatement() {
        const token = this.tokens[this.currentTokenIndex];

        if (token.type === 'KEYWORD' && token.value === 'print') {
            return this.parsePrintStatement();
        } else if (token.type === 'IDENTIFIER' && this.tokens[this.currentTokenIndex + 1]?.type === 'PUNCTUATION' && this.tokens[this.currentTokenIndex + 1]?.value === '(') {
            return this.parseFunctionCall();
        } else {
            this.consumeToken();
            return null;
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
        return { type: 'FunctionCall', name: functionName, arguments };
    }

    parseArgumentList() {
        const arg = [];

        while (this.tokens[this.currentTokenIndex]?.type !== 'PUNCTUATION' || this.tokens[this.currentTokenIndex]?.value !== ')') {
            arguments.push(this.parseExpression());

            if (this.tokens[this.currentTokenIndex]?.type === 'PUNCTUATION' && this.tokens[this.currentTokenIndex]?.value === ',') {
                this.consumePunctuation(',');
            }
        }

        return arguments;
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

const fs = require('fs');
const path = require('path');

function interpretFile(filePath) {
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    interpret(sourceCode);
}

function interpret(sourceCode) {
    const tokens = tokenize(sourceCode);
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();

    const interpreter = new Interpreter();
    interpreter.interpret(ast);
}


const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Usage: node johnscript.js <filename.john>');
} else {
    const filePath = path.resolve(args[0]);
    interpretFile(filePath);
}