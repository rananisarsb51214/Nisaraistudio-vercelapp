import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, topic, url, brand, country } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key is not configured on the server." }, { status: 500 });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    if (mode === "blog") {
      if (!topic) {
        return NextResponse.json({ error: "Topic is required for blog mode" }, { status: 400 });
      }

      // Generate blog post + SEO metadata
      const prompt = `You are an elite SEO optimization and Content Production agent.
Create a high-quality, professional, engaging blog article about: "${topic}".
The article must be optimized for Google Search rankings with natural keyword placement.

Return a JSON object containing:
1. "title": Catchy, SEO-optimized title
2. "metaDescription": Captivating search snippet under 160 characters
3. "keywords": Array of 5-8 relevant search keywords
4. "readTime": Estimated read time (e.g., "5 min read")
5. "content": The complete markdown article content including headings, subheadings, and engaging bullet points.

Respond ONLY with valid JSON matching the schema structure. Do not wrap in markdown code blocks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              readTime: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "metaDescription", "keywords", "readTime", "content"]
          }
        }
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText.trim());
      return NextResponse.json({ data });

    } else if (mode === "ecom") {
      if (!url) {
        return NextResponse.json({ error: "Product URL is required for e-commerce mode" }, { status: 400 });
      }

      // Execute the "Super God Prompt - Ecom AI Money Machine"
      const prompt = `You are an Elite AI E-Commerce Empire Builder, Growth Hacker, and Conversion Strategist.
Your mission is to transform the following product link into a FULLY FUNCTIONAL SALES ECOSYSTEM:
Product Link: ${url}
Brand Name (optional): ${brand || "N/A"}
Target Country: ${country || "Global"}

Generate a highly optimized marketing ecosystem containing the following 10 structural parts. Return your response as a valid JSON object matching the requested schema.

Schema structure:
1. "productBreakdown": {
     "summary": "simple explanation of the product",
     "audience": "deep niche analysis",
     "painPoints": ["emotional/practical list"],
     "buyingTriggers": ["triggers"]
   }
2. "offerCreation": {
     "bundleIdeas": ["ideas"],
     "discountStrategy": "strategy",
     "urgencyAngles": ["urgency angles"],
     "buyNowLogic": "logic"
   }
3. "productPage": {
     "headline": "scroll-stopping headline",
     "subheadline": "subheadline",
     "benefits": ["benefits"],
     "socialProof": ["social proof style lines"],
     "ctaStyles": ["CTA styles"]
   }
4. "socialMedia": {
     "scripts": ["TikTok/Reels script details"],
     "hooks": ["Hooks"],
     "captions": ["Caption and hashtags"],
     "ugcIdeas": ["UGC ideas"]
   }
5. "paidAds": {
     "metaAds": ["FB/IG copies"],
     "googleAds": ["Google ad lines"],
     "emotionalAngle": "emotional angle description"
   }
6. "automations": ["automations stack and tools"]
7. "commentConversion": ["replies/DM closure scripts"]
8. "trafficStrategy": ["organic/paid plan"]
9. "monetization": ["upsell/cross-sell suggestions"]
10. "bonus": {
      "viralIdea": "viral content idea",
      "highIncomeSkill": "skill suggestions",
      "dailyPlan": "simple plan"
    }

Respond ONLY with valid JSON. Do not write text outside of JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productBreakdown: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  audience: { type: Type.STRING },
                  painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                  buyingTriggers: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              offerCreation: {
                type: Type.OBJECT,
                properties: {
                  bundleIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  discountStrategy: { type: Type.STRING },
                  urgencyAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  buyNowLogic: { type: Type.STRING }
                }
              },
              productPage: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  subheadline: { type: Type.STRING },
                  benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                  socialProof: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ctaStyles: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              socialMedia: {
                type: Type.OBJECT,
                properties: {
                  scripts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  captions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ugcIdeas: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              paidAds: {
                type: Type.OBJECT,
                properties: {
                  metaAds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  googleAds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  emotionalAngle: { type: Type.STRING }
                }
              },
              automations: { type: Type.ARRAY, items: { type: Type.STRING } },
              commentConversion: { type: Type.ARRAY, items: { type: Type.STRING } },
              trafficStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
              monetization: { type: Type.ARRAY, items: { type: Type.STRING } },
              bonus: {
                type: Type.OBJECT,
                properties: {
                  viralIdea: { type: Type.STRING },
                  highIncomeSkill: { type: Type.STRING },
                  dailyPlan: { type: Type.STRING }
                }
              }
            },
            required: ["productBreakdown", "offerCreation", "productPage", "socialMedia", "paidAds", "automations", "commentConversion", "trafficStrategy", "monetization", "bonus"]
          }
        }
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText.trim());
      return NextResponse.json({ data });

    } else if (mode === "evolve") {
      const { inputSource } = body;
      if (!inputSource) {
        return NextResponse.json({ error: "Input URL or content source is required for Browser Evolver" }, { status: 400 });
      }

      // Execute Browser Evolver Intelligence
      const prompt = `You are the Gemini Agent Browser Evolver. You are simulating compatibility crawling of a webpage or raw data feed.
Analyze the target resource / raw feed: "${inputSource}"
Extract critical brand context, customer pain points, SEO tactics, or competitor positioning.

Return a JSON object containing:
1. "key": A short, clean, alphanumeric snake_case key representing the evolved memory node (e.g., "market_demographic_rule", "competitor_seo_gap")
2. "value": A detailed, high-density knowledge statement or rule extracted from the resource.
3. "category": Must be exactly one of: "brand_guidelines", "target_audience", "seo_rules", "promotional_links"
4. "confidence": A percentage string of analytical confidence (e.g. "98%")

Respond ONLY with valid JSON. Do not add any conversational text or formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              key: { type: Type.STRING },
              value: { type: Type.STRING },
              category: { 
                type: Type.STRING,
                enum: ["brand_guidelines", "target_audience", "seo_rules", "promotional_links"]
              },
              confidence: { type: Type.STRING }
            },
            required: ["key", "value", "category", "confidence"]
          }
        }
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText.trim());
      return NextResponse.json({ data });

    } else if (mode === "agent_chat") {
      const { systemInstruction, temperature, prompt, history, model } = body;
      if (!prompt) {
        return NextResponse.json({ error: "Prompt is required for agent_chat mode" }, { status: 400 });
      }

      // Map incoming user/model conversation logs to the structure expected by the Google GenAI SDK
      let contents: any[] = [];
      if (history && Array.isArray(history)) {
        contents = history.map((msg: any) => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        }));
      }
      contents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: model || "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction || "You are a helpful custom assistant.",
          temperature: typeof temperature === 'number' ? temperature : 0.7,
        }
      });

      return NextResponse.json({ text: response.text || "" });

    } else if (mode === "social_template") {
      const { topic, platform } = body;
      if (!topic) {
        return NextResponse.json({ error: "Topic is required for social template mode" }, { status: 400 });
      }

      const prompt = `You are an expert Social Media Copywriting & Growth Marketing AI.
Create a high-performing, viral social media post template for ${platform || 'Cross-Platform (Twitter, Instagram, LinkedIn, TikTok)'} about: "${topic}".
The template MUST include dynamic curly-bracket variables that can be replaced live, such as:
- {{brand}}
- {{product}}
- {{discount}}
- {{headline}}
- {{cta}}
- {{link}}
- {{date}}

Return a JSON object containing:
1. "title": Short descriptive title for this template
2. "platform": Suggested platform (e.g., "Twitter/X", "Instagram", "LinkedIn", "TikTok")
3. "template": The full text template containing {{variables}}
4. "variables": Array of variable keys used in the template (e.g., ["brand", "product", "discount", "cta", "link"])

Respond ONLY with valid JSON matching the schema structure. Do not wrap in markdown code blocks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              template: { type: Type.STRING },
              variables: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "platform", "template", "variables"]
          }
        }
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText.trim());
      return NextResponse.json({ data });

    } else {
      return NextResponse.json({ error: "Invalid mode specified" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Gemini API server route error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request." }, { status: 500 });
  }
}
