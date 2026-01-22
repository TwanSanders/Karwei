
import { env } from '$env/dynamic/private';

console.log('Checking S3 Environment Variables...');
console.log('R2_ACCOUNT_ID:', env.R2_ACCOUNT_ID ? 'Set' : 'Missing');
console.log('R2_ACCESS_KEY_ID:', env.R2_ACCESS_KEY_ID ? 'Set' : 'Missing');
console.log('R2_SECRET_ACCESS_KEY:', env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
console.log('R2_BUCKET_NAME:', env.R2_BUCKET_NAME || 'Default: karwei');
console.log('R2_PUBLIC_URL:', env.R2_PUBLIC_URL ? 'Set' : 'Missing');
