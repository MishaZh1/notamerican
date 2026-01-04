const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
console.log('Path:', envPath);
try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('--- Content Start ---');
    console.log(content);
    console.log('--- Content End ---');
} catch (e) {
    console.error('Error reading file:', e.message);
}
