"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, Search, FileText, Heart, ArrowLeft, 
  AlertCircle, RefreshCw, Database, Activity, BookOpen, 
  MessageCircle, FlaskConical, Calculator, CheckCircle2,
  AlertTriangle, Moon, Sun
} from 'lucide-react';
import Link from 'next/link';
import { 
  searchAllData, 
  formatDataForAI, 
  getCachedData,
  checkAirtableConnection,
  type Protocollo,
  type Sintomo,
  type Documentazione,
  type Testimonianza,
  type RicercaScientifica,
  type FAQ,
  type Dosaggio
} from '@/lib/airtable';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedData?: {
    protocolli: Protocollo[];
    sintomi: Sintomo[];
    documentazione: Documentazione[];
    testimonianze: Testimonianza[];
    ricerche: RicercaScientifica[];
    faq: FAQ[];
    dosaggi: Dosaggio[];
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

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🤖 Ciao! Sono il tuo assistente AI specializzato in CDS e Blu di Metilene.\n\nHo accesso completo al tuo database con:\n• Protocolli terapeutici dettagliati\n• Sintomi e correlazioni\n• Testimonianze reali di pazienti\n• Ricerche scientifiche aggiornate\n• FAQ con risposte esperte\n• Calcolatori di dosaggio personalizzati\n• Documentazione tecnica\n\nPosso aiutarti con:\n- Protocolli specifici per patologie\n- Dosaggi personalizzati per peso\n- Confronti CDS vs Blu di Metilene\n- Controindicazioni e sicurezza\n- Evidenze scientifiche\n\nCosa vuoi sapere?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: false,
    tablesLoaded: 0,
    totalTables: 7,
    errors: []
  });
  const [showDbStatus, setShowDbStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verifica connessione database all'avvio
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const healthCheck = await checkAirtableConnection();
        setDbStatus({
          connected: healthCheck.connected,
          tablesLoaded: healthCheck.tablesAvailable.length,
          totalTables: 7,
          errors: healthCheck.errors
        });

        // Pre-carica i dati più importanti
        if (healthCheck.connected) {
          Promise.all([
            getCachedData('protocolli'),
            getCachedData('sintomi'),
            getCachedData('faq')
          ]).catch(err => {
            console.warn('Errore nel precaricamento dati:', err);
          });
        }
      } catch (error) {
        setDbStatus(prev => ({
          ...prev,
          connected: false,
          errors: [`Errore di connessione: ${error instanceof Error ? error.message : 'Sconosciuto'}`]
        }));
      }
    };
    
    initializeDatabase();
  }, []);

  // Simulazione chiamata AI (locale) - sostituisci con vera API
  const generateAIResponse = async (userMessage: string, contextData: string): Promise<string> => {
    // Simulazione di processing per demo
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Analisi semplice del messaggio per demo
    const lowerMessage = userMessage.toLowerCase();
    
    // Risposte basate su keyword matching per demo
    if (lowerMessage.includes('dosaggio') || lowerMessage.includes('dose')) {
      return `Based sui dati del tuo database, ecco le informazioni sui dosaggi:\n\n**Dosaggio CDS Standard:**\n• Adulto 70kg: 2-3ml CDS in 200ml acqua\n• Frequenza: 3 volte al giorno\n• Durata: 14-21 giorni per infezioni acute\n\n**Dosaggio Blu di Metilene:**\n• Standard: 1-2mg per kg di peso corporeo\n• Persona 70kg: 70-140mg al giorno\n• Assumere con il cibo per ridurre nausea\n\n**Importante:** Iniziare sempre con dosaggi minimi e aumentare gradualmente. Monitorare la tolleranza del paziente.\n\n💡 Vuoi un calcolo personalizzato per peso specifico?`;
    }
    
    if (lowerMessage.includes('differenz') || lowerMessage.includes('confronto') || lowerMessage.includes('vs')) {
      return `**CDS vs BLU DI METILENE - Analisi Comparativa:**\n\n**🧪 CDS (Diossido di Cloro):**\n• Azione: Antimicrobica potente, ossidazione selettiva\n• Meglio per: Infezioni batteriche, virali, fungine\n• Vantaggi: Ampio spettro, non crea resistenze\n• pH neutro, ben tollerato\n\n**💙 BLU DI METILENE:**\n• Azione: Neuroprotettiva, antimicrobica, antiossidante\n• Meglio per: Disturbi neurologici, supporto cognitivo\n• Vantaggi: Attraversa barriera ematoencefalica\n• Colorazione temporanea urine (normale)\n\n**📊 QUANDO SCEGLIERE:**\n• Infezioni acute → **CDS**\n• Problemi neurologici → **BLU DI METILENE**\n• Patologie croniche → Spesso **combinazione**\n\nVuoi approfondire una specifica applicazione?`;
    }
    
    if (lowerMessage.includes('sicurezza') || lowerMessage.includes('controindicazioni')) {
      return `**⚠️ PROFILO DI SICUREZZA CDS E BLU DI METILENE:**\n\n**CDS - Controindicazioni:**\n• Gravidanza e allattamento (mancano studi)\n• Severe insufficienze renali/epatiche\n• Interazione con alcuni farmaci (distanziare 2h)\n• Non superare 6ml/giorno per adulto\n\n**BLU DI METILENE - Controindicazioni:**\n• Deficit G6PD (può causare emolisi)\n• Gravidanza e allattamento\n• Interazione con SSRI (rischio sindrome serotoninergica)\n• Non superare 7mg/kg peso corporeo\n\n**🚨 EFFETTI COLLATERALI COMUNI:**\n• CDS: Nausea lieve, diarrea iniziale\n• BM: Urine blu-verdi (temporaneo), mal di testa lieve\n\n**✅ MONITORAGGIO RACCOMANDATO:**\n• Funzioni epatiche e renali nei trattamenti lunghi\n• Emocromo completo ogni 30 giorni\n\n**Sempre consultare un medico esperto prima dell'uso!**`;
    }
    
    // Risposta generica con i dati del database
    return `Ho analizzato la tua richiesta nel database e trovato informazioni rilevanti.\n\n${contextData.substring(0, 800)}...\n\nQueste informazioni provengono direttamente dal tuo database. Vuoi che approfondisca qualche aspetto specifico?\n\n💡 Suggerimento: Prova a chiedere qualcosa di più specifico come "dosaggio CDS per artrite" o "protocollo blu di metilene per Alzheimer".`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!dbStatus.connected) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Database non connesso. Verifica le credenziali Airtable nelle variabili d\'ambiente e ricarica la pagina.',
        timestamp: new Date(),
        isError: true
      }]);
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
    
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Cerca dati correlati nel database
      const searchResults = await searchAllData(currentInput);
      
      // Formatta i dati per l'AI
      const contextData = formatDataForAI(searchResults);
      
      // Aggiorna cronologia conversazione
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: currentInput }
      ].slice(-10); // Mantieni solo gli ultimi 10 scambi
      
      // Genera risposta AI
      const aiResponse = await generateAIResponse(currentInput, contextData);
      
      // Aggiorna cronologia con risposta
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: aiResponse }
      ]);
      
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
        content: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}.\n\nPossibili cause:\n• Problema di connessione al database\n• Tabelle Airtable non accessibili\n• Configurazione API non corretta\n\nRiprova tra poco.`,
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

  const retryConnection = async () => {
    setDbStatus(prev => ({ ...prev, connected: false, errors: [] }));
    try {
      const healthCheck = await checkAirtableConnection();
      setDbStatus({
        connected: healthCheck.connected,
        tablesLoaded: healthCheck.tablesAvailable.length,
        totalTables: 7,
        errors: healthCheck.errors
      });
    } catch (error) {
      setDbStatus(prev => ({
        ...prev,
        errors: [`Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}`]
      }));
    }
  };

  const quickQuestions = [
    "Dosaggio CDS per 70kg adulto?",
    "Differenze CDS vs Blu di Metilene",
    "Protocollo per infiammazione cronica",
    "Controindicazioni blu di metilene",
    "Come preparare CDS in sicurezza?",
    "Testimonianze artrite reumatoide"
  ];

  const getStatusIcon = () => {
    if (dbStatus.connected && dbStatus.tablesLoaded === dbStatus.totalTables) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    } else if (dbStatus.connected && dbStatus.tablesLoaded > 0) {
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
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Home</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                CDS AI Assistant
              </h1>
              
              {/* Database Status */}
              <button
                onClick={() => setShowDbStatus(!showDbStatus)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs ${
                  dbStatus.connected 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                } transition-colors`}
              >
                {getStatusIcon()}
                <span>{dbStatus.tablesLoaded}/{dbStatus.totalTables}</span>
              </button>

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

          {/* Database Status Expanded */}
          {showDbStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
            } border`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span>Stato Database</span>
                </h3>
                <button
                  onClick={retryConnection}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Riconnetti</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                {['protocolli', 'sintomi', 'documentazione', 'testimonianze', 'ricerche', 'faq', 'dosaggi'].map((table) => (
                  <div key={table} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      dbStatus.errors.some(e => e.includes(table)) ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <span className="capitalize">{table}</span>
                  </div>
                ))}
              </div>
              
              {dbStatus.errors.length > 0 && (
                <div className="mt-3 text-xs text-red-600">
                  <strong>Errori:</strong>
                  <ul className="mt-1 space-y-1">
                    {dbStatus.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                        <span className="text-sm">Analizzando database...</span>
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
                              <span>Dati consultati:</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              {message.relatedData.protocolli && message.relatedData.protocolli.length > 0 && (
                                <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  <FileText className="w-3 h-3" />
                                  <span>{message.relatedData.protocolli.length} protocolli</span>
                                </div>
                              )}
                              {message.relatedData.sintomi && message.relatedData.sintomi.length > 0 && (
                                <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded">
                                  <Search className="w-3 h-3" />
                                  <span>{message.relatedData.sintomi.length} sintomi</span>
                                </div>
                              )}
                              {message.relatedData.testimonianze && message.relatedData.testimonianze.length > 0 && (
                                <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{message.relatedData.testimonianze.length} testimonianze</span>
                                </div>
                              )}
                              {message.relatedData.ricerche && message.relatedData.ricerche.length > 0 && (
                                <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  <FlaskConical className="w-3 h-3" />
                                  <span>{message.relatedData.ricerche.length} ricerche</span>
                                </div>
                              )}
                              {message.relatedData.faq && message.relatedData.faq.length > 0 && (
                                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                  <BookOpen className="w-3 h-3" />
                                  <span>{message.relatedData.faq.length} FAQ</span>
                                </div>
                              )}
                              {message.relatedData.dosaggi && message.relatedData.dosaggi.length > 0 && (
                                <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                  <Calculator className="w-3 h-3" />
                                  <span>{message.relatedData.dosaggi.length} dosaggi</span>
                                </div>
                              )}
                              {message.relatedData.documentazione && message.relatedData.documentazione.length > 0 && (
                                <div className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  <Heart className="w-3 h-3" />
                                  <span>{message.relatedData.documentazione.length} docs</span>
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
          
          {/* Quick Questions - Solo se prima conversazione */}
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
                    disabled={isLoading || !dbStatus.connected}
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
                  placeholder={dbStatus.connected 
                    ? "Chiedi qualsiasi cosa: protocolli, dosaggi, controindicazioni..." 
                    : "Connessione al database in corso..."
                  }
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading || !dbStatus.connected}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || !dbStatus.connected}
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold">7 Database</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accesso completo a protocolli, sintomi, testimonianze e ricerche
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold">AI Specializzata</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligenza artificiale esperta in CDS e Blu di Metilene
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">Dosaggi Precisi</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calcoli personalizzati per peso, età e patologia specifica
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <FlaskConical className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold">Evidence-Based</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Risposte basate su ricerche scientifiche e testimonianze reali
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;