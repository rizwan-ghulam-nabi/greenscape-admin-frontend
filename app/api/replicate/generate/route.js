// app/api/replicate/generate/route.js
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  let prompt = ''; // Define prompt outside try block for catch block access
  
  try {
    const body = await req.json();
    prompt = body.prompt;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    console.log("🟢 Generating banner with Gemini enhanced prompt:", prompt);

    let enhancedPrompt = prompt;
    
    // Use the correct model - gemini-3.6-flash
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    
    const promptEnhancement = `You are a professional e-commerce banner designer. 
    Enhance this banner description: "${prompt}"
    
    Provide a detailed description including:
    - Color scheme (specific colors)
    - Lighting (e.g., warm golden hour, bright studio, soft natural)
    - Composition (foreground, background, focal point)
    - Mood/atmosphere (e.g., serene, vibrant, luxurious)
    - Photography style (e.g., minimalist, product-focused, lifestyle)
    
    Keep it concise (max 50 words). Return only the enhanced description.`;

    const result = await model.generateContent(promptEnhancement);
    enhancedPrompt = result.response.text().trim();

    console.log("✨ Enhanced Prompt:", enhancedPrompt);

    // Generate image using Pollinations
    const encodedPrompt = encodeURIComponent(
      `Professional e-commerce website banner, 16:9 aspect ratio, wide shot, ${enhancedPrompt}, photorealistic, high quality, bright lighting, clean composition. NO TEXT, NO WORDS.`
    );

    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1920&height=768&model=flux`;

    return NextResponse.json({ 
      imageUrl,
      enhancedPrompt,
      originalPrompt: prompt
    });

  } catch (err) {
    console.error("🔴 Server AI Error:", err);
    
    // Fallback to Pollinations without enhancement
    const fallbackPrompt = encodeURIComponent(
      `Professional e-commerce website banner, 16:9 aspect ratio, wide shot, ${prompt || "indoor plants"}, photorealistic, high quality, bright lighting, clean composition. NO TEXT, NO WORDS.`
    );
    
    const fallbackImageUrl = `https://image.pollinations.ai/prompt/${fallbackPrompt}?width=1920&height=768&model=flux`;
    
    return NextResponse.json({ 
      imageUrl: fallbackImageUrl,
      enhancedPrompt: prompt || "indoor plants",
      note: "Gemini enhancement failed, used original prompt"
    });
  }
}