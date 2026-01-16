import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Agent } from "https";
import { env } from "$env/dynamic/private";

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = env.R2_BUCKET_NAME || "karwei";
const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

console.log("🟢 Node Version:", process.version);

// Check credentials
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 Credentials missing via .env");
}

// "Nucleaire Optie": Forceer simpele instellingen
const requestHandler = new NodeHttpHandler({
    httpsAgent: new Agent({
        // Zet KeepAlive UIT om hangende connecties te voorkomen
        keepAlive: false,
        // Forceer een specifieke TLS versie (soms helpt dit tegen scanners)
        minVersion: "TLSv1.2",
        maxVersion: "TLSv1.3",
    }),
    // Forceer HTTP 1.1 (schakel HTTP/2 uit, want dat botst vaak met proxies)
    socketAcquisitionWarningTimeout: 2000,
});

const s3Client = new S3Client({
    // Gebruik us-east-1 voor maximale compatibiliteit (werkt ook voor R2)
    region: "us-east-1",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
    // Belangrijk: Forceer path style (werkt vaak beter door firewalls heen)
    forcePathStyle: true,
    requestHandler: requestHandler,
});

export async function uploadToR2(file: File): Promise<string> {
    console.log(`🚀 Start upload naar bucket: ${R2_BUCKET_NAME} (Nucleaire Mode)`);
    
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