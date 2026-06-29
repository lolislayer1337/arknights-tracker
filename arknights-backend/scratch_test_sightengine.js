require('dotenv').config();
const axios = require('axios');

async function testUrl() {
    const apiUser = process.env.SIGHTENGINE_USER;
    const apiSecret = process.env.SIGHTENGINE_SECRET;
    
    try {
        const res = await axios.get('https://api.sightengine.com/1.0/check.json', {
            params: {
                url: 'https://sightengine.com/assets/img/examples/example7.jpg',
                models: 'nudity-2.0',
                api_user: apiUser,
                api_secret: apiSecret
            }
        });
        console.log("Sightengine API response:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        if (e.response) {
            console.error("API error response:", e.response.data);
        } else {
            console.error("Error:", e.message);
        }
    }
}

testUrl();
