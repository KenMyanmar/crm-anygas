
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

class AIProviderService {
  private async callGemini(prompt: string, context: any): Promise<string> {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('Gemini API key not configured');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
  }

  private async callOpenAI(prompt: string, context: any): Promise<string> {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.getMyanmarSystemPrompt(context) },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    return data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string, context: any): Promise<string> {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('Anthropic API key not configured');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: this.getMyanmarSystemPrompt(context),
        messages: [
          { role: 'user', content: prompt }
        ]
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${data.error?.message || 'Unknown error'}`);
    }

    return data.content[0].text;
  }

  private getMyanmarSystemPrompt(context: any): string {
    const currentSeason = this.getCurrentSeason();
    const isMonsonSeason = currentSeason === 'monsoon';

    return `You are an AI business advisor for ANY GAS Myanmar - a UCO (Used Cooking Oil) and gas supply chain management company.

Business Context:
- Company: ANY GAS - UCO collection and gas cylinder delivery in Myanmar
- Market: Myanmar restaurants, hotels, food vendors, households
- Challenges: ${isMonsonSeason ? 'Monsoon season logistics (June-October)' : 'Dry season optimization (November-May)'}, supplier relationships, quality control
- Cultural: Relationship-based business, respect for elders, traditional hierarchy
- Economic: Cost efficiency, MMK currency considerations, fuel price volatility
- Youth Engagement: Education through sports/cycling, technology training, community development

Current Data Context:
${JSON.stringify(context, null, 2)}

Season: ${currentSeason} ${isMonsonSeason ? '🌧️ (Logistics challenges expected)' : '☀️ (Optimal operations)'}

Provide insights that help optimize:
1. Collection/delivery route efficiency considering weather and infrastructure
2. Supplier relationship management (Myanmar cultural context)
3. Quality control and competitive pricing strategies  
4. Youth engagement through education, sports, and technology initiatives
5. Cost reduction and sustainability improvements
6. Gas cylinder delivery optimization and safety protocols

Always respond in a helpful, culturally aware manner that respects Myanmar business traditions while driving modern efficiency. Focus on practical solutions that build resilience in challenging environments.

Response Format:
- Provide actionable business insights
- Include cultural considerations when relevant
- Suggest specific next steps
- Consider seasonal/weather impacts
- Highlight youth engagement opportunities`;
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 1-12
    return (month >= 6 && month <= 10) ? 'monsoon' : 'dry_season';
  }

  async generateResponse(prompt: string, context: any): Promise<string> {
    const providers = [
      { name: 'gemini', fn: this.callGemini.bind(this) },
      { name: 'openai', fn: this.callOpenAI.bind(this) },
      { name: 'anthropic', fn: this.callAnthropic.bind(this) }
    ];

    for (const provider of providers) {
      try {
        console.log(`Trying ${provider.name} provider...`);
        const response = await provider.fn(prompt, context);
        console.log(`${provider.name} succeeded`);
        return response;
      } catch (error) {
        console.error(`${provider.name} failed:`, error.message);
        continue;
      }
    }

    throw new Error('All AI providers unavailable. Please check API key configuration.');
  }
}

serve(async (req) => {
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

    const aiService = new AIProviderService();
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
        response: 'I apologize, but I\'m currently unable to process your request. Please try again later or contact support if the issue persists.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
