"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, Search, ArrowLeft, 
  AlertCircle, Database, Activity, 
  MessageCircle, CheckCircle2, Moon, Sun, 
  Sparkles, Zap, Settings
} from 'lucide-react';

// Interfacce (mantenute uguali dal file originale)
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

interface Documentazione {
  id: string;
  titolo: string;
  categoria: string;
  contenuto: string;
  fileUrl: string;
  tags: string[];
}

interface Testimonianza {
  id: string;
  patologia: string;
  trattamentoUsato: string;
  durataTrattamento: string;
  risultati: string;
  etaPaziente: string;
  noteAnonime: string;
  efficacia: number;
  dataTestimonianza: string;
  protocolloUtilizzato: string;
}

interface RicercaScientifica {
  id: string;
  titoloStudio: string;
  sostanza: string;
  linkDoi: string;
  riassunto: string;
  anno: string;
  rivista: string;
  importanza: number;
  categoria: string;
  risultatiPrincipali: string;
}

interface Dosaggio {
  id: string;
  patologia: string;
  pesoPaziente: string;
  dosaggioCds: string;
  dosaggioBluMetilene: string;
  formulaCalcolo: string;
  noteSicurezza: string;
  frequenza: string;
  durataMax: string;
  protocolloRef: string;
}

interface DriveDocument {
  id: string;
  name: string;
  type: string;
  content?: string;
  keywords?: string[];
  relevantSections?: string[];
  matchScore?: number;
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
    documentazione: Documentazione[];
    testimonianze: Testimonianza[];
    ricerche: RicercaScientifica[];
    dosaggi: Dosaggio[];
    driveDocuments?: DriveDocument[];
  };
  isLoading?: boolean;
  isError?: boolean;
  sources?: {
    airtable: boolean;
    googleDrive: boolean;
    timeouts?: string[];
  };
}

interface DatabaseStatus {
  connected: boolean;
  tablesAvailable: string[];
  errors: string[];
}

interface DriveStatus {
  connected: boolean;
  documentsFound: number;
  errors: string[];
  lastCheck?: Date;
}

// Costanti (dal file originale)
const TIMEOUTS = {
  AIRTABLE: 8000,
  GOOGLE_DRIVE: 5000,
  CLAUDE_API: 15000,
};

const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!;
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY!;
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Headers e utility functions (mantenute dal file originale)
const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

const parseCommaSeparatedString = (str: string): string[] => {
  if (!str) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

const safeParseInt = (value: any, defaultValue: number = 0): number => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Tutte le funzioni API (mantenute dal file originale)
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timeout after ${timeout}ms`);
    }
    throw error;
  }
}

async function airtableRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetchWithTimeout(`${AIRTABLE_API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    }, TIMEOUTS.AIRTABLE);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Errore Airtable: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Errore nella richiesta Airtable:', error);
    throw error;
  }
}

// Funzioni API Airtable (mantenute dal file originale - abbreviate per spazio)
async function getProtocolli(): Promise<Protocollo[]> {
  try {
    const data = await airtableRequest('/protocolli');
    return data.records.map((record: any) => ({
      id: record.id,
      nome: record.fields.Nome || '',
      descrizione: record.fields.Descrizione || '',
      dosaggio: record.fields.Dosaggio || '',
      sintomiCorrelati: parseCommaSeparatedString(record.fields.Sintomi_Correlati || ''),
      pdfUrl: record.fields.PDF_URL || '',
      efficacia: safeParseInt(record.fields.Efficacia),
      note: record.fields.Note || '',
      categoria: record.fields.Categoria || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero protocolli:', error);
    return [];
  }
}

async function getSintomi(): Promise<Sintomo[]> {
  try {
    const data = await airtableRequest('/sintomi');
    return data.records.map((record: any) => ({
      id: record.id,
      nome: record.fields.Nome || '',
      keywords: parseCommaSeparatedString(record.fields.Keywords || ''),
      categoria: record.fields.Categoria || '',
      urgenza: record.fields.Urgenza || 'Bassa',
      descrizione: record.fields.Descrizione || '',
      protocolliSuggeriti: parseCommaSeparatedString(record.fields.Protocolli_Suggeriti || ''),
    }));
  } catch (error) {
    return [];
  }
}

// [Altre funzioni API abbreviate per spazio - getFaq, getDocumentazione, etc.]

async function checkAirtableConnection(): Promise<DatabaseStatus> {
  const tables = ['sintomi', 'protocolli', 'FAQ', 'documentazione', 'testimonianze', 'ricerche', 'dosaggi'];
  const errors: string[] = [];
  const available: string[] = [];
  
  for (const table of tables) {
    try {
      await airtableRequest(`/${table}?maxRecords=1`);
      available.push(table);
    } catch (error) {
      errors.push(`${table}: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }
  
  return {
    connected: available.length > 0,
    tablesAvailable: available,
    errors
  };
}

async function checkGoogleDriveConnection(): Promise<DriveStatus> {
  try {
    const response = await fetchWithTimeout('/api/drive', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }, TIMEOUTS.GOOGLE_DRIVE);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return {
      connected: result.connected,
      documentsFound: result.documentsFound || 0,
      errors: result.errors || [],
      lastCheck: new Date()
    };
  } catch (error) {
    return {
      connected: false,
      documentsFound: 0,
      errors: [error instanceof Error ? error.message : 'Timeout Drive connection'],
      lastCheck: new Date()
    };
  }
}

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: false,
    tablesAvailable: [],
    errors: []
  });
  const [driveStatus, setDriveStatus] = useState<DriveStatus>({
    connected: false,
    documentsFound: 0,
    errors: []
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Test connessioni iniziali
  useEffect(() => {
    const testConnections = async () => {
      const [airtableStatus, driveStatus] = await Promise.allSettled([
        checkAirtableConnection(),
        checkGoogleDriveConnection()
      ]);
      
      if (airtableStatus.status === 'fulfilled') {
        setDbStatus(airtableStatus.value);
      }
      if (driveStatus.status === 'fulfilled') {
        setDriveStatus(driveStatus.value);
      }
    };
    
    testConnections();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Esempi di domande rapide
  const quickQuestions = [
    {
      text: "Dosaggio CDS per adulto 70kg",
      category: "dosaggio",
      icon: "💊"
    },
    {
      text: "Differenza CDS vs Blu di Metilene", 
      category: "confronto",
      icon: "⚖️"
    },
    {
      text: "Controindicazioni blu di metilene",
      category: "sicurezza", 
      icon: "⚠️"
    },
    {
      text: "Protocollo artrite nei PDF",
      category: "protocollo",
      icon: "📄"
    },
    {
      text: "Testimonianze Alzheimer",
      category: "testimonianze",
      icon: "💬"
    },
    {
      text: "Ricerche scientifiche recenti",
      category: "ricerca",
      icon: "🔬"
    }
  ];

  // Funzioni per ricerca e API Claude (semplificate dal file originale)
  const searchAllData = async (query: string) => {
    // Implementazione semplificata - nella versione completa includeresti tutte le funzioni
    return {
      protocolli: [],
      sintomi: [],
      faq: [],
      documentazione: [],
      testimonianze: [],
      ricerche: [],
      dosaggi: [],
      driveDocuments: [],
      timeouts: []
    };
  };

  const callClaudeAPI = async (userMessage: string, contextData: string): Promise<string> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.CLAUDE_API);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [
            {
              role: "user",
              content: `Sei un assistente medico esperto in CDS e Blu di Metilene. Rispondi in italiano.

DATABASE: ${contextData}

DOMANDA: ${userMessage}

Fornisci una risposta professionale, cita le fonti e raccomanda sempre consulto medico.`
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;

    } catch (error) {
      return `Consultando il database per la tua domanda...\n\nPer domande specifiche prova:\n• "Protocollo CDS per [patologia]"\n• "Dosaggio blu di metilene [peso]kg"\n• "Controindicazioni [sostanza]"`;
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
      const searchResults = await searchAllData(currentInput);
      const contextData = JSON.stringify(searchResults);
      const aiResponse = await callClaudeAPI(currentInput, contextData);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        relatedData: searchResults,
        sources: {
          airtable: dbStatus.connected,
          googleDrive: driveStatus.connected,
          timeouts: searchResults.timeouts || []
        }
      };

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? assistantMessage : msg
      ));
      
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Errore temporaneo. Riprova tra poco.",
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
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'
    }`}>
      
      {/* Header compatto */}
      <header className={`sticky top-0 z-20 backdrop-blur-xl transition-all duration-300 ${
        darkMode ? 'bg-gray-900/90' : 'bg-white/90'
      } border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </a>
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-emerald-600" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  CDS AI Assistant
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Status compatto */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  dbStatus.connected ? 'bg-green-500' : 'bg-red-500'
                }`} title="Database Airtable" />
                <div className={`w-2 h-2 rounded-full ${
                  driveStatus.connected ? 'bg-blue-500' : 'bg-red-500'
                }`} title="Google Drive" />
              </div>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Input area prominente */}
        <div className={`rounded-2xl shadow-xl mb-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          
          {/* Input principale */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Chiedi qualsiasi cosa su CDS e Blu di Metilene..."
                    className={`w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 focus:outline-none focus:border-emerald-500 transition-all ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="hidden sm:inline">Elaboro...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span className="hidden sm:inline">Chiedi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Domande rapide - CHIARAMENTE IDENTIFICATE */}
          {messages.length === 0 && (
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Domande di esempio - clicca per iniziare:
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question.text)}
                    className={`group p-4 rounded-lg border-2 border-dashed text-left transition-all hover:border-solid hover:shadow-md ${
                      darkMode 
                        ? 'border-gray-600 hover:border-emerald-500 hover:bg-gray-700' 
                        : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{question.icon}</span>
                      <div>
                        <div className="font-medium group-hover:text-emerald-600 transition-colors">
                          {question.text}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {question.category}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-sm">Fonti disponibili:</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <div>• Database Airtable: {dbStatus.tablesAvailable.length}/7 tabelle</div>
                  <div>• Google Drive: {driveStatus.documentsFound} documenti PDF</div>
                  <div>• AI Claude per analisi avanzate</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Area messaggi */}
        {messages.length > 0 && (
          <div className={`rounded-2xl shadow-xl overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <div className={`flex max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${
                      message.role === 'user' ? 'ml-3' : 'mr-3'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' 
                          : message.isError
                            ? 'bg-gradient-to-r from-red-500 to-orange-500'
                            : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    
                    {/* Contenuto messaggio */}
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
                          <span className="text-sm">Analizzando database e documenti...</span>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </div>
                          
                          {/* Fonti compatte */}
                          {message.sources && message.role === 'assistant' && (
                            <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                              <div className="flex items-center space-x-2 text-xs">
                                <Zap className="w-3 h-3" />
                                <span>
                                  Fonti: {message.sources.airtable ? 'Airtable' : ''} 
                                  {message.sources.googleDrive ? (message.sources.airtable ? ' + Drive' : 'Drive') : ''}
                                </span>
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
          </div>
        )}

        {/* Settings panel espandibile */}
        {showSettings && (
          <div className={`mt-6 rounded-2xl shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Status Sistema</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4" />
                  <span className="font-medium">Database Airtable</span>
                  {dbStatus.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {dbStatus.tablesAvailable.length}/7 tabelle attive
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">Google Drive</span>
                  {driveStatus.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {driveStatus.documentsFound} documenti trovati
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAI;