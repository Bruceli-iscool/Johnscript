#!/usr/bin/env node


const fs = require('fs');
const prompt = require('prompt-sync')();
const { interpret } = require('./johnscript');

function runScript(filePath) {
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    interpret(sourceCode);
}

runREPL();

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: node johnIDE.js <filename.john>');
    runREPL();
} else {
    const filePath = args[0];
    runScript(filePath);
}
