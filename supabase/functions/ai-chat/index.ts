import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

interface BusinessMetrics {
  totalRestaurants: number;
  restaurantsByTownship: { township: string; count: number }[];
  totalOrders: number;
  totalRevenue: number;
  leadsByStatus: { status: string; count: number }[];
  recentActivity: any[];
  activeUsers: number;
  ordersByStatus: { status: string; count: number }[];
  avgOrderValue: number;
  topTownships: { township: string; orders: number; revenue: number }[];
}

class DatabaseService {
  private supabase;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://fblcilccdjicyosmuome.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseServiceKey) {
      throw new Error('Supabase service role key not found');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async getBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      console.log('Fetching comprehensive business metrics...');

      // Get restaurant metrics
      const { data: restaurants, error: restaurantsError } = await this.supabase
        .from('restaurants')
        .select('township');
      
      if (restaurantsError) throw restaurantsError;

      // Get order metrics
      const { data: orders, error: ordersError } = await this.supabase
        .from('orders')
        .select('status, total_amount_kyats, restaurant_id, restaurants(township)');
      
      if (ordersError) throw ordersError;

      // Get lead metrics
      const { data: leads, error: leadsError } = await this.supabase
        .from('leads')
        .select('status');
      
      if (leadsError) throw leadsError;

      // Get recent activity
      const { data: activity, error: activityError } = await this.supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Get active users count
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('id')
        .eq('is_active', true);

      // Process restaurant data by township
      const restaurantsByTownship = restaurants?.reduce((acc: any, restaurant: any) => {
        const township = restaurant.township || 'Unknown';
        acc[township] = (acc[township] || 0) + 1;
        return acc;
      }, {});

      const restaurantsByTownshipArray = Object.entries(restaurantsByTownship || {})
        .map(([township, count]) => ({ township, count: count as number }))
        .sort((a, b) => b.count - a.count);

      // Process lead data by status
      const leadsByStatus = leads?.reduce((acc: any, lead: any) => {
        const status = lead.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const leadsByStatusArray = Object.entries(leadsByStatus || {})
        .map(([status, count]) => ({ status, count: count as number }));

      // Process order data
      const ordersByStatus = orders?.reduce((acc: any, order: any) => {
        const status = order.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const ordersByStatusArray = Object.entries(ordersByStatus || {})
        .map(([status, count]) => ({ status, count: count as number }));

      // Calculate revenue metrics
      const totalRevenue = orders?.reduce((sum: number, order: any) => {
        return sum + (parseFloat(order.total_amount_kyats) || 0);
      }, 0) || 0;

      const avgOrderValue = orders?.length ? totalRevenue / orders.length : 0;

      // Calculate township performance
      const townshipPerformance = orders?.reduce((acc: any, order: any) => {
        const township = order.restaurants?.township || 'Unknown';
        if (!acc[township]) {
          acc[township] = { orders: 0, revenue: 0 };
        }
        acc[township].orders += 1;
        acc[township].revenue += parseFloat(order.total_amount_kyats) || 0;
        return acc;
      }, {});

      const topTownships = Object.entries(townshipPerformance || {})
        .map(([township, data]: [string, any]) => ({
          township,
          orders: data.orders,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const metrics: BusinessMetrics = {
        totalRestaurants: restaurants?.length || 0,
        restaurantsByTownship: restaurantsByTownshipArray,
        totalOrders: orders?.length || 0,
        totalRevenue,
        leadsByStatus: leadsByStatusArray,
        recentActivity: activity || [],
        activeUsers: users?.length || 0,
        ordersByStatus: ordersByStatusArray,
        avgOrderValue,
        topTownships
      };

      console.log('Business metrics calculated:', {
        totalRestaurants: metrics.totalRestaurants,
        totalOrders: metrics.totalOrders,
        totalRevenue: metrics.totalRevenue,
        topTownshipsCount: metrics.topTownships.length
      });

      return metrics;

    } catch (error) {
      console.error('Error fetching business metrics:', error);
      throw error;
    }
  }

  async querySpecificData(query: string): Promise<any> {
    try {
      console.log('Processing specific query:', query);

      // Enhanced restaurant by township query
      if (query.toLowerCase().includes('restaurant') && query.toLowerCase().includes('township')) {
        console.log('Fetching restaurant counts by township...');
        
        const { data: restaurants, error } = await this.supabase
          .from('restaurants')
          .select('township');
        
        if (error) throw error;

        // Aggregate restaurants by township
        const townshipCounts = restaurants?.reduce((acc: any, restaurant: any) => {
          const township = restaurant.township || 'Unknown';
          acc[township] = (acc[township] || 0) + 1;
          return acc;
        }, {});

        // Convert to sorted array format
        const formattedData = Object.entries(townshipCounts || {})
          .map(([township, count]) => ({ 
            township, 
            restaurantCount: count as number 
          }))
          .sort((a, b) => b.restaurantCount - a.restaurantCount);

        console.log('Restaurant township aggregation:', formattedData);
        
        return {
          type: 'restaurant_township_counts',
          data: formattedData,
          total_restaurants: restaurants?.length || 0,
          summary: `Found ${restaurants?.length || 0} restaurants across ${formattedData.length} townships`
        };
      }

      // Recent orders query
      if (query.toLowerCase().includes('order') && query.toLowerCase().includes('recent')) {
        const { data, error } = await this.supabase
          .from('orders')
          .select('order_number, status, total_amount_kyats, order_date, restaurants(name, township)')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        return {
          type: 'recent_orders',
          data: data || [],
          summary: `Found ${data?.length || 0} recent orders`
        };
      }

      // Lead pipeline query
      if (query.toLowerCase().includes('lead') && query.toLowerCase().includes('pipeline')) {
        const { data, error } = await this.supabase
          .from('leads')
          .select('name, status, next_action_date, restaurants(name, township)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return {
          type: 'lead_pipeline',
          data: data || [],
          summary: `Found ${data?.length || 0} leads in pipeline`
        };
      }

      return null;
    } catch (error) {
      console.error('Error in specific data query:', error);
      return null;
    }
  }
}

class GeminiAIService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  private async callGemini(prompt: string, context: any, businessMetrics: BusinessMetrics): Promise<string> {
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
            text: this.getMyanmarSystemPrompt(context, businessMetrics) + '\n\nUser Question: ' + prompt
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

  private getMyanmarSystemPrompt(context: any, businessMetrics: BusinessMetrics): string {
    const currentSeason = this.getCurrentSeason();
    const isMonsonSeason = currentSeason === 'monsoon';

    // Format business metrics for AI context
    const topTownshipsText = businessMetrics.topTownships
      .slice(0, 5)
      .map(t => `${t.township}: ${t.orders} orders, ${Math.round(t.revenue).toLocaleString()} Kyats`)
      .join(', ');

    const leadsStatusText = businessMetrics.leadsByStatus
      .map(l => `${l.status}: ${l.count}`)
      .join(', ');

    const ordersStatusText = businessMetrics.ordersByStatus
      .map(o => `${o.status}: ${o.count}`)
      .join(', ');

    // Add specific query data context if available
    let specificDataContext = '';
    if (context.specificQueryData) {
      const queryData = context.specificQueryData;
      if (queryData.type === 'restaurant_township_counts') {
        specificDataContext = `\n\nSPECIFIC RESTAURANT TOWNSHIP DATA (${queryData.total_restaurants} total restaurants):\n`;
        queryData.data.forEach((item: any) => {
          specificDataContext += `- ${item.township}: ${item.restaurantCount} restaurants\n`;
        });
      } else if (queryData.type === 'recent_orders') {
        specificDataContext = `\n\nRECENT ORDERS DATA:\n${queryData.summary}\n`;
      } else if (queryData.type === 'lead_pipeline') {
        specificDataContext = `\n\nLEAD PIPELINE DATA:\n${queryData.summary}\n`;
      }
    }

    return `You are a strategic business advisor for ANY GAS Myanmar - UCO collection and gas cylinder supply chain company.

CURRENT DATA:
- Restaurants: ${businessMetrics.totalRestaurants.toLocaleString()}
- Orders: ${businessMetrics.totalOrders.toLocaleString()} 
- Revenue: ${Math.round(businessMetrics.totalRevenue).toLocaleString()} Kyats
- Top Townships: ${topTownshipsText}
- Leads: ${leadsStatusText}
- Orders: ${ordersStatusText}${specificDataContext}

SEASON: ${currentSeason} ${isMonsonSeason ? '🌧️' : '☀️'}

RESPONSE STYLE:
- Be concise and strategic (max 3-4 sentences)
- Lead with key insights, not background
- Focus on actionable recommendations
- Use bullet points for multiple items
- Skip lengthy explanations unless specifically asked

BUSINESS FOCUS:
- UCO collection & gas delivery optimization
- Myanmar cultural business relationships
- Seasonal logistics planning
- Revenue growth strategies

When asked about restaurant counts by township, use the SPECIFIC RESTAURANT TOWNSHIP DATA above.

Provide direct, executive-level insights based on the actual data.`;
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 1-12
    return (month >= 6 && month <= 10) ? 'monsoon' : 'dry_season';
  }

  async generateResponse(prompt: string, context: any): Promise<string> {
    try {
      console.log('Fetching business metrics for AI context...');
      const businessMetrics = await this.dbService.getBusinessMetrics();
      
      // Check if user is asking for specific data
      const specificData = await this.dbService.querySpecificData(prompt);
      
      console.log('Generating response with Gemini API...');
      const response = await this.callGemini(prompt, {
        ...context,
        specificQueryData: specificData
      }, businessMetrics);
      
      console.log('Successfully generated response from Gemini');
      return response;
    } catch (error) {
      console.error('Gemini AI Service Error:', error.message);
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
