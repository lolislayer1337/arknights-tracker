const fs = require('fs');
const logPath = 'C:/Users/makiv/.gemini/antigravity-ide/brain/bce91aa1-e494-4c52-b2bb-702be48d72c6/.system_generated/tasks/task-1750.log';

try {
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('[Sync API Crisis Contract Record Detail Response]')) {
            console.log(`Line ${i}:`);
            console.log(line.substring(0, 2000));
            // print subsequent lines
            for (let j = i + 1; j < Math.min(lines.length, i + 100); j++) {
                console.log(`${j}: ${lines[j]}`);
            }
        }
    }
} catch (err) {
    console.error("Error reading log:", err.message);
}
