// src/lib/document-parser.ts

import { google } from 'googleapis';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

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

// Configurazione Google Drive
const GOOGLE_DRIVE_CONFIG = {
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
};

// Tipi di file supportati
const SUPPORTED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'text/plain': 'txt'
} as const;

// Cache avanzata per documenti
class DocumentCache {
  private cache = new Map<string, { data: ParsedDocument; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 ore

  set(key: string, data: ParsedDocument, ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(), 
      ttl 
    });
  }

  get(key: string): ParsedDocument | null {
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

  size() {
    return this.cache.size;
  }

  // Rimuovi documenti scaduti
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const documentCache = new DocumentCache();

// Inizializza client Google Drive
function createDriveClient() {
  if (!GOOGLE_DRIVE_CONFIG.serviceAccountEmail || !GOOGLE_DRIVE_CONFIG.privateKey) {
    throw new Error('Credenziali Google Drive mancanti. Verifica GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_DRIVE_CONFIG.serviceAccountEmail,
      private_key: GOOGLE_DRIVE_CONFIG.privateKey,
    },
    scopes: GOOGLE_DRIVE_CONFIG.scopes,
  });

  return google.drive({ version: 'v3', auth });
}

// Ottieni lista documenti dalla cartella
export async function getDocumentsFromDrive(): Promise<DocumentMetadata[]> {
  try {
    const drive = createDriveClient();
    
    if (!GOOGLE_DRIVE_CONFIG.folderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID non configurato.');
    }

    const mimeTypes = Object.keys(SUPPORTED_MIME_TYPES);
    const mimeTypeQuery = mimeTypes.map(mime => `mimeType='${mime}'`).join(' or ');
    
    const response = await drive.files.list({
      q: `'${GOOGLE_DRIVE_CONFIG.folderId}' in parents and (${mimeTypeQuery}) and trashed=false`,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 50
    });

    const files = response.data.files || [];
    
    return files.map(file => ({
      id: file.id!,
      name: file.name!,
      type: SUPPORTED_MIME_TYPES[file.mimeType as keyof typeof SUPPORTED_MIME_TYPES],
      size: parseInt(file.size || '0'),
      modifiedTime: file.modifiedTime!,
      url: file.webViewLink!
    }));

  } catch (error) {
    console.error('Errore nel recupero documenti da Google Drive:', error);
    throw new Error(`Impossibile accedere a Google Drive: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }
}

// Scarica contenuto file da Google Drive
async function downloadFileContent(fileId: string): Promise<Buffer> {
  const drive = createDriveClient();
  
  try {
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'arraybuffer' });

    return Buffer.from(response.data as ArrayBuffer);
  } catch (error) {
    console.error(`Errore nel download del file ${fileId}:`, error);
    throw new Error(`Download fallito: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }
}

// Parser per PDF - Usa libreria esterna se disponibile
async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    // Placeholder - in produzione useresti pdf-parse o simile
    // const pdfParse = require('pdf-parse');
    // const data = await pdfParse(buffer);
    // return data.text;
    
    // Per ora ritorna placeholder
    return `[CONTENUTO PDF ESTRATTO]\nQuesto è un placeholder per il contenuto PDF.\nIn produzione, il testo completo del PDF sarà estratto qui.\nDimensione file: ${buffer.length} bytes`;
  } catch (error) {
    console.error('Errore nel parsing PDF:', error);
    return `[ERRORE ESTRAZIONE PDF: ${error instanceof Error ? error.message : 'Sconosciuto'}]`;
  }
}

// Parser per documenti Word
async function parseWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '[Documento Word vuoto]';
  } catch (error) {
    console.error('Errore nel parsing Word:', error);
    return `[ERRORE ESTRAZIONE WORD: ${error instanceof Error ? error.message : 'Sconosciuto'}]`;
  }
}

// Parser per Excel
async function parseExcel(buffer: Buffer): Promise<string> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let extractedText = '';

    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
      
      extractedText += `\n=== FOGLIO: ${sheetName} ===\n`;
      
      data.forEach((row: any) => {
        if (Array.isArray(row) && row.some(cell => cell && cell.toString().trim())) {
          extractedText += row.join(' | ') + '\n';
        }
      });
    });

    return extractedText || '[Documento Excel vuoto]';
  } catch (error) {
    console.error('Errore nel parsing Excel:', error);
    return `[ERRORE ESTRAZIONE EXCEL: ${error instanceof Error ? error.message : 'Sconosciuto'}]`;
  }
}

// Parser per file di testo
async function parseText(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Errore nel parsing testo:', error);
    return `[ERRORE ESTRAZIONE TESTO: ${error instanceof Error ? error.message : 'Sconosciuto'}]`;
  }
}

// Parser principale
export async function parseDocument(metadata: DocumentMetadata): Promise<ParsedDocument> {
  const cacheKey = `doc-${metadata.id}-${metadata.modifiedTime}`;
  const cached = documentCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const buffer = await downloadFileContent(metadata.id);
    let content = '';

    switch (metadata.type) {
      case 'pdf':
        content = await parsePdf(buffer);
        break;
      case 'docx':
      case 'doc':
        content = await parseWord(buffer);
        break;
      case 'xlsx':
      case 'xls':
        content = await parseExcel(buffer);
        break;
      case 'txt':
        content = await parseText(buffer);
        break;
      default:
        content = '[TIPO FILE NON SUPPORTATO]';
    }

    // Estrai sezioni e keywords
    const sections = extractSections(content);
    const keywords = extractKeywords(content);
    const summary = generateSummary(content, metadata.name);

    const parsedDoc: ParsedDocument = {
      metadata: {
        ...metadata,
        content,
        extractedText: content,
        wordCount: content.split(/\s+/).length,
        lastProcessed: new Date()
      },
      content,
      sections,
      keywords,
      summary
    };

    documentCache.set(cacheKey, parsedDoc);
    return parsedDoc;

  } catch (error) {
    console.error(`Errore nel parsing documento ${metadata.name}:`, error);
    
    const errorDoc: ParsedDocument = {
      metadata,
      content: `[ERRORE PARSING: ${error instanceof Error ? error.message : 'Sconosciuto'}]`,
      sections: [],
      keywords: [],
      summary: `Errore nel processing del documento ${metadata.name}`
    };

    return errorDoc;
  }
}

// Estrai sezioni dal testo
function extractSections(text: string): string[] {
  const sections = [];
  
  // Split per paragrafi
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  
  // Aggiungi sezioni basate su intestazioni
  const lines = text.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Rileva intestazioni (tutto maiuscolo, o inizia con numeri/punti)
    if (trimmed.length > 0 && (
      trimmed === trimmed.toUpperCase() && trimmed.length < 100 ||
      /^[\d\.\-\*\+]\s/.test(trimmed) ||
      trimmed.startsWith('=') && trimmed.endsWith('=')
    )) {
      if (currentSection.trim().length > 100) {
        sections.push(currentSection.trim());
      }
      currentSection = trimmed + '\n';
    } else {
      currentSection += line + '\n';
    }
  }
  
  if (currentSection.trim().length > 100) {
    sections.push(currentSection.trim());
  }

  return sections.length > 0 ? sections : paragraphs;
}

// Estrai keywords rilevanti
function extractKeywords(text: string): string[] {
  const keywords = new Set<string>();
  
  // Keywords specifiche per CDS/Blu di Metilene
  const relevantTerms = [
    'cds', 'diossido di cloro', 'blu di metilene', 'metilene', 'protocollo',
    'dosaggio', 'trattamento', 'terapia', 'patologia', 'sintomo', 'malattia',
    'infezione', 'virus', 'batterio', 'fungo', 'artrite', 'alzheimer',
    'cancro', 'tumore', 'infiammazione', 'ossidazione', 'antiossidante',
    'antimicrobico', 'neuroprotettivo', 'controindicazione', 'effetto collaterale',
    'sicurezza', 'ricerca', 'studio', 'clinico', 'testimonianza', 'risultato'
  ];

  const lowerText = text.toLowerCase();
  
  relevantTerms.forEach(term => {
    if (lowerText.includes(term)) {
      keywords.add(term);
    }
  });

  // Estrai termini tecnici (parole con maiuscole interne o numeri)
  const technicalTerms = text.match(/\b[A-Z][a-z]*[A-Z][a-z]*\b|\b[A-Za-z]*\d+[A-Za-z]*\b/g);
  if (technicalTerms) {
    technicalTerms.forEach(term => {
      if (term.length > 3) {
        keywords.add(term.toLowerCase());
      }
    });
  }

  return Array.from(keywords).slice(0, 20);
}

// Genera riassunto del documento
function generateSummary(content: string, fileName: string): string {
  const firstParagraph = content.split('\n\n')[0];
  const wordCount = content.split(/\s+/).length;
  const hasProtocolInfo = content.toLowerCase().includes('protocollo') || content.toLowerCase().includes('dosaggio');
  const hasResearch = content.toLowerCase().includes('ricerca') || content.toLowerCase().includes('studio');
  
  let summary = `Documento: ${fileName}\n`;
  summary += `Lunghezza: ${wordCount} parole\n`;
  
  if (hasProtocolInfo) {
    summary += "Contiene informazioni sui protocolli e dosaggi\n";
  }
  
  if (hasResearch) {
    summary += "Include contenuti di ricerca scientifica\n";
  }
  
  if (firstParagraph && firstParagraph.length > 50) {
    summary += `Estratto: ${firstParagraph.substring(0, 200)}...`;
  }

  return summary;
}

// Cerca nei documenti
export async function searchDocuments(query: string): Promise<DocumentSearchResult[]> {
  try {
    const documents = await getDocumentsFromDrive();
    const results: DocumentSearchResult[] = [];
    
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

    for (const doc of documents) {
      try {
        const parsed = await parseDocument(doc);
        const lowerContent = parsed.content.toLowerCase();
        
        let matchScore = 0;
        const relevantSections: string[] = [];
        
        // Cerca nel nome del file
        if (doc.name.toLowerCase().includes(lowerQuery)) {
          matchScore += 10;
        }
        
        // Cerca nelle keywords
        const matchingKeywords = parsed.keywords.filter(kw => 
          queryWords.some(qw => kw.includes(qw) || qw.includes(kw))
        );
        matchScore += matchingKeywords.length * 5;
        
        // Cerca nel contenuto
        queryWords.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = lowerContent.match(regex);
          if (matches) {
            matchScore += matches.length;
          }
        });
        
        // Estrai sezioni rilevanti
        parsed.sections.forEach(section => {
          const sectionLower = section.toLowerCase();
          const sectionMatches = queryWords.some(word => sectionLower.includes(word));
          
          if (sectionMatches) {
            relevantSections.push(section.substring(0, 300) + (section.length > 300 ? '...' : ''));
          }
        });
        
        if (matchScore > 0) {
          results.push({
            document: parsed.metadata,
            relevantSections,
            matchScore
          });
        }
        
      } catch (error) {
        console.error(`Errore nel processing documento ${doc.name}:`, error);
      }
    }
    
    return results.sort((a, b) => b.matchScore - a.matchScore);
    
  } catch (error) {
    console.error('Errore nella ricerca documenti:', error);
    return [];
  }
}

// Ottieni tutti i documenti processati
export async function getAllDocuments(): Promise<ParsedDocument[]> {
  try {
    const documents = await getDocumentsFromDrive();
    const parsedDocs: ParsedDocument[] = [];
    
    for (const doc of documents) {
      try {
        const parsed = await parseDocument(doc);
        parsedDocs.push(parsed);
      } catch (error) {
        console.error(`Errore nel processing documento ${doc.name}:`, error);
      }
    }
    
    return parsedDocs;
  } catch (error) {
    console.error('Errore nel recupero documenti:', error);
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
    formatted += `   Dimensione: ${doc.metadata.wordCount} parole\n`;
    formatted += `   Modificato: ${new Date(doc.metadata.modifiedTime).toLocaleDateString('it-IT')}\n`;
    
    if (doc.keywords.length > 0) {
      formatted += `   Keywords: ${doc.keywords.slice(0, 8).join(', ')}\n`;
    }
    
    formatted += `   Riassunto: ${doc.summary}\n`;
    
    // Aggiungi contenuto rilevante
    if (query) {
      const relevantContent = extractRelevantContent(doc.content, query);
      if (relevantContent) {
        formatted += `   Contenuto rilevante:\n   ${relevantContent}\n`;
      }
    } else {
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
  const lowerContent = content.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const relevantSentences = sentences.filter(sentence => 
    queryWords.some(word => sentence.toLowerCase().includes(word))
  ).slice(0, 3);
  
  return relevantSentences.join('. ').substring(0, 500) + 
    (relevantSentences.join('. ').length > 500 ? '...' : '');
}

// Health check per Google Drive
export async function checkGoogleDriveConnection(): Promise<{
  connected: boolean;
  documentsFound: number;
  supportedTypes: string[];
  errors: string[];
}> {
  const errors: string[] = [];
  let documentsFound = 0;
  
  try {
    const documents = await getDocumentsFromDrive();
    documentsFound = documents.length;
    
    return {
      connected: true,
      documentsFound,
      supportedTypes: Object.values(SUPPORTED_MIME_TYPES),
      errors
    };
    
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Errore sconosciuto');
    
    return {
      connected: false,
      documentsFound: 0,
      supportedTypes: Object.values(SUPPORTED_MIME_TYPES),
      errors
    };
  }
}

// Pulizia cache automatica
setInterval(() => {
  documentCache.cleanup();
}, 60 * 60 * 1000); // Ogni ora