"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Search, FileText, Heart, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { searchAllData, formatDataForAI, getCachedProtocolli, getCachedSintomi, getCachedDocumentazione } from '@/lib/airtable';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedData?: {
    protocolli?: any[];
    sintomi?: any[];
    documentazione?: any[];
  };
  isLoading?: boolean;
}

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente AI per CDS e Blu di Metilene. Ho accesso a tutti i protocolli, sintomi e documentazione del tuo database. Puoi chiedermi qualsiasi cosa sui trattamenti, dosaggi, controindicazioni o protocolli specifici. Come posso aiutarti?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verifica se i dati sono disponibili all'avvio
  useEffect(() => {
    const checkDataAvailability = async () => {
      try {
        await getCachedProtocolli();
        setDataLoaded(true);
      } catch (err) {
        setError('Impossibile caricare i dati dal database. Verifica la connessione ad Airtable.');
      }
    };
    checkDataAvailability();
  }, []);

  // Funzione per chiamare Claude AI
  const callClaudeAI = async (userMessage: string, contextData: string): Promise<string> => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Sei un assistente esperto in CDS (Diossido di Cloro) e Blu di Metilene. Hai accesso al seguente database di protocolli, sintomi e documentazione:

${contextData}

ISTRUZIONI:
- Rispondi sempre in italiano
- Usa i dati del database per dare risposte precise e dettagliate
- Se suggerisci un protocollo, includi sempre dosaggio e note di sicurezza
- Specifica se consigliare CDS o Blu di Metilene basandoti sui dati
- Se non trovi informazioni specifiche nel database, dillo chiaramente
- Mantieni un tono professionale ma amichevole
- Include sempre avvertenze di sicurezza appropriate

DOMANDA DELL'UTENTE: ${userMessage}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Errore nella chiamata a Claude:', error);
      throw new Error('Impossibile ottenere una risposta dall\'AI. Riprova tra poco.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!dataLoaded) {
      setError('I dati non sono ancora disponibili. Attendi il caricamento.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    // Aggiungi messaggio utente
    setMessages(prev => [...prev, userMessage]);
    
    // Crea messaggio AI con loading
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Cerca dati correlati nel database
      const searchResults = await searchAllData(inputMessage);
      
      // Formatta i dati per l'AI
      const contextData = formatDataForAI(searchResults);
      
      // Chiama Claude AI
      const aiResponse = await callClaudeAI(inputMessage, contextData);
      
      // Aggiorna il messaggio con la risposta
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        relatedData: searchResults
      };

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? assistantMessage : msg
      ));
      
    } catch (error) {
      console.error('Errore nella chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Mi dispiace, ho riscontrato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}. Riprova tra poco.`,
        timestamp: new Date()
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? errorMessage : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setInputMessage(question);
    // Simula un breve delay per mostrare che il messaggio è stato impostato
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const retryDataLoad = async () => {
    setError(null);
    try {
      await getCachedProtocolli();
      setDataLoaded(true);
    } catch (err) {
      setError('Impossibile caricare i dati dal database. Verifica la connessione ad Airtable.');
    }
  };

  const quickQuestions = [
    "Quali protocolli hai per l'infiammazione?",
    "Differenze tra CDS e Blu di Metilene",
    "Dosaggio CDS per 70kg",
    "Protocolli per problemi digestivi",
    "Controindicazioni Blu di Metilene",
    "Come preparare il CDS?"
  ];

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
              <div className={`w-2 h-2 rounded-full ${dataLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={retryDataLoad}
              className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Riprova</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className={`rounded-2xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          
          {/* Messages Area */}
          <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
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
                    {message.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span className="text-sm text-gray-600">Claude sta analizzando i dati...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                        
                        {/* Dati correlati */}
                        {message.relatedData && (
                          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                            <div className="text-xs font-semibold mb-2">Dati consultati:</div>
                            <div className="space-y-1 text-xs">
                              {message.relatedData.protocolli && message.relatedData.protocolli.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <FileText className="w-3 h-3" />
                                  <span>{message.relatedData.protocolli.length} protocolli</span>
                                </div>
                              )}
                              {message.relatedData.sintomi && message.relatedData.sintomi.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Search className="w-3 h-3" />
                                  <span>{message.relatedData.sintomi.length} sintomi</span>
                                </div>
                              )}
                              {message.relatedData.documentazione && message.relatedData.documentazione.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{message.relatedData.documentazione.length} documenti</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="text-xs opacity-70 mt-2">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className={`px-6 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-xs font-semibold mb-2 text-gray-600">Domande rapide:</div>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs px-3 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors text-left"
                    disabled={isLoading || !dataLoaded}
                  >
                    {question}
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
                  placeholder={dataLoaded ? "Chiedi qualsiasi cosa sui protocolli CDS e Blu di Metilene..." : "Caricamento dati in corso..."}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading || !dataLoaded}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || !dataLoaded}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">
                  {isLoading ? 'Invio...' : 'Invia'}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Search className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold">Database Completo</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accesso diretto ai tuoi protocolli, sintomi e documentazione
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold">Claude AI</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligenza artificiale avanzata con conoscenza specifica CDS
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Risposte Precise</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dosaggi, controindicazioni e protocolli basati sui tuoi dati
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;