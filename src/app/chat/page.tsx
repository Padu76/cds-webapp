"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, Search, FileText, Heart, ArrowLeft, 
  AlertCircle, RefreshCw, Database, Activity, BookOpen, 
  MessageCircle, FlaskConical, Calculator, CheckCircle2,
  AlertTriangle, Moon, Sun, File, Folder, Link
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
import {
  searchDocuments,
  formatDocumentsForAI,
  checkGoogleDriveConnection,
  type DocumentSearchResult,
  type ParsedDocument
} from '@/lib/document-parser';

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
  driveDocuments?: DocumentSearchResult[];
  isLoading?: boolean;
  isError?: boolean;
}

interface DatabaseStatus {
  connected: boolean;
  tablesLoaded: number;
  totalTables: number;
  errors: string[];
}

interface DriveStatus {
  connected: boolean;
  documentsFound: number;
  supportedTypes: string[];
  errors: string[];
}

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente AI specializzato in CDS e Blu di Metilene.\n\nHo accesso completo al tuo database con:\n• Protocolli terapeutici dettagliati\n• Sintomi e correlazioni\n• Testimonianze reali di pazienti\n• Ricerche scientifiche aggiornate\n• FAQ con risposte esperte\n• Calcolatori di dosaggio personalizzati\n• Documentazione tecnica\n• Documenti PDF, Word, Excel dal tuo Google Drive\n\nPosso aiutarti con:\n- Protocolli specifici per patologie\n- Dosaggi personalizzati per peso\n- Confronti CDS vs Blu di Metilene\n- Controindicazioni e sicurezza\n- Evidenze scientifiche\n- Ricerche nei tuoi documenti personali\n\nCosa vuoi sapere?',
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
  const [driveStatus, setDriveStatus] = useState<DriveStatus>({
    connected: false,
    documentsFound: 0,
    supportedTypes: [],
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

  // Verifica connessioni all'avvio
  useEffect(() => {
    const initializeSources = async () => {
      // Test Airtable
      try {
        const airtableCheck = await checkAirtableConnection();
        setDbStatus({
          connected: airtableCheck.connected,
          tablesLoaded: airtableCheck.tablesAvailable.length,
          totalTables: 7,
          errors: airtableCheck.errors
        });

        if (airtableCheck.connected) {
          Promise.all([
            getCachedData('protocolli'),
            getCachedData('sintomi'),
            getCachedData('faq')
          ]).catch(err => {
            console.warn('Errore nel precaricamento dati Airtable:', err);
          });
        }
      } catch (error) {
        setDbStatus(prev => ({
          ...prev,
          connected: false,
          errors: [`Errore Airtable: ${error instanceof Error ? error.message : 'Sconosciuto'}`]
        }));
      }

      // Test Google Drive
      try {
        const driveCheck = await checkGoogleDriveConnection();
        setDriveStatus(driveCheck);
      } catch (error) {
        setDriveStatus(prev => ({
          ...prev,
          connected: false,
          errors: [`Errore Google Drive: ${error instanceof Error ? error.message : 'Sconosciuto'}`]
        }));
      }
    };
    
    initializeSources();
  }, []);

  // Generazione risposta AI migliorata con documenti
  const generateAIResponse = async (
    userMessage: string, 
    contextData: string, 
    driveDocuments?: DocumentSearchResult[]
  ): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    // Informazioni da documenti Drive se presenti
    let driveInfo = '';
    if (driveDocuments && driveDocuments.length > 0) {
      driveInfo = '\n\n📁 **DOCUMENTI CONSULTATI:**\n';
      driveDocuments.slice(0, 3).forEach((doc, index) => {
        driveInfo += `${index + 1}. ${doc.document.name} (${doc.document.type.toUpperCase()})\n`;
        if (doc.relevantSections.length > 0) {
          driveInfo += `   Contenuto rilevante: ${doc.relevantSections[0].substring(0, 150)}...\n`;
        }
      });
    }

    // Risposte specifiche potenziate con documenti
    if (lowerMessage.includes('dosaggio') || lowerMessage.includes('dose')) {
      response = `Basandomi sui dati del database e sui documenti Google Drive, ecco le informazioni sui dosaggi:\n\n**DOSAGGIO CDS STANDARD:**\n• Adulto 70kg: 2-3ml CDS in 200ml acqua\n• Frequenza: 3 volte al giorno\n• Durata: 14-21 giorni per infezioni acute\n\n**DOSAGGIO BLU DI METILENE:**\n• Standard: 1-2mg per kg di peso corporeo\n• Persona 70kg: 70-140mg al giorno\n• Assumere con il cibo per ridurre nausea\n\n**IMPORTANTE:** Iniziare sempre con dosaggi minimi e aumentare gradualmente. Monitorare la tolleranza del paziente.${driveInfo}\n\nVuoi un calcolo personalizzato per peso specifico?`;
      
    } else if (lowerMessage.includes('differenz') || lowerMessage.includes('confronto') || lowerMessage.includes('vs')) {
      response = `**CDS vs BLU DI METILENE - Analisi Comparativa:**\n\n**CDS (Diossido di Cloro):**\n• Azione: Antimicrobica potente, ossidazione selettiva\n• Meglio per: Infezioni batteriche, virali, fungine\n• Vantaggi: Ampio spettro, non crea resistenze\n• pH neutro, ben tollerato\n\n**BLU DI METILENE:**\n• Azione: Neuroprotettiva, antimicrobica, antiossidante\n• Meglio per: Disturbi neurologici, supporto cognitivo\n• Vantaggi: Attraversa barriera ematoencefalica\n• Colorazione temporanea urine (normale)\n\n**QUANDO SCEGLIERE:**\n• Infezioni acute → **CDS**\n• Problemi neurologici → **BLU DI METILENE**\n• Patologie croniche → Spesso **combinazione**${driveInfo}\n\nVuoi approfondire una specifica applicazione?`;
      
    } else if (lowerMessage.includes('sicurezza') || lowerMessage.includes('controindicazioni')) {
      response = `**PROFILO SICUREZZA CDS E BLU DI METILENE:**\n\n**CDS - Controindicazioni:**\n• Gravidanza e allattamento (mancano studi)\n• Severe insufficienze renali/epatiche\n• Interazione con alcuni farmaci (distanziare 2h)\n• Non superare 6ml/giorno per adulto\n\n**BLU DI METILENE - Controindicazioni:**\n• Deficit G6PD (può causare emolisi)\n• Gravidanza e allattamento\n• Interazione con SSRI (rischio sindrome serotoninergica)\n• Non superare 7mg/kg peso corporeo\n\n**EFFETTI COLLATERALI COMUNI:**\n• CDS: Nausea lieve, diarrea iniziale\n• BM: Urine blu-verdi (temporaneo), mal di testa lieve\n\n**MONITORAGGIO RACCOMANDATO:**\n• Funzioni epatiche e renali nei trattamenti lunghi\n• Emocromo completo ogni 30 giorni${driveInfo}\n\n**Sempre consultare un medico esperto prima dell'uso!**`;
      
    } else if (lowerMessage.includes('documento') || lowerMessage.includes('file') || lowerMessage.includes('pdf')) {
      if (driveDocuments && driveDocuments.length > 0) {
        response = `Ho trovato ${driveDocuments.length} documento/i rilevanti nel tuo Google Drive:\n\n`;
        driveDocuments.forEach((doc, index) => {
          response += `**${index + 1}. ${doc.document.name}** (${doc.document.type.toUpperCase()})\n`;
          response += `• Rilevanza: ${doc.matchScore} punti\n`;
          response += `• Parole chiave trovate: ${doc.document.keywords?.slice(0, 5).join(', ') || 'N/A'}\n`;
          if (doc.relevantSections.length > 0) {
            response += `• Estratto: "${doc.relevantSections[0].substring(0, 200)}..."\n`;
          }
          response += `• Link: ${doc.document.url}\n\n`;
        });
        response += `Vuoi che approfondisca il contenuto di un documento specifico?`;
      } else {
        response = `Non ho trovato documenti specifici per "${userMessage}" nel tuo Google Drive.\n\nProva con termini come:\n• "protocollo CDS"\n• "blu di metilene ricerca"\n• "dosaggi"\n• "controindicazioni"\n\nOppure dimmi il nome specifico del documento che stai cercando.`;
      }
      
    } else {
      response = `Ho analizzato la tua richiesta consultando:\n• Database Airtable (${contextData ? 'dati trovati' : 'nessun dato specifico'})\n• Google Drive (${driveDocuments?.length || 0} documenti rilevanti)\n\n`;
      
      if (driveDocuments && driveDocuments.length > 0) {
        response += `Dai tuoi documenti personali ho estratto informazioni rilevanti che integrano i dati del database.${driveInfo}`;
      }
      
      response += `\n\nPer risposte più specifiche, prova domande come:\n• "Protocollo CDS per artrite"\n• "Dosaggio blu di metilene 80kg"\n• "Controindicazioni CDS gravidanza"\n• "Cerca documenti su [argomento]"`;
    }

    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!dbStatus.connected && !driveStatus.connected) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Nessuna fonte dati connessa. Verifica:\n• Credenziali Airtable nelle variabili d\'ambiente\n• Credenziali Google Drive\n• Connessione internet\n\nRicarica la pagina per riprovare.',
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
      // Ricerca parallela in tutte le fonti
      const [airtableResults, driveResults] = await Promise.allSettled([
        dbStatus.connected ? searchAllData(currentInput) : null,
        driveStatus.connected ? searchDocuments(currentInput) : null
      ]);
      
      // Processa risultati Airtable
      const airtableData = airtableResults.status === 'fulfilled' && airtableResults.value ? 
        airtableResults.value : {
          protocolli: [], sintomi: [], documentazione: [], testimonianze: [],
          ricerche: [], faq: [], dosaggi: []
        };
      
      // Processa risultati Google Drive
      const driveData = driveResults.status === 'fulfilled' && driveResults.value ? 
        driveResults.value : [];
      
      // Formatta dati per AI
      const contextData = formatDataForAI(airtableData);
      const driveContextData = driveData.length > 0 ? 
        formatDocumentsForAI(driveData.map(d => ({
          metadata: d.document,
          content: d.document.content || '',
          sections: d.relevantSections,
          keywords: d.document.keywords || [],
          summary: d.document.name
        })), currentInput) : '';
      
      // Aggiorna cronologia
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: currentInput }
      ].slice(-10);
      
      // Genera risposta AI
      const aiResponse = await generateAIResponse(
        currentInput, 
        contextData + '\n\n' + driveContextData,
        driveData
      );
      
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: aiResponse }
      ]);
      
      // Aggiorna messaggio con risposta
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        relatedData: airtableData,
        driveDocuments: driveData
      };

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? assistantMessage : msg
      ));
      
    } catch (error) {
      console.error('Errore nella chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}.\n\nPossibili cause:\n• Problema di connessione\n• Configurazione API non corretta\n• Limite rate raggiunti\n\nRiprova tra poco.`,
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
    setDriveStatus(prev => ({ ...prev, connected: false, errors: [] }));
    
    try {
      const [airtableCheck, driveCheck] = await Promise.all([
        checkAirtableConnection(),
        checkGoogleDriveConnection()
      ]);
      
      setDbStatus({
        connected: airtableCheck.connected,
        tablesLoaded: airtableCheck.tablesAvailable.length,
        totalTables: 7,
        errors: airtableCheck.errors
      });
      
      setDriveStatus(driveCheck);
      
    } catch (error) {
      console.error('Errore nel retry connessioni:', error);
    }
  };

  const quickQuestions = [
    "Cerca documenti su artrite",
    "Dosaggio CDS per 70kg adulto?", 
    "Differenze CDS vs Blu di Metilene",
    "Controindicazioni blu di metilene",
    "Protocolli nei miei PDF",
    "Testimonianze Google Drive"
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
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-2">
                {/* Airtable Status */}
                <button
                  onClick={() => setShowDbStatus(!showDbStatus)}
                  className={`flex items-center space-x-2 px-2 py-1 rounded-lg text-xs ${
                    dbStatus.connected 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  } transition-colors`}
                  title="Status Database Airtable"
                >
                  {getStatusIcon(dbStatus.connected, dbStatus.tablesLoaded > 0)}
                  <Database className="w-3 h-3" />
                  <span>{dbStatus.tablesLoaded}/{dbStatus.totalTables}</span>
                </button>

                {/* Google Drive Status */}
                <button
                  onClick={() => setShowDbStatus(!showDbStatus)}
                  className={`flex items-center space-x-2 px-2 py-1 rounded-lg text-xs ${
                    driveStatus.connected 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  } transition-colors`}
                  title="Status Google Drive"
                >
                  {getStatusIcon(driveStatus.connected, driveStatus.documentsFound > 0)}
                  <Folder className="w-3 h-3" />
                  <span>{driveStatus.documentsFound}</span>
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
                  <span>Stato Connessioni</span>
                </h3>
                <button
                  onClick={retryConnection}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Riconnetti</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Airtable Status */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Database Airtable</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['protocolli', 'sintomi', 'documentazione', 'testimonianze', 'ricerche', 'faq', 'dosaggi'].map((table) => (
                      <div key={table} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          dbStatus.errors.some(e => e.includes(table)) ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                        <span className="capitalize">{table}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Google Drive Status */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Folder className="w-4 h-4" />
                    <span>Google Drive</span>
                  </h4>
                  <div className="text-xs space-y-1">
                    <div>Documenti trovati: {driveStatus.documentsFound}</div>
                    <div>Tipi supportati: {driveStatus.supportedTypes.join(', ')}</div>
                    <div className={driveStatus.connected ? 'text-green-600' : 'text-red-600'}>
                      {driveStatus.connected ? 'Connesso' : 'Disconnesso'}
                    </div>
                  </div>
                </div>
              </div>
              
              {(dbStatus.errors.length > 0 || driveStatus.errors.length > 0) && (
                <div className="mt-3 text-xs text-red-600">
                  <strong>Errori:</strong>
                  <ul className="mt-1 space-y-1">
                    {[...dbStatus.errors, ...driveStatus.errors].slice(0, 3).map((error, index) => (
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
                        <span className="text-sm">Consultando database e documenti...</span>
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
                        {(message.relatedData || message.driveDocuments) && (
                          <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
                            <div className="text-xs font-semibold mb-2 flex items-center space-x-1">
                              <Activity className="w-3 h-3" />
                              <span>Fonti consultate:</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              {/* Airtable data */}
                              {message.relatedData?.protocolli && message.relatedData.protocolli.length > 0 && (
                                <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  <FileText className="w-3 h-3" />
                                  <span>{message.relatedData.protocolli.length} protocolli</span>
                                </div>
                              )}
                              {message.relatedData?.sintomi && message.relatedData.sintomi.length > 0 && (
                                <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded">
                                  <Search className="w-3 h-3" />
                                  <span>{message.relatedData.sintomi.length} sintomi</span>
                                </div>
                              )}
                              {message.relatedData?.testimonianze && message.relatedData.testimonianze.length > 0 && (
                                <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{message.relatedData.testimonianze.length} testimonianze</span>
                                </div>
                              )}
                              {message.relatedData?.ricerche && message.relatedData.ricerche.length > 0 && (
                                <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  <FlaskConical className="w-3 h-3" />
                                  <span>{message.relatedData.ricerche.length} ricerche</span>
                                </div>
                              )}
                              
                              {/* Drive documents */}
                              {message.driveDocuments && message.driveDocuments.length > 0 && (
                                <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                  <File className="w-3 h-3" />
                                  <span>{message.driveDocuments.length} documenti</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Links to Drive documents */}
                            {message.driveDocuments && message.driveDocuments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.driveDocuments.slice(0, 3).map((doc, index) => (
                                  <a
                                    key={index}
                                    href={doc.document.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    <Link className="w-3 h-3" />
                                    <span>{doc.document.name}</span>
                                  </a>
                                ))}
                              </div>
                            )}
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
                    disabled={isLoading || (!dbStatus.connected && !driveStatus.connected)}
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
                  placeholder={dbStatus.connected || driveStatus.connected
                    ? "Chiedi qualsiasi cosa: protocolli, dosaggi, cerca documenti..." 
                    : "Connessione alle fonti dati in corso..."
                  }
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isLoading || (!dbStatus.connected && !driveStatus.connected)}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || (!dbStatus.connected && !driveStatus.connected)}
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
              <h3 className="font-semibold">7 Database Airtable</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accesso completo a protocolli, sintomi, testimonianze e ricerche
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Folder className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Google Drive</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ricerca intelligente nei tuoi PDF, Word, Excel personali
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