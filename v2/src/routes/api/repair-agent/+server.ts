import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { AIConversationRepository } from "$lib/server/repositories/aiChatRepository";



import { AIConversationRepository } from "$lib/server/repositories/aiChatRepository";

export const GET: RequestHandler = async ({ url, locals }) => {
    const userId = locals.user?.id;
    if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

    const postId = url.searchParams.get('postId');
    const chatId = url.searchParams.get('chatId');

    try {
        if (chatId) {
             // Get specific conversation messages
             // Verify ownership
             const conv = await AIConversationRepository.getConversationById(chatId, userId);
             if (!conv) return json({ error: "Not found" }, { status: 404 });
             
             const messages = await AIConversationRepository.getMessages(chatId);
             return json({ messages });
        } 
        else if (postId) {
            // List conversations for post
            const conversations = await AIConversationRepository.getConversations(userId, postId);
            return json({ conversations });
        }
        
        return json({ error: "Missing parameters" }, { status: 400 });
    } catch(e) {
        console.error(e);
        return json({ error: "Server error" }, { status: 500 });
    }
};

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { message, postContext, chatId } = await request.json();
        const userId = locals.user?.id; // Assuming locals.user is populated by auth hook

        if (!GEMINI_API_KEY) {
            return json({ error: "API key not configured" }, { status: 500 });
        }
        
        // We need a userId to save the chat
        if (!userId) {
             return json({ error: "Unauthorized" }, { status: 401 });
        }

        let conversationId = chatId;
        let history: any[] = [];

        // 1. Handle Conversation State
        if (conversationId) {
            // Load existing
            const conversation = await AIConversationRepository.getConversationById(conversationId, userId);
            if (!conversation) {
                return json({ error: "Conversation not found" }, { status: 404 });
            }
            
            // Fetch DB history
            const dbMessages = await AIConversationRepository.getMessages(conversationId);
            
            // Format for Gemini
            // First message is usually setup, but we'll re-inject system prompt as the "hidden" first piece of context in the active session
            history = dbMessages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));
            
        } else {
            // Create new
            console.log('[AI] Creating new conversation for post:', postContext.id);
            const newConv = await AIConversationRepository.createConversation(userId, postContext.id);
            conversationId = newConv.id;
            console.log('[AI] Created conversation:', conversationId);
        }

        // 2. Save User Message
        await AIConversationRepository.addMessage(conversationId, 'user', message);

        // Construct System Prompt
        const systemPrompt = `You are a Repair Diagnostic Assistant helping a skilled maker fix: **${postContext.title}**
        
**Description**: ${postContext.description}
**Budget**: ${postContext.targetPrice ? `€${postContext.targetPrice}` : "Not specified"}
${postContext.imageUrl ? "**Image**: Provided (analyze it if new)" : ""}

**Your Role**:
1. Search for instances (if needed)
2. Suggest causes, tools/parts, safety tips
3. BE CONCISE.

**Context**: This is a persistent chat history.`;

        // 3. Prepare Gemini Context
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} }], // Re-enabled for links
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            }
        });

        // Add history. 
        // Note: Gemini startChat history expects [User, Model, User, Model...]
        // Our 'history' array from DB is exactly that.
        
        // Handle Image Context:
        // System instructions must be text-only.
        // We inject the image as a "fake" first turn or attach to the first user message?
        // Safest strategy: Prepend a "Context Setting" turn if an image exists.
        
        if (postContext.imageUrl) {
            try {
                const imageBase64 = await fetchImageAsBase64(postContext.imageUrl);
                const imagePart = {
                    inlineData: {
                        mimeType: "image/jpeg", // Assuming JPEG for simplicity, ideally detect
                        data: imageBase64
                    }
                };
                
                // Prepend context turn
                history = [
                    {
                        role: 'user',
                        parts: [
                            { text: "Here is the image of the item I need help with." },
                            imagePart
                        ]
                    },
                    {
                        role: 'model',
                        parts: [
                            { text: "I have analyzed the image and am ready to help." }
                        ]
                    },
                    ...history
                ];
            } catch (e) {
                console.error("Image load failed", e);
            }
        }
        
        const chat = model.startChat({
            history: history,
        });

        // 4. Send Message & Stream
        const result = await chat.sendMessageStream(message);

        // Create a readable stream for the response
        const stream = new ReadableStream({
            async start(controller) {
                let fullResponse = "";
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        fullResponse += chunkText;
                        controller.enqueue(new TextEncoder().encode(chunkText));
                    }
                    
                    // 5. Save Assistant Response (after stream triggers 'done')
                    // We do this inside the stream completion or after the loop
                    if (fullResponse) {
                        try {
                             await AIConversationRepository.addMessage(conversationId, 'assistant', fullResponse);
                             
                             // Auto-title trigger check (e.g., if message count == 4 (2 turns))
                             // We can spawn this async
                             checkAutoTitle(conversationId, history, message, fullResponse);
                        } catch (streamError: any) {
                        console.error("[AI] Stream error:", streamError);
                        
                        // Check if it's a quota error
                        if (streamError.message && streamError.message.includes("quota")) {
                            controller.enqueue(new TextEncoder().encode(
                                "⚠️ **API Daily Quota Exceeded**\n\n" +
                                "The AI assistant has used all 20 free requests for today. " +
                                "The quota will reset in 24 hours.\n\n" +
                                "To continue using the AI assistant immediately, upgrade to a paid Google AI plan at [Google AI Studio](https://aistudio.google.com/)."
                            ));
                        } else {
                            controller.enqueue(new TextEncoder().encode("Sorry, an error occurred."));
                        }
                    } finally {
                        controller.close();
                    }
                } else { // If fullResponse is empty, but stream finished, still close
                    controller.close();
                }
                } catch (e) {
                    controller.error(e);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Conversation-Id': conversationId // Return ID so client knows which chat it is
            }
        });

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
        return Buffer.from(arrayBuffer).toString('base64');
    } catch (error) {
        console.error("Image fetch error:", error);
        throw new Error("Could not load image");
    }
}

// Background Task for Titling
async function checkAutoTitle(chatId: string, history: any[], userMsg: string, aiMsg: string) {
    try {
        // Check if this conversation already has a title
        const conversation = await AIConversationRepository.getConversationById(chatId, ''); // We'll check in the repo
        
        console.log(`[AI] checkAutoTitle: chat ${chatId}, current title: "${conversation?.title}"`);
        
        // Only generate if title is "New Chat" or empty
        if (!conversation || conversation.title === 'New Chat' || !conversation.title) {
            const messages = await AIConversationRepository.getMessages(chatId);
            console.log(`[AI] Chat needs title. Message count: ${messages.length}`);
            
            // Generate title if we have at least 2 messages and no title yet
            if (messages.length >= 2) {
                console.log('[AI] Generating title...');
                const titleGen = new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({ model: "gemini-2.5-flash" });
                
                // Use the first user and assistant messages for the title
                const firstUser = messages.find(m => m.role === 'user')?.content || userMsg;
                const firstAssistant = messages.find(m => m.role === 'assistant')?.content || aiMsg;
                
                const prompt = `Create a brief 3-5 word title for this repair conversation.
User asked: ${firstUser.substring(0, 200)}
AI replied: ${firstAssistant.substring(0, 200)}...

Title (no quotes):`;
                const res = await titleGen.generateContent(prompt);
                const title = res.response.text().replace(/["*#]/g, '').trim();
                
                if (title && title.length > 0 && title !== 'New Chat') {
                    await AIConversationRepository.updateTitle(chatId, title);
                    console.log(`[AI] Auto-generated title for chat ${chatId}: "${title}"`);
                }
            }
        } else {
            console.log(`[AI] Chat already has title: "${conversation.title}"`);
        }
    } catch (e) {
        console.error("[AI] Auto-title failed", e);
    }
}

// DELETE - Remove a conversation
export const DELETE: RequestHandler = async ({ url, locals }) => {
    const userId = locals.user?.id;
    if (!userId) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatId = url.searchParams.get("chatId");
    if (!chatId) {
        return json({ error: 'chatId required' }, { status: 400 });
    }

    try {
        await AIConversationRepository.deleteConversation(chatId, userId);
        console.log(`[AI] Deleted conversation ${chatId}`);
        return json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[AI] Delete failed:", error);
        return json({ error: 'Delete failed' }, { status: 500 });
    }
};
