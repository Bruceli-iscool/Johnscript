const fs = require('fs');
const johnscript = require('./johnscript');

function evaluateJohnscriptFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const variables = {};
  try {
    const result = johnscript.evaluateJohnscript(code, variables);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length !== 2 || args[0] !== 'run') {
    console.error('Usage: node johnscript_interpreter.js run <file.john>');
    process.exit(1);
  }

  const filePath = args[1];
  evaluateJohnscriptFile(filePath);
}
