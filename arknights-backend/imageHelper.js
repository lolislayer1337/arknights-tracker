// imageHelper.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function checkNsfw(base64Image, filename = '') {
    const nsfwUrl = process.env.NSFW_API_URL;
    
    if (nsfwUrl) {
        try {
            const res = await axios.post(nsfwUrl, {
                image: base64Image,
                filename: filename
            }, { timeout: 5000 });
            return res.data && res.data.nsfw === true;
        } catch (e) {
            console.warn("[NSFW] API check failed, falling back to mock approval:", e.message);
        }
    }
    
    // Mock NSFW check: if filename or base64Image metadata contains 'nsfw', flag it!
    const cleanFilename = String(filename).toLowerCase();
    const cleanBase64 = String(base64Image).toLowerCase();
    return cleanFilename.includes('nsfw') || cleanBase64.includes('nsfw');
}

async function saveWebpImage(base64Data) {
    // Expecting "data:image/webp;base64,..."
    const match = base64Data.match(/^data:image\/webp;base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid image format. Only WebP is allowed.");
    }
    
    const base64Str = match[1];
    const buffer = Buffer.from(base64Str, 'base64');
    
    // Limit check: 1MB = 1,048,576 bytes
    if (buffer.length > 1024 * 1024) {
        throw new Error("Image exceeds the 1MB limit.");
    }
    
    const fileId = crypto.randomUUID();
    const filename = `${fileId}.webp`;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    await fs.promises.writeFile(filePath, buffer);
    return fileId; // The unique ID of the image
}

module.exports = {
    checkNsfw,
    saveWebpImage,
    UPLOADS_DIR
};
