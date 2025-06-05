
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Zap,
  TrendingUp,
  MapPin,
  Users,
  Lightbulb
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  insights?: string[];
  actionItems?: string[];
}

interface AIChatWidgetProps {
  dashboardData?: any;
  userRole?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ 
  dashboardData, 
  userRole = 'user',
  isMinimized = false,
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when component mounts
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: '🇲🇲 မင်္ဂလာပါ! I\'m your ANY GAS Myanmar business advisor. I can help you optimize operations, analyze supplier relationships, plan for monsoon season, and identify youth engagement opportunities. How can I assist you today?',
        timestamp: new Date(),
        insights: [
          'Ask about seasonal optimization strategies',
          'Request supplier relationship analysis', 
          'Inquire about route efficiency improvements',
          'Explore youth engagement opportunities'
        ]
      }]);
    }
  }, []);

  const getCurrentSeasonContext = () => {
    const month = new Date().getMonth() + 1;
    const isMonsonSeason = month >= 6 && month <= 10;
    return {
      season: isMonsonSeason ? 'monsoon' : 'dry_season',
      seasonalChallenges: isMonsonSeason 
        ? 'Logistics difficulties, route delays, supplier access challenges'
        : 'Optimal collection period, expansion opportunities, relationship building',
      seasonEmoji: isMonsonSeason ? '🌧️' : '☀️'
    };
  };

  const getBusinessContext = () => {
    const seasonContext = getCurrentSeasonContext();
    return {
      ...seasonContext,
      businessData: dashboardData || {},
      userRole,
      currentTimestamp: new Date().toISOString(),
      businessType: 'anygas',
      marketContext: {
        country: 'Myanmar',
        industry: 'UCO Supply Chain & Gas Distribution',
        challenges: ['Infrastructure limitations', 'Weather dependencies', 'Relationship building'],
        opportunities: ['Youth engagement', 'Technology adoption', 'Sustainability focus']
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = getBusinessContext();
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: inputMessage.trim(),
          context,
          businessType: 'anygas',
          userRole
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        insights: data.insights || [],
        actionItems: data.actionItems || []
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('AI Chat Error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I'm experiencing technical difficulties. ${error.message}. Please try again or contact support if the issue persists.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "AI Chat Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  const quickActions = [
    { icon: TrendingUp, text: "Analyze this week's performance", action: "Analyze this week's collection and delivery performance with seasonal considerations" },
    { icon: MapPin, text: "Route optimization", action: "Suggest route optimization for current weather conditions and supplier locations" },
    { icon: Users, text: "Supplier relationships", action: "Which suppliers need relationship improvement and what cultural approach should we take?" },
    { icon: Lightbulb, text: "Youth engagement", action: "Identify youth engagement opportunities in our current supplier network" }
  ];

  if (isMinimized) {
    return (
      <Button
        onClick={onToggleMinimize}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg bg-blue-600 hover:bg-blue-700"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 shadow-xl border-2 transition-all duration-300 ${
      isExpanded ? 'w-96 h-[600px]' : 'w-80 h-96'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-sm">ANY GAS AI Advisor</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {getCurrentSeasonContext().seasonEmoji} Myanmar
            </Badge>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onToggleMinimize}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-full">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      {message.role === 'user' ? 
                        <User className="h-3 w-3 text-white" /> : 
                        <Bot className="h-3 w-3 text-white" />
                      }
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.insights && message.insights.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.insights.map((insight, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                              {insight}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {isExpanded && (
          <div className="p-2 border-t">
            <div className="grid grid-cols-1 gap-1">
              {quickActions.map((qa, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs h-8"
                  onClick={() => handleQuickAction(qa.action)}
                >
                  <qa.icon className="h-3 w-3 mr-2" />
                  {qa.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your business..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="text-sm"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatWidget;
