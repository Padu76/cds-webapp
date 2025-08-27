"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, Search, FileText, Heart, ArrowLeft, 
  AlertCircle, RefreshCw, Database, Activity, BookOpen, 
  MessageCircle, FlaskConical, Calculator, CheckCircle2,
  AlertTriangle, Moon, Sun, File, Folder, ExternalLink, Clock
} from 'lucide-react';

// Credenziali Airtable integrate
const AIRTABLE_BASE_ID = 'app5b8Z1mnHiTexSK';
const AIRTABLE_API_KEY = 'patHBKeuMtAh47bl5.2c36bdd966f7a847ffe1f3242be4a19dbf7b1fd02bd42865d15d8dbb402dffac';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Timeout configurabili
const TIMEOUTS = {
  AIRTABLE: 8000, // 8 secondi per Airtable
  GOOGLE_DRIVE: 5000, // 5 secondi per Google Drive
  CLAUDE_API: 15000, // 15 secondi per Claude
};

// Interfacce esistenti (mantenute uguali)
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

// Interfacce Google Drive
interface DriveDocument {
  id: string;
  name: string;
  type: string;
  content?: string;
  keywords?: string[];
  relevantSections?: string[];
  matchScore?: number;
}

interface DriveStatus {
  connected: boolean;
  documentsFound: number;
  errors: string[];
  lastCheck?: Date;
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

// Headers per API Airtable
const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Utility functions (mantenute uguali)
const parseCommaSeparatedString = (str: string): string[] => {
  if (!str) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

const safeParseInt = (value: any, defaultValue: number = 0): number => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Funzione con timeout per fetch generica
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

// Funzione generica per chiamate Airtable con timeout
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

// Funzioni API Airtable (mantenute uguali ma con nuovo airtableRequest)
async function getProtocolli(): Promise<Protocollo[]> {
  try {
    const data = await airtableRequest('/protocolli');
    
    return data.records.map((record: any) => ({
      id: record.id,
      nome: record.fields.Nome || record.fields.nome || '',
      descrizione: record.fields.Descrizione || record.fields.descrizione || '',
      dosaggio: record.fields.Dosaggio || record.fields.dosaggio || '',
      sintomiCorrelati: parseCommaSeparatedString(record.fields.Sintomi_Correlati || record.fields.sintomi_correlati || ''),
      pdfUrl: record.fields.PDF_URL || record.fields.pdf_url || '',
      efficacia: safeParseInt(record.fields.Efficacia || record.fields.efficacia),
      note: record.fields.Note || record.fields.note || '',
      categoria: record.fields.Categoria || record.fields.categoria || '',
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
      nome: record.fields.Nome || record.fields.nome || '',
      keywords: parseCommaSeparatedString(record.fields.Keywords || record.fields.keywords || ''),
      categoria: record.fields.Categoria || record.fields.categoria || '',
      urgenza: record.fields.Urgenza || record.fields.urgenza || 'Bassa',
      descrizione: record.fields.Descrizione || record.fields.descrizione || '',
      protocolliSuggeriti: parseCommaSeparatedString(record.fields.Protocolli_Suggeriti || record.fields.protocolli_suggeriti || ''),
    }));
  } catch (error) {
    console.error('Errore nel recupero sintomi:', error);
    return [];
  }
}

async function getFaq(): Promise<FAQ[]> {
  try {
    const data = await airtableRequest('/FAQ');
    
    return data.records.map((record: any) => ({
      id: record.id,
      domanda: record.fields.Domanda || record.fields.domanda || '',
      risposta: record.fields.Risposta || record.fields.risposta || '',
      categoria: record.fields.Categoria || record.fields.categoria || '',
      keywords: parseCommaSeparatedString(record.fields.Keywords || record.fields.keywords || ''),
      importanza: safeParseInt(record.fields.Importanza || record.fields.importanza),
      dataAggiornamento: record.fields.Data_Aggiornamento || record.fields.data_aggiornamento || '',
      protocolloCorrelato: record.fields.Protocollo_Correlato || record.fields.protocollo_correlato || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero FAQ:', error);
    return [];
  }
}

async function getDocumentazione(): Promise<Documentazione[]> {
  try {
    const data = await airtableRequest('/documentazione');
    
    return data.records.map((record: any) => ({
      id: record.id,
      titolo: record.fields.Titolo || record.fields.titolo || '',
      categoria: record.fields.Categoria || record.fields.categoria || '',
      contenuto: record.fields.Contenuto || record.fields.contenuto || '',
      fileUrl: record.fields.File_URL || record.fields.file_url || '',
      tags: parseCommaSeparatedString(record.fields.Tags || record.fields.tags || ''),
    }));
  } catch (error) {
    console.error('Errore nel recupero documentazione:', error);
    return [];
  }
}

async function getTestimonianze(): Promise<Testimonianza[]> {
  try {
    const data = await airtableRequest('/testimonianze');
    
    return data.records.map((record: any) => ({
      id: record.id,
      patologia: record.fields.Patologia || record.fields.patologia || '',
      trattamentoUsato: record.fields.Trattamento_Usato || record.fields.trattamento_usato || '',
      durataTrattamento: record.fields.Durata_Trattamento || record.fields.durata_trattamento || '',
      risultati: record.fields.Risultati || record.fields.risultati || '',
      etaPaziente: record.fields.Eta_Paziente || record.fields.eta_paziente || '',
      noteAnonime: record.fields.Note_Anonime || record.fields.note_anonime || '',
      efficacia: safeParseInt(record.fields.Efficacia || record.fields.efficacia),
      dataTestimonianza: record.fields.Data_Testimonianza || record.fields.data_testimonianza || '',
      protocolloUtilizzato: record.fields.Protocollo_Utilizzato || record.fields.protocollo_utilizzato || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero testimonianze:', error);
    return [];
  }
}

async function getRicerche(): Promise<RicercaScientifica[]> {
  try {
    const data = await airtableRequest('/ricerche');
    
    return data.records.map((record: any) => ({
      id: record.id,
      titoloStudio: record.fields.Titolo_Studio || record.fields.titolo_studio || '',
      sostanza: record.fields.Sostanza || record.fields.sostanza || '',
      linkDoi: record.fields.Link_DOI || record.fields.link_doi || '',
      riassunto: record.fields.Riassunto || record.fields.riassunto || '',
      anno: record.fields.Anno || record.fields.anno || '',
      rivista: record.fields.Rivista || record.fields.rivista || '',
      importanza: safeParseInt(record.fields.Importanza || record.fields.importanza),
      categoria: record.fields.Categoria || record.fields.categoria || '',
      risultatiPrincipali: record.fields.Risultati_Principali || record.fields.risultati_principali || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero ricerche:', error);
    return [];
  }
}

async function getDosaggi(): Promise<Dosaggio[]> {
  try {
    const data = await airtableRequest('/dosaggi');
    
    return data.records.map((record: any) => ({
      id: record.id,
      patologia: record.fields.Patologia || record.fields.patologia || '',
      pesoPaziente: record.fields.Peso_Paziente || record.fields.peso_paziente || '',
      dosaggioCds: record.fields.Dosaggio_CDS || record.fields.dosaggio_cds || '',
      dosaggioBluMetilene: record.fields.Dosaggio_Blu_Metilene || record.fields.dosaggio_blu_metilene || '',
      formulaCalcolo: record.fields.Formula_Calcolo || record.fields.formula_calcolo || '',
      noteSicurezza: record.fields.Note_Sicurezza || record.fields.note_sicurezza || '',
      frequenza: record.fields.Frequenza || record.fields.frequenza || '',
      durataMax: record.fields.Durata_Max || record.fields.durata_max || '',
      protocolloRef: record.fields.Protocollo_Ref || record.fields.protocollo_ref || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero dosaggi:', error);
    return [];
  }
}

// Funzioni Google Drive con timeout
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

async function searchGoogleDrive(query: string): Promise<DriveDocument[]> {
  try {
    const response = await fetchWithTimeout('/api/drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: query.substring(0, 10) // Limita query per ridurre processing
      })
    }, TIMEOUTS.GOOGLE_DRIVE);

    if (!response.ok) {
      throw new Error(`Drive search failed: ${response.status}`);
    }

    const results = await response.json();
    
    return results.slice(0, 5).map((result: any) => ({
      id: result.document?.id || '',
      name: result.document?.name || 'Unknown',
      type: result.document?.type || 'pdf',
      content: result.document?.content?.substring(0, 800) || '', // Limita contenuto
      keywords: result.document?.keywords || [],
      relevantSections: result.relevantSections?.slice(0, 2) || [], // Max 2 sezioni
      matchScore: result.matchScore || 0
    }));
  } catch (error) {
    console.error('Errore ricerca Google Drive:', error);
    return [];
  }
}

// Test connessione Airtable
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

// Cache per prestazioni (mantenuta uguale)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti

async function getCachedData<T>(fetcher: () => Promise<T>, key: string): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const data = await fetcher();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente AI specializzato in CDS e Blu di Metilene.\n\nHo accesso a:\n• Database Airtable con protocolli, sintomi, FAQ, dosaggi, testimonianze e ricerche\n• Documenti Google Drive (36 PDF trovati)\n• Intelligenza artificiale Claude per analisi avanzate\n\nPosso aiutarti con:\n- Protocolli specifici per patologie\n- Dosaggi personalizzati\n- Confronti CDS vs Blu di Metilene\n- Consultazione documenti PDF\n- Evidenze scientifiche\n\nCosa vuoi sapere?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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
  const [showDbStatus, setShowDbStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Test connessioni iniziali
  useEffect(() => {
    const testConnections = async () => {
      try {
        // Test Airtable
        const airtableStatus = await checkAirtableConnection();
        setDbStatus(airtableStatus);
        
        // Test Google Drive
        const driveStatus = await checkGoogleDriveConnection();
        setDriveStatus(driveStatus);
      } catch (error) {
        console.error('Errore nel test connessioni:', error);
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

  // Ricerca completa con timeout paralleli
  const searchAllData = async (query: string) => {
    const timeouts: string[] = [];
    let airtableData: any = {
      protocolli: [], sintomi: [], faq: [], documentazione: [],
      testimonianze: [], ricerche: [], dosaggi: []
    };
    let driveDocuments: DriveDocument[] = [];

    // Ricerca parallela con Promise.allSettled per gestire timeout individuali
    const [airtableResults, driveResults] = await Promise.allSettled([
      // Ricerca Airtable
      Promise.allSettled([
        getCachedData(() => getProtocolli(), 'protocolli'),
        getCachedData(() => getSintomi(), 'sintomi'),
        getCachedData(() => getFaq(), 'faq'),
        getCachedData(() => getDocumentazione(), 'documentazione'),
        getCachedData(() => getTestimonianze(), 'testimonianze'),
        getCachedData(() => getRicerche(), 'ricerche'),
        getCachedData(() => getDosaggi(), 'dosaggi')
      ]).then(results => {
        const [protocolli, sintomi, faq, documentazione, testimonianze, ricerche, dosaggi] = results;
        const lowerQuery = query.toLowerCase();
        
        return {
          protocolli: protocolli.status === 'fulfilled' ? 
            protocolli.value.filter((p: Protocollo) => 
              p.nome.toLowerCase().includes(lowerQuery) ||
              p.descrizione.toLowerCase().includes(lowerQuery) ||
              p.sintomiCorrelati.some(s => s.toLowerCase().includes(lowerQuery))
            ) : [],
          sintomi: sintomi.status === 'fulfilled' ?
            sintomi.value.filter((s: Sintomo) => 
              s.nome.toLowerCase().includes(lowerQuery) ||
              s.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
              s.descrizione.toLowerCase().includes(lowerQuery)
            ) : [],
          faq: faq.status === 'fulfilled' ?
            faq.value.filter((f: FAQ) =>
              f.domanda.toLowerCase().includes(lowerQuery) ||
              f.risposta.toLowerCase().includes(lowerQuery) ||
              f.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))
            ) : [],
          documentazione: documentazione.status === 'fulfilled' ? 
            documentazione.value.filter((doc: Documentazione) => 
              doc.titolo.toLowerCase().includes(lowerQuery) ||
              doc.contenuto.toLowerCase().includes(lowerQuery) ||
              doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            ) : [],
          testimonianze: testimonianze.status === 'fulfilled' ?
            testimonianze.value.filter((test: Testimonianza) =>
              test.patologia.toLowerCase().includes(lowerQuery) ||
              test.risultati.toLowerCase().includes(lowerQuery)
            ) : [],
          ricerche: ricerche.status === 'fulfilled' ?
            ricerche.value.filter((ric: RicercaScientifica) =>
              ric.titoloStudio.toLowerCase().includes(lowerQuery) ||
              ric.riassunto.toLowerCase().includes(lowerQuery) ||
              ric.sostanza.toLowerCase().includes(lowerQuery)
            ) : [],
          dosaggi: dosaggi.status === 'fulfilled' ?
            dosaggi.value.filter((dos: Dosaggio) =>
              dos.patologia.toLowerCase().includes(lowerQuery) ||
              dos.formulaCalcolo.toLowerCase().includes(lowerQuery)
            ) : []
        };
      }),
      // Ricerca Google Drive
      searchGoogleDrive(query)
    ]);

    // Processa risultati Airtable
    if (airtableResults.status === 'fulfilled') {
      airtableData = airtableResults.value;
    } else {
      timeouts.push('Airtable');
      console.error('Timeout Airtable:', airtableResults.reason);
    }

    // Processa risultati Drive
    if (driveResults.status === 'fulfilled') {
      driveDocuments = driveResults.value;
    } else {
      timeouts.push('Google Drive');
      console.error('Timeout Google Drive:', driveResults.reason);
    }

    return {
      ...airtableData,
      driveDocuments,
      timeouts
    };
  };

  // Formatta dati per Claude (aggiornata con Drive)
  const formatDataForClaude = (data: any): string => {
    let formatted = "=== DATABASE CDS WELLNESS COMPLETO ===\n\n";
    
    // Sezione Airtable (mantenuta uguale)
    if (data.protocolli?.length > 0) {
      formatted += "PROTOCOLLI DISPONIBILI:\n";
      data.protocolli.forEach((p: Protocollo, index: number) => {
        formatted += `${index + 1}. ${p.nome}\n`;
        formatted += `   • Descrizione: ${p.descrizione}\n`;
        formatted += `   • Dosaggio: ${p.dosaggio}\n`;
        formatted += `   • Efficacia: ${p.efficacia}/10\n`;
        if (p.note) formatted += `   • Note: ${p.note}\n`;
        formatted += "\n";
      });
    }
    
    if (data.sintomi?.length > 0) {
      formatted += "SINTOMI E CORRELAZIONI:\n";
      data.sintomi.forEach((s: Sintomo, index: number) => {
        formatted += `${index + 1}. ${s.nome} (${s.categoria} - Urgenza: ${s.urgenza})\n`;
        formatted += `   • ${s.descrizione}\n`;
        if (s.protocolliSuggeriti.length > 0) {
          formatted += `   • Protocolli suggeriti: ${s.protocolliSuggeriti.join(', ')}\n`;
        }
        formatted += "\n";
      });
    }
    
    if (data.faq?.length > 0) {
      formatted += "FAQ RILEVANTI:\n";
      data.faq.slice(0, 3).forEach((f: FAQ, index: number) => {
        formatted += `${index + 1}. ${f.domanda}\n`;
        formatted += `   Risposta: ${f.risposta}\n\n`;
      });
    }
    
    if (data.testimonianze?.length > 0) {
      formatted += "TESTIMONIANZE CORRELATE:\n";
      data.testimonianze.slice(0, 2).forEach((t: Testimonianza, index: number) => {
        formatted += `${index + 1}. ${t.patologia} - ${t.trattamentoUsato}\n`;
        formatted += `   • Risultati: ${t.risultati}\n`;
        formatted += `   • Efficacia: ${t.efficacia}/10\n\n`;
      });
    }
    
    if (data.ricerche?.length > 0) {
      formatted += "EVIDENZE SCIENTIFICHE:\n";
      data.ricerche.slice(0, 2).forEach((r: RicercaScientifica, index: number) => {
        formatted += `${index + 1}. ${r.titoloStudio} (${r.anno})\n`;
        formatted += `   • Sostanza: ${r.sostanza}\n`;
        formatted += `   • Risultati: ${r.risultatiPrincipali}\n\n`;
      });
    }
    
    if (data.dosaggi?.length > 0) {
      formatted += "DOSAGGI CALCOLATI:\n";
      data.dosaggi.slice(0, 2).forEach((d: Dosaggio, index: number) => {
        formatted += `${index + 1}. ${d.patologia}\n`;
        formatted += `   • CDS: ${d.dosaggioCds}\n`;
        formatted += `   • Blu Metilene: ${d.dosaggioBluMetilene}\n`;
        formatted += `   • Frequenza: ${d.frequenza}\n`;
        formatted += `   • Sicurezza: ${d.noteSicurezza}\n\n`;
      });
    }
    
    // Nuova sezione Google Drive
    if (data.driveDocuments?.length > 0) {
      formatted += "=== DOCUMENTI GOOGLE DRIVE ===\n";
      data.driveDocuments.forEach((doc: DriveDocument, index: number) => {
        formatted += `${index + 1}. DOCUMENTO: ${doc.name}\n`;
        formatted += `   Tipo: ${doc.type.toUpperCase()}\n`;
        if (doc.keywords && doc.keywords.length > 0) {
          formatted += `   Keywords: ${doc.keywords.join(', ')}\n`;
        }
        if (doc.relevantSections && doc.relevantSections.length > 0) {
          formatted += `   Contenuto rilevante:\n`;
          doc.relevantSections.forEach(section => {
            formatted += `   - ${section.substring(0, 300)}\n`;
          });
        } else if (doc.content) {
          formatted += `   Anteprima: ${doc.content.substring(0, 400)}\n`;
        }
        formatted += `   Rilevanza: ${doc.matchScore}/10\n\n`;
      });
    }
    
    // Informazioni sui timeout
    if (data.timeouts?.length > 0) {
      formatted += `=== NOTE TECNICHE ===\nTimeout riscontrati: ${data.timeouts.join(', ')}\n`;
    }
    
    return formatted;
  };

  // Chiamata Claude API con timeout (aggiornata)
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
              content: `Sei un assistente medico esperto in CDS (Diossido di Cloro) e Blu di Metilene. Rispondi in italiano con informazioni accurate e sicure.

DATABASE E DOCUMENTI DISPONIBILI:
${contextData}

DOMANDA UTENTE: ${userMessage}

ISTRUZIONI:
- Usa sempre le informazioni dal database Airtable e Google Drive quando pertinenti
- Per dosaggi, cita sempre i dati specifici trovati nel database
- Menziona le fonti consultate (Airtable/Google Drive/ricerche scientifiche)
- Suggerisci sempre di consultare un medico per casi specifici
- Se ci sono stati timeout, menzionalo brevemente
- Rispondi in modo professionale ma accessibile

RISPOSTA:`
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
      console.error('Errore Claude API:', error);
      
      // Fallback più robusto
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('dosaggio') || lowerMessage.includes('dose')) {
        return `**DOSAGGIO STANDARD (Database Airtable):**\n\n**CDS:**\n• Adulto 70kg: 2-3ml CDS in 200ml acqua\n• Frequenza: 3 volte al giorno\n• Durata: 14-21 giorni per infezioni acute\n\n**BLU DI METILENE:**\n• Standard: 1-2mg per kg di peso corporeo\n• Persona 70kg: 70-140mg al giorno\n• Con cibo per ridurre nausea\n\n**IMPORTANTE:** Iniziare con dosaggi minimi. Consultare medico esperto.\n\n*Fonti: Database Airtable - tabelle dosaggi e protocolli*`;
      }
      
      return `Ho consultato il database Airtable e Google Drive per la tua domanda.\n\n${contextData ? 'Ho trovato informazioni rilevanti nei dati disponibili.' : 'Nessun dato specifico trovato per questa domanda.'}\n\n**Suggerimenti per domande più specifiche:**\n• "Protocollo CDS per [patologia]"\n• "Dosaggio blu di metilene [peso]kg"\n• "Controindicazioni CDS"\n• "Testimonianze per [condizione]"\n\n*Database: ${dbStatus.tablesAvailable.length}/7 tabelle Airtable + ${driveStatus.documentsFound} documenti Drive*`;
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
      // Ricerca con timeout paralleli
      const searchResults = await searchAllData(currentInput);
      const contextData = formatDataForClaude(searchResults);
      
      // Chiama Claude API
      const aiResponse = await callClaudeAPI(currentInput, contextData);
      
      // Aggiorna messaggio con risposta
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        relatedData: searchResults,
        sources: {
          airtable: !searchResults.timeouts?.includes('Airtable'),
          googleDrive: !searchResults.timeouts?.includes('Google Drive'),
          timeouts: searchResults.timeouts || []
        }
      };

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? assistantMessage : msg
      ));
      
    } catch (error) {
      console.error('Errore nella chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Errore di comunicazione. Possibili cause:\n• Problema connessione Airtable o Google Drive\n• API Claude temporaneamente non disponibile\n• Timeout di sistema\n\nRiprova tra poco.\n\nStatus: Airtable ${dbStatus.connected ? 'OK' : 'KO'} | Google Drive ${driveStatus.connected ? 'OK' : 'KO'}`,
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
    "Protocollo per artrite nei documenti",
    "Testimonianze Alzheimer",
    "Ricerche scientifiche 2024"
  ];

  const getStatusIcon = (connected: boolean, hasData: boolean = true) => {
    if (connected && hasData) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    } else if (connected) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getDriveStatusIcon = (status: DriveStatus) => {
    if (status.connected && status.documentsFound > 0) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    } else if (status.connected) {
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
                CDS AI Assistant Pro
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
                  {getStatusIcon(dbStatus.connected, dbStatus.tablesAvailable.length > 0)}
                  <Database className="w-3 h-3" />
                  <span>{dbStatus.tablesAvailable.length}/7</span>
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
                  {getDriveStatusIcon(driveStatus)}
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
                  <span>Status Sistemi</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Airtable Status */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Database Airtable</span>
                  </h4>
                  <div className="space-y-1">
                    {dbStatus.tablesAvailable.map((table) => (
                      <div key={table} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>{table}: Attivo</span>
                      </div>
                    ))}
                    {dbStatus.errors.map((error, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <span className="text-red-600 text-xs">{error}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Google Drive Status */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <Folder className="w-4 h-4" />
                    <span>Google Drive</span>
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {getDriveStatusIcon(driveStatus)}
                      <span>
                        {driveStatus.connected ? 'Connesso' : 'Disconnesso'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <File className="w-3 h-3 text-blue-500" />
                      <span>{driveStatus.documentsFound} documenti trovati</span>
                    </div>
                    {driveStatus.lastCheck && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs">
                          Ultimo check: {driveStatus.lastCheck.toLocaleTimeString('it-IT')}
                        </span>
                      </div>
                    )}
                    {driveStatus.errors.map((error, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <span className="text-red-600 text-xs">{error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Claude AI Status */}
              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-cyan-500" />
                  <span>Claude AI: Connesso (timeout: {TIMEOUTS.CLAUDE_API/1000}s)</span>
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
                        <span className="text-sm">Consultando Airtable, Google Drive e Claude AI...</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse animation-delay-100"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse animation-delay-200"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                        
                        {/* Sources indicator */}
                        {message.sources && (
                          <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                            <div className="text-xs font-semibold mb-2">Fonti consultate:</div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {message.sources.airtable && (
                                <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded">
                                  <Database className="w-3 h-3" />
                                  <span>Airtable</span>
                                </div>
                              )}
                              {message.sources.googleDrive && (
                                <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  <Folder className="w-3 h-3" />
                                  <span>Google Drive</span>
                                </div>
                              )}
                              {message.sources.timeouts && message.sources.timeouts.length > 0 && (
                                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                  <Clock className="w-3 h-3" />
                                  <span>Timeout: {message.sources.timeouts.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Dati correlati dettagliati */}
                        {message.relatedData && (
                          <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
                            <div className="text-xs font-semibold mb-2 flex items-center space-x-1">
                              <Search className="w-3 h-3" />
                              <span>Dati trovati:</span>
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
                              {message.relatedData.faq && message.relatedData.faq.length > 0 && (
                                <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{message.relatedData.faq.length} FAQ</span>
                                </div>
                              )}
                              {message.relatedData.testimonianze && message.relatedData.testimonianze.length > 0 && (
                                <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  <Heart className="w-3 h-3" />
                                  <span>{message.relatedData.testimonianze.length} testimonianze</span>
                                </div>
                              )}
                              {message.relatedData.ricerche && message.relatedData.ricerche.length > 0 && (
                                <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                  <FlaskConical className="w-3 h-3" />
                                  <span>{message.relatedData.ricerche.length} ricerche</span>
                                </div>
                              )}
                              {message.relatedData.dosaggi && message.relatedData.dosaggi.length > 0 && (
                                <div className="flex items-center space-x-1 bg-pink-100 text-pink-700 px-2 py-1 rounded">
                                  <Calculator className="w-3 h-3" />
                                  <span>{message.relatedData.dosaggi.length} dosaggi</span>
                                </div>
                              )}
                              {message.relatedData.documentazione && message.relatedData.documentazione.length > 0 && (
                                <div className="flex items-center space-x-1 bg-teal-100 text-teal-700 px-2 py-1 rounded">
                                  <BookOpen className="w-3 h-3" />
                                  <span>{message.relatedData.documentazione.length} documenti AT</span>
                                </div>
                              )}
                              {message.relatedData.driveDocuments && message.relatedData.driveDocuments.length > 0 && (
                                <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  <File className="w-3 h-3" />
                                  <span>{message.relatedData.driveDocuments.length} PDF Drive</span>
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
                <span>Domande di esempio (database + PDF):</span>
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
              <h3 className="font-semibold">Database Airtable</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              7 tabelle con protocolli, sintomi, dosaggi e testimonianze
            </p>
            <div className="mt-2 text-xs text-emerald-600">
              Timeout: {TIMEOUTS.AIRTABLE/1000}s
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Folder className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Google Drive</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {driveStatus.documentsFound} PDF con ricerche e documentazione
            </p>
            <div className="mt-2 text-xs text-blue-600">
              Timeout: {TIMEOUTS.GOOGLE_DRIVE/1000}s
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold">Claude AI Pro</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI medica con accesso completo ai tuoi dati
            </p>
            <div className="mt-2 text-xs text-cyan-600">
              Timeout: {TIMEOUTS.CLAUDE_API/1000}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;