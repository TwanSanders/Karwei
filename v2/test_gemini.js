import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyDx1Hlnvwy8rZ8oVQ3RXKnN4C286FAfq3c";
const genAI = new GoogleGenerativeAI(apiKey);

async function testImageAndGrounding() {
    console.log("Testing Image Analysis + Web Grounding...\n");
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} }]
        });
        
        // Test with just text + grounding first
        console.log("🔍 Testing web grounding (searching for repair info)...");
        const result = await model.generateContent(
            "Find me a real-world example of how someone repaired a broken iPhone screen. Include a source link."
        );
        
        const response = await result.response;
        console.log("✅ Grounding works!");
        console.log("Response:", response.text().substring(0, 200) + "...\n");
        
        console.log("✅ Image + Grounding features are ready!");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testImageAndGrounding();
