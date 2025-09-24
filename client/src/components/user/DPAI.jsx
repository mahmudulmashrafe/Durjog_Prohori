import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaMapMarkerAlt, FaRoute, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';

const DPAI = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I am DPAI (Durjog Prohori AI), your specialized assistant for disaster management in Bangladesh. I can help you with:\n\n• Emergency preparedness advice\n• Safe evacuation routes\n• Disaster response strategies\n• Real-time safety guidance\n• Location-specific risk assessment\n\nHow can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get user's location for better assistance
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const quickActions = [
    {
      icon: FaExclamationTriangle,
      text: 'Emergency Help',
      message: 'I need immediate help with a disaster situation. What should I do?'
    },
    {
      icon: FaRoute,
      text: 'Safe Route',
      message: 'Can you suggest the safest evacuation route from my current location?'
    },
    {
      icon: FaMapMarkerAlt,
      text: 'Risk Assessment',
      message: 'What are the current disaster risks in my area?'
    },
    {
      icon: FaLightbulb,
      text: 'Preparedness Tips',
      message: 'Give me disaster preparedness tips for Bangladesh'
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to DPAI:', inputMessage);
      
      const response = await fetch(`http://localhost:5002/api/dpai/chat?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          message: inputMessage,
          location: userLocation,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Full Response data:', JSON.stringify(data, null, 2));
      console.log('Response content:', data.response);
      console.log('Response type:', typeof data.response);

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          timestamp: new Date(),
          suggestions: data.suggestions || [],
          isFallback: data.fallback || false
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Show a subtle indicator if this was a fallback response
        if (data.fallback) {
          console.log('Using fallback response due to AI service unavailability');
        }
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `I'm currently experiencing connectivity issues. Here's what you can do:

🚨 **For Emergencies:**
• Call 999 (National Emergency)
• Call 9555555 (Fire Service)
• Call 100 (Police)
• Call 199 (Ambulance)

🛡️ **General Safety:**
• Move to a safe location
• Stay informed via radio/TV
• Follow local authority instructions
• Keep emergency supplies ready

I'll try to reconnect automatically. Please try your question again in a moment.

**Debug Info:** ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (message) => {
    setInputMessage(message);
    inputRef.current?.focus();
  };

  const testConnection = async () => {
    try {
      console.log('Testing connection...');
      const response = await fetch(`http://localhost:5002/api/dpai/test?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      const data = await response.json();
      console.log('Test response:', data);
      
      const testMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Connection test: ${data.success ? 'SUCCESS' : 'FAILED'}\nResponse: ${data.response || data.error}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, testMessage]);
    } catch (error) {
      console.error('Test connection error:', error);
      const testMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Connection test FAILED: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, testMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full">
            <FaRobot className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">DPAI Assistant</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Durjog Prohori AI for Bangladesh</p>
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <button
              onClick={testConnection}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
            >
              Test Connection
            </button>
            <div className="flex items-center space-x-2 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.message)}
              className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 text-left"
            >
              <action.icon className="text-blue-600 dark:text-blue-400 text-sm" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-xs md:max-w-md lg:max-w-lg ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : message.isError 
                    ? 'bg-gradient-to-r from-red-500 to-pink-600'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}>
                {message.type === 'user' ? (
                  <FaUser className="text-white text-sm" />
                ) : (
                  <FaRobot className="text-white text-sm" />
                )}
              </div>
              <div className={`rounded-2xl p-4 shadow-md ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : message.isError
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900 border border-red-200 dark:border-red-700'
                    : message.isFallback
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 border border-yellow-200 dark:border-yellow-700'
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  message.type === 'user' 
                    ? 'text-white' 
                    : message.isError 
                      ? 'text-red-700 dark:text-red-300'
                      : message.isFallback
                        ? 'text-yellow-800 dark:text-yellow-200'
                        : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {message.content}
                </p>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(suggestion)}
                        className="block w-full text-left p-2 bg-blue-50 dark:bg-gray-600 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-500 transition-colors duration-200 text-sm text-blue-700 dark:text-blue-300"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                <p className={`text-xs mt-2 ${
                  message.type === 'user' 
                    ? 'text-green-100' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-xs md:max-w-md lg:max-w-lg">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <FaRobot className="text-white text-sm" />
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-600">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about disaster preparedness, evacuation routes, or emergency procedures..."
              className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-2xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </div>
        
        {userLocation && (
          <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <FaMapMarkerAlt />
            <span>Location enabled for better assistance</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DPAI;
