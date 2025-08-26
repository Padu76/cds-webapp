// src/lib/airtable.ts

// Interfacce complete per tutte le tabelle
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

// Configurazione Airtable
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Utility functions
const parseCommaSeparatedString = (str: string): string[] => {
  if (!str) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

const safeParseInt = (value: any, defaultValue: number = 0): number => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Funzione generica per chiamate Airtable con retry
async function airtableRequest(endpoint: string, options: RequestInit = {}, retries: number = 3): Promise<any> {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Credenziali Airtable mancanti. Controlla le variabili d\'ambiente NEXT_PUBLIC_AIRTABLE_BASE_ID e NEXT_PUBLIC_AIRTABLE_API_KEY.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
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
        
        // Se è l'ultimo tentativo o non è un errore temporaneo, lancia l'errore
        if (attempt === retries || response.status < 500) {
          throw new Error(
            `Errore Airtable: ${response.status} ${response.statusText}. ${
              errorData.error?.message || 'Errore sconosciuto'
            }`
          );
        }
        
        // Attendi prima del prossimo tentativo
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      return response.json();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// PROTOCOLLI
export async function getProtocolli(): Promise<Protocollo[]> {
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
    throw error;
  }
}

// SINTOMI  
export async function getSintomi(): Promise<Sintomo[]> {
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
    throw error;
  }
}

// DOCUMENTAZIONE
export async function getDocumentazione(): Promise<Documentazione[]> {
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
    throw error;
  }
}

// TESTIMONIANZE
export async function getTestimonianze(): Promise<Testimonianza[]> {
  try {
    const data = await airtableRequest('/testimonianze');
    
    return data.records.map((record: any) => ({
      id: record.id,
      patologia: record.fields.Patologia || record.fields.patologia || '',
      trattamentoUsato: record.fields.Trattamento_Usato || record.fields.trattamento_usato || '',
      durataTrattamento: record.fields.Durata_Trattamento || record.fields.durata_trattamento || '',
      risultati: record.fields.Risultati || record.fields.risultati || '',
      etaPaziente: record.fields.Età_Paziente || record.fields.eta_paziente || '',
      noteAnonime: record.fields.Note_Anonime || record.fields.note_anonime || '',
      efficacia: safeParseInt(record.fields.Efficacia || record.fields.efficacia),
      dataTestimonianza: record.fields.Data_Testimonianza || record.fields.data_testimonianza || '',
      protocolloUtilizzato: record.fields.Protocollo_Utilizzato || record.fields.protocollo_utilizzato || '',
    }));
  } catch (error) {
    console.error('Errore nel recupero testimonianze:', error);
    throw error;
  }
}

// RICERCHE SCIENTIFICHE
export async function getRicerche(): Promise<RicercaScientifica[]> {
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
    throw error;
  }
}

// FAQ
export async function getFaq(): Promise<FAQ[]> {
  try {
    const data = await airtableRequest('/faq');
    
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
    throw error;
  }
}

// DOSAGGI
export async function getDosaggi(): Promise<Dosaggio[]> {
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
    throw error;
  }
}

// FUNZIONI DI RICERCA
export async function searchProtocolli(query: string): Promise<Protocollo[]> {
  try {
    const lowerQuery = query.toLowerCase();
    const searchFormula = `OR(
      SEARCH("${lowerQuery}", LOWER({Nome})),
      SEARCH("${lowerQuery}", LOWER({Descrizione})),
      SEARCH("${lowerQuery}", LOWER({Note}))
    )`;
    
    const data = await airtableRequest(`/protocolli?filterByFormula=${encodeURIComponent(searchFormula)}`);
    
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
    console.error('Errore nella ricerca protocolli:', error);
    return [];
  }
}

export async function searchSintomi(query: string): Promise<Sintomo[]> {
  try {
    const lowerQuery = query.toLowerCase();
    const searchFormula = `OR(
      SEARCH("${lowerQuery}", LOWER({Nome})),
      SEARCH("${lowerQuery}", LOWER({Keywords})),
      SEARCH("${lowerQuery}", LOWER({Descrizione}))
    )`;
    
    const data = await airtableRequest(`/sintomi?filterByFormula=${encodeURIComponent(searchFormula)}`);
    
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
    return [];
  }
}

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
    // Ricerca parallela in tutte le tabelle
    const [protocolli, sintomi, documentazione, testimonianze, ricerche, faq, dosaggi] = await Promise.allSettled([
      searchProtocolli(query),
      searchSintomi(query),
      getDocumentazione(),
      getTestimonianze(),
      getRicerche(),
      getFaq(),
      getDosaggi()
    ]);

    // Filtra i risultati per query
    const lowerQuery = query.toLowerCase();
    
    return {
      protocolli: protocolli.status === 'fulfilled' ? protocolli.value : [],
      sintomi: sintomi.status === 'fulfilled' ? sintomi.value : [],
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

// Cache system migliorato
class EnhancedCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  
  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  size() {
    return this.cache.size;
  }
}

export const cache = new EnhancedCache();

// Funzioni con caching
export async function getCachedData(type: string): Promise<any[]> {
  const cacheKey = `data-${type}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  let data;
  switch (type) {
    case 'protocolli':
      data = await getProtocolli();
      break;
    case 'sintomi':
      data = await getSintomi();
      break;
    case 'documentazione':
      data = await getDocumentazione();
      break;
    case 'testimonianze':
      data = await getTestimonianze();
      break;
    case 'ricerche':
      data = await getRicerche();
      break;
    case 'faq':
      data = await getFaq();
      break;
    case 'dosaggi':
      data = await getDosaggi();
      break;
    default:
      data = [];
  }
  
  cache.set(cacheKey, data);
  return data;
}

// Formatta dati per AI con tutte le tabelle
export function formatDataForAI(data: {
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
    formattedData += "📋 PROTOCOLLI DISPONIBILI:\n";
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
    formattedData += "🔍 SINTOMI E CORRELAZIONI:\n";
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
    formattedData += "❓ FAQ RILEVANTI:\n";
    data.faq.slice(0, 3).forEach((f, index) => {
      formattedData += `${index + 1}. ${f.domanda}\n`;
      formattedData += `   Risposta: ${f.risposta}\n\n`;
    });
  }
  
  // Testimonianze
  if (data.testimonianze.length > 0) {
    formattedData += "💬 TESTIMONIANZE CORRELATE:\n";
    data.testimonianze.slice(0, 2).forEach((t, index) => {
      formattedData += `${index + 1}. ${t.patologia} - ${t.trattamentoUsato}\n`;
      formattedData += `   • Risultati: ${t.risultati}\n`;
      formattedData += `   • Efficacia: ${t.efficacia}/10\n\n`;
    });
  }
  
  // Ricerche scientifiche
  if (data.ricerche.length > 0) {
    formattedData += "🧪 EVIDENZE SCIENTIFICHE:\n";
    data.ricerche.slice(0, 2).forEach((r, index) => {
      formattedData += `${index + 1}. ${r.titoloStudio} (${r.anno})\n`;
      formattedData += `   • Sostanza: ${r.sostanza}\n`;
      formattedData += `   • Risultati: ${r.risultatiPrincipali}\n\n`;
    });
  }
  
  // Dosaggi specifici
  if (data.dosaggi.length > 0) {
    formattedData += "⚖️ DOSAGGI CALCOLATI:\n";
    data.dosaggi.slice(0, 2).forEach((d, index) => {
      formattedData += `${index + 1}. ${d.patologia}\n`;
      formattedData += `   • CDS: ${d.dosaggioCds}\n`;
      formattedData += `   • Blu Metilene: ${d.dosaggioBluMetilene}\n`;
      formattedData += `   • Frequenza: ${d.frequenza}\n`;
      formattedData += `   • Sicurezza: ${d.noteSicurezza}\n\n`;
    });
  }
  
  // Documentazione
  if (data.documentazione.length > 0) {
    formattedData += "📚 DOCUMENTAZIONE:\n";
    data.documentazione.slice(0, 2).forEach((doc, index) => {
      formattedData += `${index + 1}. ${doc.titolo} (${doc.categoria})\n`;
      formattedData += `   • ${doc.contenuto.substring(0, 150)}...\n\n`;
    });
  }
  
  return formattedData;
}

// Health check function
export async function checkAirtableConnection(): Promise<{
  connected: boolean;
  tablesAvailable: string[];
  errors: string[];
}> {
  const tables = ['protocolli', 'sintomi', 'documentazione', 'testimonianze', 'ricerche', 'faq', 'dosaggi'];
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