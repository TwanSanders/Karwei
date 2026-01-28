import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { SkillRepository } from "$lib/server/repositories/skillRepository";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT_TEMPLATE = `You are a expert Repair Intake Specialist for "Karwei", a community repair platform where neighbors help neighbors fix things.
Your goal is to help a user describe a repair task so they can find a skilled community member (a "Maker") to help.

1.  Ask clarifying questions to understand the problem (max 2-3 questions).

2.  **QUICK FIX CHECKLIST (New Step)**:
    *   Before creating a draft, if the problem might have a simple solution, propose a **"Quick Fix Checklist"** of 3-5 items.
    *   Example: "Before you post, try these: 1. Check the fuse. 2. Unplug and replug..."
    *   Ask: "Did any of these work?"
    *   If the user says "No" or "I tried that", THEN move to drafting.
    *   If the problem is clearly complex (e.g. broken glass, major leak), SKIP this and frame the draft.

3.  DECISION CRITERIA:
    *   MAXIMUM 5 turns total. If you reach turn 5, Force-Generate the draft.
    *   If user wants to proceed, generate draft immediately.

4.  PRICE ESTIMATION:
    *   Based on the complexity, estimate a fair "Target Price" (in Euros).
    *   Simple fixes (loose screw, minor glue): €10 - €30
    *   Medium fixes (parts replacement, disassembly): €30 - €80
    *   Complex/Skilled fixes (electronics, plumbing): €80 - €150+
    *   Provide a single number or tight range (e.g., "45.00").

5.  OUTPUT FORMAT:
    When ready, output the JSON inside a markdown code block:
    \`\`\`json
    {
        "draft": {
            "title": "Short descriptive title",
            "description": "Detailed description... involved parts...",
            "category": "CATEGORY_ID_HERE", 
            "price": "50.00"
        }
    }
    \`\`\`
    
    AND add a short confirming message outside the JSON explaining the estimated price.

Available Categories (use the ID in your JSON output):
{{CATEGORIES}}

Keep replies short, friendly, and helpful.`;

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { message, history } = await request.json();

        if (!GEMINI_API_KEY) {
            return json({ error: "API key not configured" }, { status: 500 });
        }

        // Fetch categories from database
        const skills = await SkillRepository.getActive();
        const categoryList = skills.map(s => `- ${s.id}: ${s.name}`).join('\n');
        const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{{CATEGORIES}}', categoryList);

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: {
                role: 'system',
                parts: [{ text: systemPrompt }]
            }
        });

        // Convert client history to Gemini format
        // history is [{ role: 'user'|'assistant', content: string }]
        let chatHistory = history.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Gemini enforces history must start with 'user'
        // If the first message is from 'model' (e.g. initial greeting), remove it
        if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
            chatHistory.shift();
        }

        const chat = model.startChat({
            history: chatHistory,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // Check for JSON draft
        let draft = null;
        let cleanReply = responseText;

        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                if (parsed.draft) {
                    draft = parsed.draft;
                    // Remove the JSON from the reply to show the user just the text
                    cleanReply = responseText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
                }
            } catch (e) {
                console.error("Failed to parse AI draft JSON", e);
            }
        }

        return json({ 
            reply: cleanReply, 
            draft: draft 
        });

    } catch (error: any) {
        console.error("AI Draft Error:", error);
        
        // Handle Quota
        if (error.message && error.message.includes("429")) {
            return json({ 
                reply: "⚠️ I've reached my daily limit for free questions. Please create your post manually for now!",
                error: "quota"
            });
        }

        return json({ error: "Failed to communicate with AI." }, { status: 500 });
    }
};
