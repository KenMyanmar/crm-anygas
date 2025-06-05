
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  context?: any;
  businessType: 'anygas' | 'uco_supply_chain';
  userRole?: string;
}

interface ChatResponse {
  response: string;
  insights?: string[];
  actionItems?: string[];
  success: boolean;
  error?: string;
}

class GeminiAIService {
  private async callGemini(prompt: string, context: any): Promise<string> {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Calling Gemini API with model: gemini-1.5-flash');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: this.getMyanmarSystemPrompt(context) + '\n\nUser Question: ' + prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error Response:', errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Gemini API Success - Response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text || 'No response generated';
  }

  private getMyanmarSystemPrompt(context: any): string {
    const currentSeason = this.getCurrentSeason();
    const isMonsonSeason = currentSeason === 'monsoon';

    return `You are an expert AI business advisor for ANY GAS Myanmar - a UCO (Used Cooking Oil) collection and gas cylinder supply chain company operating across Myanmar.

BUSINESS CONTEXT:
- Company: ANY GAS Myanmar - UCO collection and gas cylinder delivery
- Market: Myanmar restaurants, hotels, food vendors, households
- Operations: Door-to-door UCO collection, gas cylinder delivery, supplier relationship management
- Cultural Context: Relationship-based business culture, respect for traditional hierarchy, community-focused approach
- Economic Context: Cost efficiency critical, MMK currency considerations, fuel price volatility

CURRENT SEASON: ${currentSeason} ${isMonsonSeason ? '🌧️ (June-October: Logistics challenges expected)' : '☀️ (November-May: Optimal operations period)'}

SEASONAL CONSIDERATIONS:
${isMonsonSeason ? 
  '- Monsoon challenges: Road access difficulties, delayed deliveries, supplier accessibility issues\n- Focus: Indoor relationship building, inventory management, weather contingency planning' :
  '- Dry season opportunities: Optimal collection routes, expansion activities, new supplier onboarding\n- Focus: Route optimization, volume expansion, technology adoption'
}

CURRENT DATA CONTEXT:
${JSON.stringify(context, null, 2)}

YOUR ROLE:
Provide actionable insights that help optimize:

1. **Collection & Delivery Operations**
   - Route efficiency considering weather and infrastructure
   - Seasonal logistics planning and contingency strategies
   - Cost optimization and fuel efficiency improvements

2. **Supplier Relationship Management**
   - Myanmar cultural approach to business relationships
   - Trust-building strategies with restaurant and hotel partners
   - Long-term partnership development and retention

3. **Quality Control & Competitive Positioning**
   - UCO quality standards and competitive pricing strategies
   - Gas cylinder safety protocols and delivery reliability
   - Market positioning against competitors

4. **Youth Engagement & Community Development**
   - Education through sports (cycling, football) and technology training
   - Community development initiatives that build brand loyalty
   - Youth employment and skill development opportunities

5. **Cost Reduction & Sustainability**
   - Environmental sustainability improvements
   - Waste reduction and efficiency optimization
   - Financial planning and cash flow management

RESPONSE GUIDELINES:
- Always provide practical, actionable advice
- Consider Myanmar cultural context and business traditions
- Include specific next steps when possible
- Highlight seasonal/weather impacts on recommendations
- Suggest youth engagement opportunities where relevant
- Focus on building long-term business resilience
- Use respectful language appropriate for Myanmar business culture

Respond in a helpful, culturally aware manner that respects Myanmar business traditions while driving modern operational efficiency.`;
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 1-12
    return (month >= 6 && month <= 10) ? 'monsoon' : 'dry_season';
  }

  async generateResponse(prompt: string, context: any): Promise<string> {
    try {
      console.log('Generating response with Gemini API...');
      const response = await this.callGemini(prompt, context);
      console.log('Successfully generated response from Gemini');
      return response;
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      throw new Error(`AI service unavailable: ${error.message}. Please check the Gemini API configuration.`);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, context, businessType, userRole }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('=== AI CHAT REQUEST ===');
    console.log('Message:', message);
    console.log('Business Type:', businessType);
    console.log('User Role:', userRole);
    console.log('Context keys:', Object.keys(context || {}));

    const aiService = new GeminiAIService();
    const response = await aiService.generateResponse(message, {
      ...context,
      businessType,
      userRole,
      timestamp: new Date().toISOString()
    });

    const chatResponse: ChatResponse = {
      response,
      success: true,
      insights: [],
      actionItems: []
    };

    console.log('=== AI CHAT SUCCESS ===');
    console.log('Response length:', response.length);

    return new Response(
      JSON.stringify(chatResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('=== AI CHAT ERROR ===');
    console.error('Error:', error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
        response: 'I apologize, but I\'m currently unable to process your request. Please ensure the Gemini API is properly configured and try again.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
