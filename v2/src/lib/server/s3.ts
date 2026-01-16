import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler"; 
import { Agent } from "https";
import { env } from "$env/dynamic/private";

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = env.R2_BUCKET_NAME || "karwei";
const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

// DEBUG: Check alles!
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("❌ CRITICAL ERROR: Een van de R2 variables ontbreekt!");
    console.error(`ID: ${R2_ACCOUNT_ID ? 'OK' : 'MISSING'}, Access: ${R2_ACCESS_KEY_ID ? 'OK' : 'MISSING'}, Secret: ${R2_SECRET_ACCESS_KEY ? 'OK' : 'MISSING'}`);
    throw new Error("R2 Configuration missing");
}

const requestHandler = new NodeHttpHandler({
    httpsAgent: new Agent({
        minVersion: "TLSv1.2", // Veiliger dan secureProtocol
        keepAlive: true
    })
});

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
    requestHandler: requestHandler,
});

export async function uploadToR2(file: File): Promise<string> {
    console.log(`🚀 Start upload naar bucket: ${R2_BUCKET_NAME}`);
    
    // Check de file
    if (!file || file.size === 0) {
        throw new Error("File is leeg");
    }

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
        
        // Fallback als PUBLIC_URL mist (handig voor debug)
        if (!R2_PUBLIC_URL) {
            console.warn("⚠️ R2_PUBLIC_URL mist, kan geen geldige link teruggeven.");
            return filename;
        }
        return `${R2_PUBLIC_URL}/${filename}`;
    } catch (error) {
        console.error("🔥 Fout tijdens uploaden naar R2:", error);
        // Print de endpoint die hij probeerde te bereiken (voor debug)
        console.error("Geprobeerde endpoint:", `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
        throw error;
    }
}