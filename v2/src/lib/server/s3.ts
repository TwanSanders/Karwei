import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler"; 
import { Agent } from "https";
import { env } from "$env/dynamic/private";

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = env.R2_BUCKET_NAME || "karwei";
const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

// Debugging: Laat zien wat we hebben (veilig)
console.log("🔧 R2 Config Check:", {
    accountIdPresent: !!R2_ACCOUNT_ID,
    accessKeyPresent: !!R2_ACCESS_KEY_ID,
    secretKeyPresent: !!R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET_NAME
});

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("❌ CRITICAL: R2 Keys ontbreken in .env bestand!");
}

// DE OPLOSSING VOOR DE NIEUWE NODE VERSIE
// We gebruiken minVersion in plaats van secureProtocol.
// Dit laat Node.js en Cloudflare zelf de beste beveiliging kiezen (TLS 1.2 of 1.3).
const requestHandler = new NodeHttpHandler({
    httpsAgent: new Agent({
        minVersion: "TLSv1.2", // <--- DIT IS DE BELANGRIJKE WIJZIGING
        keepAlive: true
    })
});

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
    requestHandler: requestHandler,
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
        console.error("🔥 Fout tijdens uploaden naar R2:", error);
        // Gooi de fout opnieuw op zodat de frontend weet dat het mislukt is
        throw error;
    }
}