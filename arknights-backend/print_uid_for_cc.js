const fs = require('fs');
const logPath = 'C:/Users/makiv/.gemini/antigravity-ide/brain/bce91aa1-e494-4c52-b2bb-702be48d72c6/.system_generated/tasks/task-1821.log';

try {
    const content = fs.readFileSync(logPath, 'utf8');
    const startIdx = content.indexOf('[Sync API Crisis Contract Record Detail Response]:');
    if (startIdx !== -1) {
        const jsonStart = content.indexOf('{', startIdx);
        // Find the matching closing bracket or parse the first lines of JSON
        let braces = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < content.length; i++) {
            if (content[i] === '{') braces++;
            else if (content[i] === '}') {
                braces--;
                if (braces === 0) {
                    jsonEnd = i + 1;
                    break;
                }
            }
        }
        if (jsonEnd !== -1) {
            const rawJson = content.substring(jsonStart, jsonEnd);
            const parsed = JSON.parse(rawJson);
            console.log("Keys in recordDetail's data:", Object.keys(parsed.data));
            if (parsed.data.recordDetail) {
                console.log("Keys in recordDetail:", Object.keys(parsed.data.recordDetail));
            }
        } else {
            console.log("Matching closing brace not found");
        }
    } else {
        console.log("Response log prefix not found");
    }
} catch (err) {
    console.error("Error:", err.message);
}
