import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
    const { messages, postContext } = await request.json();

    if (!GEMINI_API_KEY) {
        return json({ error: "API key not configured" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        tools: [{ googleSearch: {} }]
    });

    // Concise system prompt with formatting rules
    const systemPrompt = `You are a Repair Diagnostic Assistant helping a skilled maker fix: **${postContext.title}**

**Description**: ${postContext.description}
**Budget**: ${postContext.targetPrice ? `€${postContext.targetPrice}` : "Not specified"}
${postContext.imageUrl ? "**Image**: Provided (analyze it)" : ""}

**Your Role**:
1. ${postContext.imageUrl ? "Analyze image for damage/clues" : "Work from description"}
2. Search for real repair examples (cite sources!)
3. Suggest causes, tools/parts, safety tips

**CRITICAL - Formatting**:
- Use **markdown**: bold, bullets, line breaks
- Keep SHORT (2-4 sentences per point)
- NO walls of text
- Example:
  
  **Likely Cause**: Blown speaker
  
  **Fix**: Replace driver (~€15). [iFixit guide]
  
  **Tools**: T6 screwdriver

Be concise & practical.`;

    try {
        // Build conversation history
        const history: any[] = [];

        // Add system context with image
        const contextParts: any[] = [{ text: systemPrompt }];
        
        if (postContext.imageUrl) {
            contextParts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: await fetchImageAsBase64(postContext.imageUrl)
                }
            });
        }

        history.push({ role: "user", parts: contextParts });
        history.push({ role: "model", parts: [{ text: "Ready. What do you need help with?" }] });

        // Add all previous messages EXCEPT the last one
        for (let i = 0; i < messages.length - 1; i++) {
            const msg = messages[i];
            history.push({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }]
            });
        }

        // Start chat with full history
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 800,
                temperature: 0.7,
            },
        });

        // Send latest message
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) {
            return json({ error: "No message provided" }, { status: 400 });
        }

        const result = await chat.sendMessage(lastMessage.content);
        const text = result.response.text();

        return json({ reply: text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return json({ error: "Failed to communicate with AI agent." }, { status: 500 });
    }
};

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Failed to fetch image");
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return buffer.toString('base64');
    } catch (error) {
        console.error("Image fetch error:", error);
        throw new Error("Could not load image for analysis");
    }
}
