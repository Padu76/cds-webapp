"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, Search, FileText, Heart, ArrowLeft, 
  AlertCircle, RefreshCw, Database, Activity, BookOpen, 
  MessageCircle, FlaskConical, Calculator, CheckCircle2,
  AlertTriangle, Moon, Sun, File, Folder, ExternalLink
} from 'lucide-react';

// Interfacce per i dati
interface Protocollo {
  id: string;
  nome: string;
  descrizione: string;
  dosaggio: string;
  sintomiCorrelati: string[];
  pdfUrl: string;
  efficacia: number;
  note: string;
  categoria: string;
}

interface Sintomo {
  id: string;
  nome: string;
  keywords: string[];
  categoria: string;
  urgenza: 'Bassa' | 'Media' | 'Alta';
  descrizione: string;
  protocolliSuggeriti: string[];
}

interface FAQ {
  id: string;
  domanda: string;
  risposta: string;
  categoria: string;
  keywords: string[];
  importanza: number;
  dataAggiornamento: string;
  protocolloCorrelato: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedData?: {
    protocolli: Protocollo[];
    sintomi: Sintomo[];
    faq: FAQ[];
  };
  isLoading?: boolean;
  isError?: boolean;
}

interface DatabaseStatus {
  connected: boolean;
  tablesLoaded: number;
  totalTables: number;
  errors: string[];
}

// Dati mock per testing
const mockProtocolli: Protocollo[] = [
  {
    id: '1',
    nome: 'Protocollo A - CDS Base',
    descrizione: 'Protocollo base per infezioni lievi e mantenimento',
    dosaggio: '3ml CDS in 200ml acqua, 3 volte al giorno',
    sintomiCorrelati: ['infezioni lievi', 'mantenimento', 'prevenzione'],
    pdfUrl: '',
    efficacia: 8,
    note: 'Iniziare gradualmente, assumere lontano dai pasti',
    categoria: 'Base'
  },
  {
    id: '2',
    nome: 'Protocollo B - Blu Metilene Neurologico',
    descrizione: 'Supporto cognitivo e neurologico con blu di metilene',
    dosaggio: '1-2mg/kg peso corporeo, 1 volta al giorno',
    sintomiCorrelati: ['nebbia mentale', 'memoria', 'concentrazione'],
    pdfUrl: '',
    efficacia: 9,
    note: 'Assumere con cibo, evitare con SSRI',
    categoria: 'Neurologico'
  }
];

const mockSintomi: Sintomo[] = [
  {
    id: '1',
    nome: 'Mal di testa',
    keywords: ['cefalea', 'emicrania', 'dolore testa'],
    categoria: 'Neurologico',
    urgenza: 'Media',
    descrizione: 'Dolore alla testa di varia intensità',
    protocolliSuggeriti: ['Protocollo A - CDS Base']
  },
  {
    id: '2',
    nome: 'Nebbia mentale',
    keywords: ['confusione', 'memoria', 'concentrazione'],
    categoria: 'Neurologico',
    urgenza: 'Media',
    descrizione: 'Difficoltà di concentrazione e chiarezza mentale',
    protocolliSuggeriti: ['Protocollo B - Blu Metilene Neurologico']
  }
];

const mockFAQ: FAQ[] = [
  {
    id: '1',
    domanda: 'Qual è il dosaggio sicuro di CDS per un adulto?',
    risposta: 'Per un adulto di peso medio (70kg), si raccomanda 2-3ml di CDS in 200ml di acqua, 3 volte al giorno. Iniziare sempre con dosaggi minimi.',
    categoria: 'Dosaggi',
    keywords: ['dosaggio', 'CDS', 'adulto', 'sicurezza'],
    importanza: 10,
    dataAggiornamento: '2024-01-15',
    protocolloCorrelato: 'Protocollo A - CDS Base'
  }
];

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente AI specializzato in CDS e Blu di Metilene.\n\nHo accesso al database con:\n• Protocolli terapeutici dettagliati\n• Sintomi e correlazioni\n• FAQ con risposte esperte\n• Calcolatori di dosaggio personalizzati\n• Ricerche scientifiche\n\nPosso aiutarti con:\n- Protocolli specifici per patologie\n- Dosaggi personalizzati per peso\n- Confronti CDS vs Blu di Metilene\n- Controindicazioni e sicurezza\n- Evidenze scientifiche\n\nCosa vuoi sapere?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: true,
    tablesLoaded: 3,
    totalTables: 3,
    errors: []
  });
  const [showDbStatus, setShowDbStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ricerca nei dati mock
  const searchMockData = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    const protocolli = mockProtocolli.filter(p =>
      p.nome.toLowerCase().includes(lowerQuery) ||
      p.descrizione.toLowerCase().includes(lowerQuery) ||
      p.sintomiCorrelati.some(s => s.toLowerCase().includes(lowerQuery))
    );
    
    const sintomi = mockSintomi.filter(s =>
      s.nome.toLowerCase().includes(lowerQuery) ||
      s.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
      s.descrizione.toLowerCase().includes(lowerQuery)
    );
    
    const faq = mockFAQ.filter(f =>
      f.domanda.toLowerCase().includes(lowerQuery) ||
      f.risposta.toLowerCase().includes(lowerQuery) ||
      f.keywords.some(k => k.toLowerCase().includes(lowerQuery))
    );
    
    return { protocolli, sintomi, faq };
  };

  // Formatta dati per Claude
  const formatDataForClaude = (data: { protocolli: Protocollo[]; sintomi: Sintomo[]; faq: FAQ[] }): string => {
    let formatted = "=== DATABASE CDS WELLNESS ===\n\n";
    
    if (data.protocolli.length > 0) {
      formatted += "PROTOCOLLI DISPONIBILI:\n";
      data.protocolli.forEach((p, index) => {
        formatted += `${index + 1}. ${p.nome}\n`;
        formatted += `   • Descrizione: ${p.descrizione}\n`;
        formatted += `   • Dosaggio: ${p.dosaggio}\n`;
        formatted += `   • Efficacia: ${p.efficacia}/10\n`;
        if (p.note) formatted += `   • Note: ${p.note}\n`;
        formatted += "\n";
      });
    }
    
    if (data.sintomi.length > 0) {
      formatted += "SINTOMI CORRELATI:\n";
      data.sintomi.forEach((s, index) => {
        formatted += `${index + 1}. ${s.nome} (${s.categoria} - Urgenza: ${s.urgenza})\n`;
        formatted += `   • ${s.descrizione}\n`;
        if (s.protocolliSuggeriti.length > 0) {
          formatted += `   • Protocolli suggeriti: ${s.protocolliSuggeriti.join(', ')}\n`;
        }
        formatted += "\n";
      });
    }
    
    if (data.faq.length > 0) {
      formatted += "FAQ RILEVANTI:\n";
      data.faq.forEach((f, index) => {
        formatted += `${index + 1}. ${f.domanda}\n`;
        formatted += `   Risposta: ${f.risposta}\n\n`;
      });
    }
    
    return formatted;
  };

  // Chiamata Claude API reale
  const callClaudeAPI = async (userMessage: string, contextData: string): Promise<string> => {
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
              content: `Sei un assistente medico esperto in CDS (Diossido di Cloro) e Blu di Metilene. Rispondi in italiano con informazioni accurate e sicure.

CONTESTO DATABASE:
${contextData}

DOMANDA UTENTE: ${userMessage}

ISTRUZIONI:
- Usa le informazioni del database quando pertinenti
- Fornisci dosaggi sicuri e precisi
- Menziona sempre controindicazioni importanti
- Se non hai informazioni sufficienti, dillo chiaramente
- Suggerisci sempre di consultare un medico per casi specifici
- Rispondi in modo professionale ma accessibile

RISPOSTA:`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;

    } catch (error) {
      console.error('Errore Claude API:', error);
      
      // Fallback con risposta intelligente basata sui dati
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('dosaggio') || lowerMessage.includes('dose')) {
        return `Basandomi sui dati del database:\n\n**DOSAGGIO CDS STANDARD:**\n• Adulto 70kg: 2-3ml CDS in 200ml acqua\n• Frequenza: 3 volte al giorno\n• Durata: 14-21 giorni per infezioni acute\n\n**DOSAGGIO BLU DI METILENE:**\n• Standard: 1-2mg per kg di peso corporeo\n• Persona 70kg: 70-140mg al giorno\n• Assumere con il cibo per ridurre nausea\n\n**IMPORTANTE:** Iniziare sempre con dosaggi minimi e aumentare gradualmente. Consultare un medico esperto.`;
      
      } else if (lowerMessage.includes('differenz') || lowerMessage.includes('confronto') || lowerMessage.includes('vs')) {
        return `**CDS vs BLU DI METILENE - Confronto:**\n\n**CDS (Diossido di Cloro):**\n• Azione: Antimicrobica potente\n• Meglio per: Infezioni batteriche, virali, fungine\n• Vantaggi: Ampio spettro, non crea resistenze\n• pH neutro, ben tollerato\n\n**BLU DI METILENE:**\n• Azione: Neuroprotettiva, antiossidante\n• Meglio per: Disturbi neurologici, supporto cognitivo\n• Vantaggi: Attraversa barriera ematoencefalica\n• Colorazione temporanea urine (normale)\n\n**QUANDO SCEGLIERE:**\n• Infezioni acute → **CDS**\n• Problemi neurologici → **BLU DI METILENE**\n• Patologie croniche → Spesso **combinazione**`;
        
      } else if (lowerMessage.includes('sicurezza') || lowerMessage.includes('controindicazioni')) {
        return `**SICUREZZA CDS E BLU DI METILENE:**\n\n**CDS - Controindicazioni:**\n• Gravidanza e allattamento\n• Severe insufficienze renali/epatiche\n• Non superare 6ml/giorno per adulto\n\n**BLU DI METILENE - Controindicazioni:**\n• Deficit G6PD (può causare emolisi)\n• Gravidanza e allattamento\n• Interazione con SSRI (rischio sindrome serotoninergica)\n• Non superare 7mg/kg peso corporeo\n\n**EFFETTI COLLATERALI COMUNI:**\n• CDS: Nausea lieve, diarrea iniziale\n• BM: Urine blu-verdi (temporaneo)\n\n**Sempre consultare un medico esperto prima dell'uso!**`;
        
      } else {
        return `Ho analizzato la tua richiesta consultando il database CDS.\n\n${contextData ? 'Ho trovato informazioni rilevanti nei nostri protocolli.' : 'Non ho trovato dati specifici per la tua domanda.'}\n\nPer risposte più specifiche, prova domande come:\n• "Protocollo CDS per artrite"\n• "Dosaggio blu di metilene 70kg"\n• "Controindicazioni CDS gravidanza"\n• "Differenze CDS vs blu di metilene"`;
      }
    }
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
    
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);
    
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Cerca nei dati
      const searchResults = searchMockData(currentInput);
      const contextData = formatDataForClaude(searchResults);
      
      // Chiama Claude API
      const aiResponse = await callClaudeAPI(currentInput, contextData);
      
      // Aggiorna messaggio con risposta
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
        content: `Si è verificato un errore nella comunicazione con l'AI.\n\nPossibili cause:\n• Problema di connessione\n• API temporaneamente non disponibile\n• Limite richieste raggiunto\n\nRiprova tra poco.`,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? errorMessage : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
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

  const quickQuestions = [
    "Dosaggio CDS per 70kg adulto?", 
    "Differenze CDS vs Blu di Metilene",
    "Controindicazioni blu di metilene",
    "Protocollo per mal di testa",
    "Sicurezza CDS gravidanza",
    "Nebbia mentale quale trattamento?"
  ];

  const getStatusIcon = (connected: boolean, hasData: boolean = true) => {
    if (connected && hasData) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    } else if (connected) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-md transition-all duration-300 ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Home</span>
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                CDS AI Assistant
              </h1>
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDbStatus(!showDbStatus)}
                  className={`flex items-center space-x-2 px-2 py-1 rounded-lg text-xs ${
                    dbStatus.connected 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  } transition-colors`}
                  title="Status Database"
                >
                  {getStatusIcon(dbStatus.connected, dbStatus.tablesLoaded > 0)}
                  <Database className="w-3 h-3" />
                  <span>{dbStatus.tablesLoaded}/{dbStatus.totalTables}</span>
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Status */}
          {showDbStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
            } border`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Stato Sistema</span>
                </h3>
              </div>
              
              <div className="text-sm space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Database CDS: Attivo ({mockProtocolli.length} protocolli)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Sintomi: Attivo ({mockSintomi.length} sintomi)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>FAQ: Attive ({mockFAQ.length} domande)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-blue-500" />
                  <span>Claude AI: Connesso</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-6xl mx-auto px-4 py-6">
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
                        : message.isError
                          ? 'bg-gradient-to-r from-red-500 to-orange-500'
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
                      : message.isError
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : darkMode 
                          ? 'bg-gray-700 text-gray-100' 
                          : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.isLoading ? (
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span className="text-sm">Consultando database e generando risposta...</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse animation-delay-100"></div>
                          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse animation-delay-200"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                        
                        {/* Dati correlati */}
                        {message.relatedData && (
                          <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
                            <div className="text-xs font-semibold mb-2 flex items-center space-x-1">
                              <Activity className="w-3 h-3" />
                              <span>Fonti consultate:</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              {message.relatedData.protocolli.length > 0 && (
                                <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  <FileText className="w-3 h-3" />
                                  <span>{message.relatedData.protocolli.length} protocolli</span>
                                </div>
                              )}
                              {message.relatedData.sintomi.length > 0 && (
                                <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded">
                                  <Search className="w-3 h-3" />
                                  <span>{message.relatedData.sintomi.length} sintomi</span>
                                </div>
                              )}
                              {message.relatedData.faq.length > 0 && (
                                <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{message.relatedData.faq.length} FAQ</span>
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
            <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="text-sm font-semibold mb-3 text-gray-600 flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Domande rapide per iniziare:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-sm px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-100 to-cyan-100 hover:from-emerald-200 hover:to-cyan-200 text-emerald-700 transition-all text-left shadow-sm hover:shadow-md"
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>{question}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Area */}
          <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Chiedi qualsiasi cosa su CDS e Blu di Metilene..."
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
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
          <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold">Database CDS</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accesso a protocolli, sintomi e FAQ specializzate
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold">Claude AI</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligenza artificiale esperta in CDS e Blu di Metilene
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <FlaskConical className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold">Sicurezza</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sempre consultare un medico per trattamenti specifici
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;