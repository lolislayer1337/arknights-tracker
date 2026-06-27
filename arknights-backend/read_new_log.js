const fs = require('fs');
const logPath = 'C:/Users/makiv/.gemini/antigravity-ide/brain/bce91aa1-e494-4c52-b2bb-702be48d72c6/.system_generated/tasks/task-1821.log';

try {
    if (!fs.existsSync(logPath)) {
        console.log("Log file task-1821.log does not exist yet.");
        return;
    }
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    console.log("Total log lines in task-1821:", lines.length);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Record Detail Response') || line.includes('Record Detail Loaded') || line.includes('Fetch Error')) {
            console.log(`Line ${i}: ${line.substring(0, 500)}`);
            // print some lines after
            for (let j = i + 1; j < Math.min(lines.length, i + 50); j++) {
                console.log(`${j}: ${lines[j].substring(0, 500)}`);
            }
        }
    }
} catch (err) {
    console.error("Error reading log:", err.message);
}
