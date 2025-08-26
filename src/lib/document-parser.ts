// src/lib/document-parser.ts

// Interfacce per i documenti
export interface DocumentMetadata {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'doc' | 'xlsx' | 'xls' | 'txt';
  size: number;
  modifiedTime: string;
  url: string;
  content?: string;
  extractedText?: string;
  wordCount?: number;
  lastProcessed?: Date;
  keywords?: string[];
}

export interface DocumentSearchResult {
  document: DocumentMetadata;
  relevantSections: string[];
  matchScore: number;
}

export interface ParsedDocument {
  metadata: DocumentMetadata;
  content: string;
  sections: string[];
  keywords: string[];
  summary: string;
}

// Cache client-side per ridurre richieste API
class ClientCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minuti per cache client

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(), 
      ttl 
    });
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
}

const clientCache = new ClientCache();

// Health check per Google Drive
export async function checkGoogleDriveConnection(): Promise<{
  connected: boolean;
  documentsFound: number;
  supportedTypes: string[];
  errors: string[];
}> {
  const cacheKey = 'drive-health-check';
  const cached = clientCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch('/api/drive', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    // Cache per 2 minuti
    clientCache.set(cacheKey, result, 2 * 60 * 1000);
    
    return result;
    
  } catch (error) {
    const errorResult = {
      connected: false,
      documentsFound: 0,
      supportedTypes: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'txt'],
      errors: [error instanceof Error ? error.message : 'Errore sconosciuto']
    };
    
    return errorResult;
  }
}

// Cerca nei documenti
export async function searchDocuments(query: string): Promise<DocumentSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cacheKey = `search-${query.toLowerCase().trim()}`;
  const cached = clientCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch('/api/drive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query.trim() })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const results = await response.json();
    
    // Cache per 3 minuti
    clientCache.set(cacheKey, results, 3 * 60 * 1000);
    
    return results;
    
  } catch (error) {
    console.error('Errore nella ricerca documenti:', error);
    return [];
  }
}

// Formatta documenti per l'AI
export function formatDocumentsForAI(documents: ParsedDocument[], query?: string): string {
  if (documents.length === 0) {
    return "Nessun documento trovato nel Google Drive.";
  }
  
  let formatted = "=== DOCUMENTI DAL GOOGLE DRIVE ===\n\n";
  
  documents.slice(0, 5).forEach((doc, index) => {
    formatted += `${index + 1}. DOCUMENTO: ${doc.metadata.name}\n`;
    formatted += `   Tipo: ${doc.metadata.type.toUpperCase()}\n`;
    formatted += `   Dimensione: ${doc.metadata.wordCount || 'N/A'} parole\n`;
    formatted += `   Modificato: ${new Date(doc.metadata.modifiedTime).toLocaleDateString('it-IT')}\n`;
    
    if (doc.keywords && doc.keywords.length > 0) {
      formatted += `   Keywords: ${doc.keywords.slice(0, 8).join(', ')}\n`;
    }
    
    formatted += `   Riassunto: ${doc.summary}\n`;
    
    // Aggiungi contenuto rilevante
    if (query && doc.content) {
      const relevantContent = extractRelevantContent(doc.content, query);
      if (relevantContent) {
        formatted += `   Contenuto rilevante:\n   ${relevantContent}\n`;
      }
    } else if (doc.content) {
      // Primi 400 caratteri del contenuto
      const preview = doc.content.substring(0, 400).replace(/\n/g, ' ').trim();
      formatted += `   Anteprima: ${preview}${doc.content.length > 400 ? '...' : ''}\n`;
    }
    
    formatted += "\n";
  });
  
  if (documents.length > 5) {
    formatted += `... e altri ${documents.length - 5} documenti disponibili.\n`;
  }
  
  return formatted;
}

// Estrai contenuto rilevante basato sulla query
function extractRelevantContent(content: string, query: string): string {
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const relevantSentences = sentences.filter(sentence => 
    queryWords.some(word => sentence.toLowerCase().includes(word))
  ).slice(0, 3);
  
  return relevantSentences.join('. ').substring(0, 500) + 
    (relevantSentences.join('. ').length > 500 ? '...' : '');
}

// Funzioni di compatibilità per mantenere l'API esistente
export async function getAllDocuments(): Promise<ParsedDocument[]> {
  // Per ora ritorna array vuoto, potremmo implementare se necessario
  return [];
}

export async function parseDocument(metadata: DocumentMetadata): Promise<ParsedDocument> {
  // Versione semplificata per compatibilità
  return {
    metadata,
    content: metadata.content || '',
    sections: [],
    keywords: metadata.keywords || [],
    summary: `Documento: ${metadata.name}`
  };
}