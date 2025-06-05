
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X,
  Zap,
  TrendingUp,
  MapPin,
  Users,
  Lightbulb,
  Minimize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  insights?: string[];
}

interface ModernAIChatPanelProps {
  dashboardData?: any;
  userRole?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const ModernAIChatPanel: React.FC<ModernAIChatPanelProps> = ({ 
  dashboardData, 
  userRole = 'user',
  isOpen,
  onToggle 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: '🇲🇲 မင်္ဂလာပါ! I\'m your ANY GAS Myanmar business advisor. I can help you optimize operations, analyze supplier relationships, and plan for seasonal challenges. How can I assist you today?',
        timestamp: new Date(),
        insights: [
          'Seasonal optimization strategies',
          'Supplier relationship analysis', 
          'Route efficiency improvements',
          'Youth engagement opportunities'
        ]
      }]);
    }
  }, []);

  const getCurrentSeasonContext = () => {
    const month = new Date().getMonth() + 1;
    const isMonsonSeason = month >= 6 && month <= 10;
    return {
      season: isMonsonSeason ? 'monsoon' : 'dry_season',
      seasonEmoji: isMonsonSeason ? '🌧️' : '☀️'
    };
  };

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || inputMessage.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = {
        ...getCurrentSeasonContext(),
        businessData: dashboardData || {},
        userRole,
        currentTimestamp: new Date().toISOString(),
        businessType: 'anygas',
        marketContext: {
          country: 'Myanmar',
          industry: 'UCO Supply Chain & Gas Distribution'
        }
      };
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: messageToSend,
          context,
          businessType: 'anygas',
          userRole
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Failed to get AI response');

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        insights: data.insights || []
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('AI Chat Error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I'm experiencing technical difficulties. Please try again or contact support if the issue persists.`,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: TrendingUp, text: "Analyze performance", action: "Analyze this week's collection and delivery performance with seasonal considerations" },
    { icon: MapPin, text: "Route optimization", action: "Suggest route optimization for current weather conditions" },
    { icon: Users, text: "Supplier insights", action: "Which suppliers need relationship improvement?" },
    { icon: Lightbulb, text: "Youth engagement", action: "Identify youth engagement opportunities in our network" }
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-40"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onToggle}
      />
      
      {/* Chat Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">ANY GAS AI Advisor</h3>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="text-xs">
                  {getCurrentSeasonContext().seasonEmoji} Myanmar
                </Badge>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      {message.role === 'user' ? 
                        <User className="h-4 w-4 text-white" /> : 
                        <Bot className="h-4 w-4 text-white" />
                      }
                    </div>
                    <div className={`rounded-xl p-3 ${
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
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-xl p-3">
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

        {/* Quick Actions */}
        <div className="p-3 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((qa, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="justify-start text-xs h-8 p-2"
                onClick={() => handleSendMessage(qa.action)}
                disabled={isLoading}
              >
                <qa.icon className="h-3 w-3 mr-1" />
                {qa.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your business..."
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernAIChatPanel;
