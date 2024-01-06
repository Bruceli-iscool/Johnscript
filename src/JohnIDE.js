#!/usr/bin/env node


const fs = require('fs');
const readline = require('readline');
const { interpret } = require('./johnscript');

function runScript(filePath) {
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    interpret(sourceCode);
}

function runREPL() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'JohnIDE> '
    });

    rl.prompt();

    rl.on('line', (line) => {
        interpret(line.trim());
        rl.prompt();
    }).on('close', () => {
        console.log('Exiting JohnIDE.');
        process.exit(0);
    });
}

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: node johnIDE.js <filename.john>');
    runREPL();
} else {
    const filePath = args[0];
    runScript(filePath);
}