require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log('MISSING KEY');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        // We can't easily list models with the web SDK and a simple key in some versions
        // but let's try a different model: 'gemini-1.5-pro'
        const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

        for (const name of modelNames) {
            console.log(`Testing ${name}...`);
            try {
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent('Hi');
                console.log(`✅ ${name} WORKS!`);
                process.exit(0);
            } catch (e) {
                console.log(`❌ ${name} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error('General Error:', error.message);
    }
}

test();
