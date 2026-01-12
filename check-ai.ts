import * as dotenv from 'dotenv';
dotenv.config();

// Native fetch is available in Node 18+
async function checkModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('No API Key found.');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log(`Querying: https://generativelanguage.googleapis.com/v1beta/models...`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('API Error:', JSON.stringify(data, null, 2));
            return;
        }

        if (!data.models) {
            console.log('No models returned. This implies the API is enabled but no models are visible to this key??');
            console.log('Full Response:', data);
            return;
        }

        console.log('\n--- Available Models ---');
        // @ts-ignore
        const names = data.models.map(m => m.name);
        console.log(names.join('\n'));

    } catch (error: any) {
        console.error('Network Request Failed:', error.message);
    }
}

checkModels();
