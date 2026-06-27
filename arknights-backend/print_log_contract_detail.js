const fs = require('fs');
const logPath = 'C:/Users/makiv/.gemini/antigravity-ide/brain/bce91aa1-e494-4c52-b2bb-702be48d72c6/.system_generated/tasks/task-1750.log';

try {
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    console.log("Printing log lines starting from 13:");
    for (let i = 13; i < 70; i++) {
        console.log(`${i}: ${lines[i]}`);
    }
} catch (err) {
    console.error("Error reading log:", err.message);
}
