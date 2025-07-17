"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Search, FileText, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  protocols?: any[];
  suggestions?: string[];
}

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente AI per CDS e Blu di Metilene. Puoi chiedermi informazioni sui protocolli, sintomi, dosaggi o qualsiasi altra domanda. Come posso aiutarti?',
      timestamp: new Date(),
      suggestions: ['Quali sono i protocolli per la tosse?', 'Differenza tra CDS e Blu di Metilene', 'Dosaggio per problemi digestivi']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchAirtable = async (query: string) => {
    // Questa funzione cercherà nei tuoi dati Airtable
    // Simula una ricerca per ora, poi implementeremo l'API reale
    const mockProtocols = [
      { name: 'Protocollo A - CDS', substance: 'CDS', category: 'Digestivo' },
      { name: 'Protocollo B - CDS', substance: 'CDS', category: 'Respiratorio' }
    ];
    
    // Simula delay API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockProtocols.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Cerca nei protocolli Airtable
      const protocols = await searchAirtable(inputMessage);
      
      // Simula risposta Claude AI con accesso al database
      const aiResponse = await generateAIResponse(inputMessage, protocols);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        protocols: protocols,
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Errore nella chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Mi dispiace, ho riscontrato un errore. Riprova tra poco.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (query: string, protocols: any[]) => {
    // Qui integreremo Claude AI con window.claude.complete
    // Per ora simuliamo una risposta intelligente
    
    const responses = {
      content: "",
      suggestions: [] as string[]
    };

    if (query.toLowerCase().includes('tosse')) {
      responses.content = `Per la tosse, consiglio il **Protocollo B - CDS** che è specifico per problemi respiratori. 

**Dosaggio suggerito:**
- 5 gocce attivate in 200ml di acqua
- 2 volte al giorno
- Lontano dai pasti

Il CDS ha proprietà antimicrobiche che possono aiutare con infezioni respiratorie che causano tosse.`;
      responses.suggestions = ['Controindicazioni del CDS', 'Altri protocolli respiratori', 'Come attivare il CDS'];
    } else if (query.toLowerCase().includes('digestivo') || query.toLowerCase().includes('stomaco')) {
      responses.content = `Per problemi digestivi, il **Protocollo A - CDS** è la scelta migliore.

**Indicazioni:**
- Gastrite, acidità, disturbi intestinali
- 3 gocce attivate in 100ml acqua
- 3 volte al giorno a stomaco vuoto

**Importante:** Attendere 2 ore tra le dosi e non assumere insieme a vitamina C.`;
      responses.suggestions = ['Precauzioni per uso CDS', 'Protocolli detox', 'Alternative per problemi digestivi'];
    } else if (query.toLowerCase().includes('blu di metilene')) {
      responses.content = `Il **Blu di Metilene** è ottimo per:

**Funzioni cognitive:**
- Protocollo C: 1 goccia per 10kg di peso corporeo
- In 250ml di acqua, 1 volta al giorno
- Supporta memoria e concentrazione

**Nota:** Può colorare le urine di blu per 24-48 ore, è normale.`;
      responses.suggestions = ['Dosaggi Blu di Metilene', 'Controindicazioni', 'Protocolli combinati'];
    } else {
      responses.content = `Ho trovato ${protocols.length} protocolli correlati alla tua richiesta. Puoi essere più specifico sui sintomi che vuoi trattare?

I nostri protocolli coprono: digestivo, respiratorio, neurologico, dermatologico, cardiovascolare e altro.`;
      responses.suggestions = ['Mostra tutti i protocolli', 'Cerca per sintomo specifico', 'Differenze CDS vs Blu di Metilene'];
    }

    return responses;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-md transition-all duration-300 ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Torna alla Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Assistente AI
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className={`rounded-2xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          
          {/* Messages Area */}
          <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' 
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                  
                  {/* Message Content */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : darkMode 
                        ? 'bg-gray-700 text-gray-100' 
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                    
                    {/* Protocolli correlati */}
                    {message.protocols && message.protocols.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                        <div className="text-xs font-semibold mb-2">Protocolli correlati:</div>
                        <div className="space-y-1">
                          {message.protocols.map((protocol, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs">
                              <FileText className="w-3 h-3" />
                              <span>{protocol.name}</span>
                              <span className="text-gray-500">({protocol.substance})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs opacity-70 mt-2">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex">
                  <div className="mr-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span className="text-sm text-gray-600">Sto pensando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggestions */}
          {messages.length > 0 && messages[messages.length - 1].suggestions && (
            <div className={`px-6 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-xs font-semibold mb-2 text-gray-600">Suggerimenti:</div>
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-3 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Area */}
          <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Scrivi la tua domanda su CDS o Blu di Metilene..."
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Invia</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Search className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold">Ricerca Intelligente</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cerca tra oltre 150 protocolli per trovare la soluzione giusta
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold">AI Personalizzata</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Suggerimenti basati sui tuoi sintomi e condizioni specifiche
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Sempre Aggiornato</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Database costantemente aggiornato con nuove ricerche
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;