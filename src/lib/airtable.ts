// airtable.ts - Integrazione Airtable con nomi campi corretti

// Credenziali da variabili ambiente
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!;
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY!;
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Interfacce per i dati
export interface Protocollo {
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

export interface Sintomo {
  id: string;
  nome: string;
  keywords: string[];
  categoria: string;
  urgenza: 'Bassa' | 'Media' | 'Alta';
  descrizione: string;
  protocolliSuggeriti: string[];
}

export interface FAQ {
  id: string;
  domanda: string;
  risposta: string;
  categoria: string;
  keywords: string[];
  importanza: number;
  dataAggiornamento: string;
  protocolloCorrelato: string;
}

export interface Documentazione {
  id: string;
  titolo: string;
  categoria: string;
  contenuto: string;
  fileUrl: string;
  tags: string[];
}

export interface Testimonianza {
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

export interface RicercaScientifica {
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

export interface Dosaggio {
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

// Headers per API Airtable
const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Utility functions
const parseCommaSeparatedString = (str: string): string[] => {
  if (!str) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

const parseKeywordsArray = (str: string | string[]): string[] => {
  if (Array.isArray(str)) return str;
  if (!str) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

const safeParseInt = (value: any, defaultValue: number = 0): number => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Funzione generica per chiamate Airtable
async function airtableRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(`${AIRTABLE_API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Errore Airtable ${response.status}:`, errorData);
      throw new Error(`Errore Airtable: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Errore nella richiesta Airtable:', error);
    throw error;
  }
}

// SINTOMI - Basato sui campi visti negli screenshot
export async function getSintomi(): Promise<Sintomo[]> {
  try {
    const data = await airtableRequest('/sintomi');
    
    return data.records.map((record: any) => ({
      id: record.id,
      nome: record.fields.Nome || '',
      keywords: parseKeywordsArray(record.fields.Keywords || ''),
      categoria: record.fields.Categoria || '',
      urgenza: record.fields.Urgenza || 'Bassa',
      descrizione: record.fields.Descrizione || '',
      protocolliSuggeriti: parseCommaSeparatedString(record.fields.Protocolli_Suggeriti || ''),
    }));
  } catch (error) {
    console.error('Errore nel recupero sintomi:', error);
    return [];
  }
}

// PROTOCOLLI - Basato sui campi visti negli screenshot
export async function getProtocolli(): Promise<Protocollo[]> {
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

// FAQ - Basato sui campi visti negli screenshot
export async function getFaq(): Promise<FAQ[]> {
  try {
    const data = await airtableRequest('/FAQ');
    
    return data.records.map((record: any) => ({
      id: record.id,
      domanda: record.fields.Domanda || '',
      risposta: record.fields.Risposta || '',
      categoria: record.fields.Categoria || '',
      keywords: parseKeywordsArray(record.fields.Keywords || ''),
      importanza: safeParseInt(record.fields.Importanza),
      dataAggiornamento: record.fields.Data_Aggiornamento || '',
      protocolloCorrelato: record.fields.Protocollo_Correlato || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero FAQ:', error);
    return [];
  }
}

// DOCUMENTAZIONE - Basato sui campi visti negli screenshot
export async function getDocumentazione(): Promise<Documentazione[]> {
  try {
    const data = await airtableRequest('/documentazione');
    
    return data.records.map((record: any) => ({
      id: record.id,
      titolo: record.fields.Titolo || '',
      categoria: record.fields.Categoria || '',
      contenuto: record.fields.Contenuto || '',
      fileUrl: record.fields.File_URL || '',
      tags: parseCommaSeparatedString(record.fields.Tags || ''),
    }));
  } catch (error) {
    console.error('Errore nel recupero documentazione:', error);
    return [];
  }
}

// TESTIMONIANZE - Nomi campi standard
export async function getTestimonianze(): Promise<Testimonianza[]> {
  try {
    const data = await airtableRequest('/testimonianze');
    
    return data.records.map((record: any) => ({
      id: record.id,
      patologia: record.fields.Patologia || '',
      trattamentoUsato: record.fields.Trattamento_Usato || '',
      durataTrattamento: record.fields.Durata_Trattamento || '',
      risultati: record.fields.Risultati || '',
      etaPaziente: record.fields.Eta_Paziente || '',
      noteAnonime: record.fields.Note_Anonime || '',
      efficacia: safeParseInt(record.fields.Efficacia),
      dataTestimonianza: record.fields.Data_Testimonianza || '',
      protocolloUtilizzato: record.fields.Protocollo_Utilizzato || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero testimonianze:', error);
    return [];
  }
}

// RICERCHE SCIENTIFICHE - Basato sui campi visti negli screenshot
export async function getRicerche(): Promise<RicercaScientifica[]> {
  try {
    const data = await airtableRequest('/ricerche');
    
    return data.records.map((record: any) => ({
      id: record.id,
      titoloStudio: record.fields.Titolo || '',
      sostanza: record.fields.Sostanza || '',
      linkDoi: record.fields.Link_DOI || '',
      riassunto: record.fields.Riassunto || '',
      anno: record.fields.Anno || '',
      rivista: record.fields.Rivista || '',
      importanza: safeParseInt(record.fields.Importanza),
      categoria: record.fields.Categoria || '',
      risultatiPrincipali: record.fields.Risultati_Principali || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero ricerche:', error);
    return [];
  }
}

// DOSAGGI - Basato sui campi visti negli screenshot
export async function getDosaggi(): Promise<Dosaggio[]> {
  try {
    const data = await airtableRequest('/dosaggi');
    
    return data.records.map((record: any) => ({
      id: record.id,
      patologia: record.fields.Patologia || '',
      pesoPaziente: record.fields.Peso_Paziente || '',
      dosaggioCds: record.fields.Dosaggio_CDS || '',
      dosaggioBluMetilene: record.fields.Dosaggio_Blu_Metilene || '',
      formulaCalcolo: record.fields.Formula_Calcolo || '',
      noteSicurezza: record.fields.Note_Sicurezza || '',
      frequenza: record.fields.Frequenza || '',
      durataMax: record.fields.Durata_Max || '',
      protocolloRef: record.fields.Protocollo_Ref || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero dosaggi:', error);
    return [];
  }
}

// RICERCA UNIFICATA
export async function searchAllData(query: string): Promise<{
  protocolli: Protocollo[];
  sintomi: Sintomo[];
  documentazione: Documentazione[];
  testimonianze: Testimonianza[];
  ricerche: RicercaScientifica[];
  faq: FAQ[];
  dosaggi: Dosaggio[];
}> {
  try {
    // Ricerca parallela in tutte le tabelle con gestione errori
    const [protocolli, sintomi, documentazione, testimonianze, ricerche, faq, dosaggi] = await Promise.allSettled([
      getProtocolli(),
      getSintomi(),
      getDocumentazione(),
      getTestimonianze(),
      getRicerche(),
      getFaq(),
      getDosaggi()
    ]);

    // Filtra i risultati per query
    const lowerQuery = query.toLowerCase();
    
    return {
      protocolli: protocolli.status === 'fulfilled' ? 
        protocolli.value.filter(p => 
          p.nome.toLowerCase().includes(lowerQuery) ||
          p.descrizione.toLowerCase().includes(lowerQuery) ||
          p.sintomiCorrelati.some(s => s.toLowerCase().includes(lowerQuery))
        ) : [],
      sintomi: sintomi.status === 'fulfilled' ?
        sintomi.value.filter(s => 
          s.nome.toLowerCase().includes(lowerQuery) ||
          s.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
          s.descrizione.toLowerCase().includes(lowerQuery)
        ) : [],
      documentazione: documentazione.status === 'fulfilled' ? 
        documentazione.value.filter(doc => 
          doc.titolo.toLowerCase().includes(lowerQuery) ||
          doc.contenuto.toLowerCase().includes(lowerQuery) ||
          doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        ) : [],
      testimonianze: testimonianze.status === 'fulfilled' ?
        testimonianze.value.filter(test =>
          test.patologia.toLowerCase().includes(lowerQuery) ||
          test.risultati.toLowerCase().includes(lowerQuery)
        ) : [],
      ricerche: ricerche.status === 'fulfilled' ?
        ricerche.value.filter(ric =>
          ric.titoloStudio.toLowerCase().includes(lowerQuery) ||
          ric.riassunto.toLowerCase().includes(lowerQuery) ||
          ric.sostanza.toLowerCase().includes(lowerQuery)
        ) : [],
      faq: faq.status === 'fulfilled' ?
        faq.value.filter(f =>
          f.domanda.toLowerCase().includes(lowerQuery) ||
          f.risposta.toLowerCase().includes(lowerQuery) ||
          f.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))
        ) : [],
      dosaggi: dosaggi.status === 'fulfilled' ?
        dosaggi.value.filter(dos =>
          dos.patologia.toLowerCase().includes(lowerQuery) ||
          dos.formulaCalcolo.toLowerCase().includes(lowerQuery)
        ) : []
    };
  } catch (error) {
    console.error('Errore nella ricerca generale:', error);
    return {
      protocolli: [],
      sintomi: [],
      documentazione: [],
      testimonianze: [],
      ricerche: [],
      faq: [],
      dosaggi: []
    };
  }
}

// Formatta dati per Claude AI
export function formatDataForClaude(data: {
  protocolli: Protocollo[];
  sintomi: Sintomo[];
  documentazione: Documentazione[];
  testimonianze: Testimonianza[];
  ricerche: RicercaScientifica[];
  faq: FAQ[];
  dosaggi: Dosaggio[];
}): string {
  let formattedData = "=== DATABASE CDS WELLNESS COMPLETO ===\n\n";
  
  // Protocolli
  if (data.protocolli.length > 0) {
    formattedData += "PROTOCOLLI DISPONIBILI:\n";
    data.protocolli.forEach((p, index) => {
      formattedData += `${index + 1}. ${p.nome}\n`;
      formattedData += `   • Descrizione: ${p.descrizione}\n`;
      formattedData += `   • Dosaggio: ${p.dosaggio}\n`;
      formattedData += `   • Efficacia: ${p.efficacia}/10\n`;
      if (p.note) formattedData += `   • Note: ${p.note}\n`;
      formattedData += "\n";
    });
  }
  
  // Sintomi correlati
  if (data.sintomi.length > 0) {
    formattedData += "SINTOMI E CORRELAZIONI:\n";
    data.sintomi.forEach((s, index) => {
      formattedData += `${index + 1}. ${s.nome} (${s.categoria} - Urgenza: ${s.urgenza})\n`;
      formattedData += `   • ${s.descrizione}\n`;
      if (s.protocolliSuggeriti.length > 0) {
        formattedData += `   • Protocolli suggeriti: ${s.protocolliSuggeriti.join(', ')}\n`;
      }
      formattedData += "\n";
    });
  }
  
  // FAQ pertinenti
  if (data.faq.length > 0) {
    formattedData += "FAQ RILEVANTI:\n";
    data.faq.slice(0, 3).forEach((f, index) => {
      formattedData += `${index + 1}. ${f.domanda}\n`;
      formattedData += `   Risposta: ${f.risposta}\n\n`;
    });
  }
  
  // Testimonianze
  if (data.testimonianze.length > 0) {
    formattedData += "TESTIMONIANZE CORRELATE:\n";
    data.testimonianze.slice(0, 2).forEach((t, index) => {
      formattedData += `${index + 1}. ${t.patologia} - ${t.trattamentoUsato}\n`;
      formattedData += `   • Risultati: ${t.risultati}\n`;
      formattedData += `   • Efficacia: ${t.efficacia}/10\n\n`;
    });
  }
  
  // Ricerche scientifiche
  if (data.ricerche.length > 0) {
    formattedData += "EVIDENZE SCIENTIFICHE:\n";
    data.ricerche.slice(0, 2).forEach((r, index) => {
      formattedData += `${index + 1}. ${r.titoloStudio} (${r.anno})\n`;
      formattedData += `   • Sostanza: ${r.sostanza}\n`;
      formattedData += `   • Risultati: ${r.risultatiPrincipali}\n\n`;
    });
  }
  
  // Dosaggi specifici
  if (data.dosaggi.length > 0) {
    formattedData += "DOSAGGI CALCOLATI:\n";
    data.dosaggi.slice(0, 2).forEach((d, index) => {
      formattedData += `${index + 1}. ${d.patologia}\n`;
      formattedData += `   • CDS: ${d.dosaggioCds}\n`;
      formattedData += `   • Blu Metilene: ${d.dosaggioBluMetilene}\n`;
      formattedData += `   • Frequenza: ${d.frequenza}\n`;
      formattedData += `   • Sicurezza: ${d.noteSicurezza}\n\n`;
    });
  }
  
  return formattedData;
}

// Test connessione Airtable migliorato
export async function checkAirtableConnection(): Promise<{
  connected: boolean;
  tablesAvailable: string[];
  errors: string[];
  details: Record<string, any>;
}> {
  const tables = ['sintomi', 'protocolli', 'FAQ', 'documentazione', 'testimonianze', 'ricerche', 'dosaggi'];
  const errors: string[] = [];
  const available: string[] = [];
  const details: Record<string, any> = {};
  
  console.log('🔄 Testing Airtable connection...');
  console.log('Base ID:', AIRTABLE_BASE_ID);
  console.log('API Key exists:', !!AIRTABLE_API_KEY);
  
  for (const table of tables) {
    try {
      console.log(`Testing table: ${table}`);
      const response = await airtableRequest(`/${table}?maxRecords=1`);
      available.push(table);
      details[table] = {
        recordCount: response.records?.length || 0,
        fields: response.records?.[0]?.fields ? Object.keys(response.records[0].fields) : []
      };
      console.log(`✅ ${table}: OK`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      errors.push(`${table}: ${errorMsg}`);
      console.log(`❌ ${table}: ${errorMsg}`);
    }
  }
  
  return {
    connected: available.length > 0,
    tablesAvailable: available,
    errors,
    details
  };
}

// Cache semplice per prestazioni
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti

export async function getCachedData<T>(fetcher: () => Promise<T>, key: string): Promise<T> {
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
    // Se abbiamo dati in cache anche scaduti, usiamoli come fallback
    if (cached) {
      console.log(`Using stale cache for ${key}`);
      return cached.data;
    }
    throw error;
  }
}