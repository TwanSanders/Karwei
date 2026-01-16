import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "$env/dynamic/private";

// Haal variabelen op
const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = env.R2_BUCKET_NAME || "karwei";
const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

// Debug log voor versie en config
console.log("🟢 Node Version:", process.version);
console.log("🔧 R2 Config:", {
    accountId: R2_ACCOUNT_ID ? "Present" : "MISSING",
    bucket: R2_BUCKET_NAME
});

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 Credentials missing via $env/dynamic/private");
}

// "Clean Slate" Client: Geen custom requestHandlers meer.
// We vertrouwen erop dat Node v20+ dit zelf kan.
const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    }
});

export async function uploadToR2(file: File): Promise<string> {
    console.log(`🚀 Start upload naar bucket: ${R2_BUCKET_NAME}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uniqueId = crypto.randomUUID();
    const extension = file.name.split(".").pop(); 
    const filename = `${uniqueId}.${extension}`;

    try {
        await s3Client.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: filename,
                Body: buffer,
                ContentType: file.type,
            })
        );
        console.log("✅ Upload geslaagd!");
        return `${R2_PUBLIC_URL}/${filename}`;
    } catch (error) {
        console.error("🔥 Fout tijdens uploaden:", error);
        throw error;
    }
}