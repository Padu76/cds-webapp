// src/lib/airtable.ts

// Interfaces basate sui tuoi CSV
export interface Protocollo {
  id: string;
  nome: string;
  sostanza: string;
  categoria: string;
  descrizione: string;
  dosaggio: string;
  sintomiCorrelati: string[];
  pdfUrl: string;
  efficacia: number;
  note: string;
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

export interface Documentazione {
  id: string;
  titolo: string;
  categoria: string;
  contenuto: string;
  fileUrl: string;
  tags: string[];
}

// Configurazione Airtable
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Headers per le chiamate API
const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Utility per parsing delle stringhe separate da virgola
const parseCommaSeparatedString = (str: string): string[] => {
  if (!str) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

// Funzione generica per chiamate Airtable
async function airtableRequest(endpoint: string, options: RequestInit = {}) {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Credenziali Airtable mancanti. Controlla le variabili d\'ambiente.');
  }

  const response = await fetch(`${AIRTABLE_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Errore Airtable: ${response.status} ${response.statusText}. ${
        errorData.error?.message || 'Errore sconosciuto'
      }`
    );
  }

  return response.json();
}

// PROTOCOLLI
export async function getProtocolli(): Promise<Protocollo[]> {
  try {
    const data = await airtableRequest('/Protocolli');
    
    return data.records.map((record: any) => ({
      id: record.id,
      nome: record.fields.Nome || '',
      sostanza: record.fields.Sostanza || '',
      categoria: record.fields.Categoria || '',
      descrizione: record.fields.Descrizione || '',
      dosaggio: record.fields.Dosaggio || '',
      sintomiCorrelati: parseCommaSeparatedString(record.fields.Sintomi_Correlati || ''),
      pdfUrl: record.fields.PDF_URL || '',
      efficacia: record.fields.Efficacia || 0,
      note: record.fields.Note || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero protocolli:', error);
    throw error;
  }
}

export async function getProtocolloById(id: string): Promise<Protocollo | null> {
  try {
    const data = await airtableRequest(`/Protocolli/${id}`);
    
    return {
      id: data.id,
      nome: data.fields.Nome || '',
      sostanza: data.fields.Sostanza || '',
      categoria: data.fields.Categoria || '',
      descrizione: data.fields.Descrizione || '',
      dosaggio: data.fields.Dosaggio || '',
      sintomiCorrelati: parseCommaSeparatedString(data.fields.Sintomi_Correlati || ''),
      pdfUrl: data.fields.PDF_URL || '',
      efficacia: data.fields.Efficacia || 0,
      note: data.fields.Note || '',
    };
  } catch (error) {
    console.error('Errore nel recupero protocollo:', error);
    return null;
  }
}

export async function searchProtocolli(query: string): Promise<Protocollo[]> {
  try {
    const searchFormula = `OR(
      SEARCH("${query}", LOWER({Nome})),
      SEARCH("${query}", LOWER({Descrizione})),
      SEARCH("${query}", LOWER({Categoria})),
      SEARCH("${query}", LOWER({Sostanza}))
    )`;
    
    const data = await airtableRequest(`/Protocolli?filterByFormula=${encodeURIComponent(searchFormula)}`);
    
    return data.records.map((record: any) => ({
      id: record.id,
      nome: record.fields.Nome || '',
      sostanza: record.fields.Sostanza || '',
      categoria: record.fields.Categoria || '',
      descrizione: record.fields.Descrizione || '',
      dosaggio: record.fields.Dosaggio || '',
      sintomiCorrelati: parseCommaSeparatedString(record.fields.Sintomi_Correlati || ''),
      pdfUrl: record.fields.PDF_URL || '',
      efficacia: record.fields.Efficacia || 0,
      note: record.fields.Note || '',
    }));
  } catch (error) {
    console.error('Errore nella ricerca protocolli:', error);
    throw error;
  }
}

// SINTOMI
export async function getSintomi(): Promise<Sintomo[]> {
  try {
    const data = await airtableRequest('/Sintomi');
    
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
    console.error('Errore nel recupero sintomi:', error);
    throw error;
  }
}

export async function searchSintomi(query: string): Promise<Sintomo[]> {
  try {
    const searchFormula = `OR(
      SEARCH("${query}", LOWER({Nome})),
      SEARCH("${query}", LOWER({Keywords})),
      SEARCH("${query}", LOWER({Descrizione})),
      SEARCH("${query}", LOWER({Categoria}))
    )`;
    
    const data = await airtableRequest(`/Sintomi?filterByFormula=${encodeURIComponent(searchFormula)}`);
    
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
    console.error('Errore nella ricerca sintomi:', error);
    throw error;
  }
}

// DOCUMENTAZIONE
export async function getDocumentazione(): Promise<Documentazione[]> {
  try {
    const data = await airtableRequest('/Documentazione');
    
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
    throw error;
  }
}

export async function searchDocumentazione(query: string): Promise<Documentazione[]> {
  try {
    const searchFormula = `OR(
      SEARCH("${query}", LOWER({Titolo})),
      SEARCH("${query}", LOWER({Contenuto})),
      SEARCH("${query}", LOWER({Tags})),
      SEARCH("${query}", LOWER({Categoria}))
    )`;
    
    const data = await airtableRequest(`/Documentazione?filterByFormula=${encodeURIComponent(searchFormula)}`);
    
    return data.records.map((record: any) => ({
      id: record.id,
      titolo: record.fields.Titolo || '',
      categoria: record.fields.Categoria || '',
      contenuto: record.fields.Contenuto || '',
      fileUrl: record.fields.File_URL || '',
      tags: parseCommaSeparatedString(record.fields.Tags || ''),
    }));
  } catch (error) {
    console.error('Errore nella ricerca documentazione:', error);
    throw error;
  }
}

// FUNZIONI COMBINATE PER AI

// Trova protocolli per sintomi specifici
export async function getProtocolliPerSintomi(sintomi: string[]): Promise<Protocollo[]> {
  try {
    const allProtocolli = await getProtocolli();
    const protocolliCorrelati = allProtocolli.filter(protocollo => 
      sintomi.some(sintomo => 
        protocollo.sintomiCorrelati.some(correlato => 
          correlato.toLowerCase().includes(sintomo.toLowerCase())
        )
      )
    );
    
    return protocolliCorrelati;
  } catch (error) {
    console.error('Errore nella ricerca protocolli per sintomi:', error);
    throw error;
  }
}

// Ricerca generale per AI (protocolli + sintomi + documentazione)
export async function searchAllData(query: string): Promise<{
  protocolli: Protocollo[];
  sintomi: Sintomo[];
  documentazione: Documentazione[];
}> {
  try {
    const [protocolli, sintomi, documentazione] = await Promise.all([
      searchProtocolli(query),
      searchSintomi(query),
      searchDocumentazione(query)
    ]);
    
    return {
      protocolli,
      sintomi,
      documentazione
    };
  } catch (error) {
    console.error('Errore nella ricerca generale:', error);
    throw error;
  }
}

// Cache semplice per performance
class SimpleCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl = 5 * 60 * 1000; // 5 minuti

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();

// Funzioni con caching
export async function getCachedProtocolli(): Promise<Protocollo[]> {
  const cacheKey = 'protocolli';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await getProtocolli();
  cache.set(cacheKey, data);
  return data;
}

export async function getCachedSintomi(): Promise<Sintomo[]> {
  const cacheKey = 'sintomi';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await getSintomi();
  cache.set(cacheKey, data);
  return data;
}

export async function getCachedDocumentazione(): Promise<Documentazione[]> {
  const cacheKey = 'documentazione';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await getDocumentazione();
  cache.set(cacheKey, data);
  return data;
}

// Utility per formattare dati per AI
export function formatDataForAI(data: {
  protocolli: Protocollo[];
  sintomi: Sintomo[];
  documentazione: Documentazione[];
}): string {
  let formattedData = "DATABASE CDS WELLNESS:\n\n";
  
  // Protocolli
  if (data.protocolli.length > 0) {
    formattedData += "PROTOCOLLI:\n";
    data.protocolli.forEach(p => {
      formattedData += `- ${p.nome} (${p.sostanza})\n`;
      formattedData += `  Categoria: ${p.categoria}\n`;
      formattedData += `  Descrizione: ${p.descrizione}\n`;
      formattedData += `  Dosaggio: ${p.dosaggio}\n`;
      formattedData += `  Efficacia: ${p.efficacia}/10\n`;
      if (p.note) formattedData += `  Note: ${p.note}\n`;
      formattedData += "\n";
    });
  }
  
  // Sintomi
  if (data.sintomi.length > 0) {
    formattedData += "SINTOMI:\n";
    data.sintomi.forEach(s => {
      formattedData += `- ${s.nome} (${s.categoria})\n`;
      formattedData += `  Urgenza: ${s.urgenza}\n`;
      formattedData += `  Descrizione: ${s.descrizione}\n`;
      formattedData += `  Protocolli suggeriti: ${s.protocolliSuggeriti.join(', ')}\n`;
      formattedData += "\n";
    });
  }
  
  // Documentazione
  if (data.documentazione.length > 0) {
    formattedData += "DOCUMENTAZIONE:\n";
    data.documentazione.forEach(d => {
      formattedData += `- ${d.titolo} (${d.categoria})\n`;
      formattedData += `  Contenuto: ${d.contenuto.substring(0, 200)}...\n`;
      formattedData += `  Tags: ${d.tags.join(', ')}\n`;
      formattedData += "\n";
    });
  }
  
  return formattedData;
}