
import fs from 'fs';
import path from 'path';

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, '');
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            }
        }
    } catch (e) {
        console.error('Failed to load .env', e);
    }
}

loadEnv();

console.log('Checking S3 Environment Variables...');
console.log('R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID ? 'Set' : 'Missing');
console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Missing');
console.log('R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME || 'Default: karwei');
console.log('R2_PUBLIC_URL:', process.env.R2_PUBLIC_URL ? 'Set' : 'Missing');
