// src/app/api/drive/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// Configurazione Google Drive
const GOOGLE_DRIVE_CONFIG = {
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
};

const SUPPORTED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'text/plain': 'txt'
} as const;

interface DocumentMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  modifiedTime: string;
  url: string;
  keywords?: string[];
}

interface DocumentSearchResult {
  document: DocumentMetadata & { content?: string };
  relevantSections: string[];
  matchScore: number;
}

// Cache per documenti
const documentCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 ore

function createDriveClient() {
  if (!GOOGLE_DRIVE_CONFIG.serviceAccountEmail || !GOOGLE_DRIVE_CONFIG.privateKey) {
    throw new Error('Credenziali Google Drive mancanti');
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

async function getDocumentsFromDrive(): Promise<DocumentMetadata[]> {
  const drive = createDriveClient();
  
  if (!GOOGLE_DRIVE_CONFIG.folderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID non configurato');
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
}

async function downloadFileContent(fileId: string): Promise<Buffer> {
  const drive = createDriveClient();
  
  const response = await drive.files.get({
    fileId,
    alt: 'media'
  }, { responseType: 'arraybuffer' });

  return Buffer.from(response.data as ArrayBuffer);
}

async function parseWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '[Documento Word vuoto]';
  } catch (error) {
    return `[ERRORE WORD: ${error instanceof Error ? error.message : 'Sconosciuto'}]`;
  }
}

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
    return `[ERRORE EXCEL: ${error instanceof Error ? error.message : 'Sconosciuto'}]`;
  }
}

async function parseDocument(doc: DocumentMetadata): Promise<string> {
  const cacheKey = `doc-${doc.id}-${doc.modifiedTime}`;
  const cached = documentCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }

  try {
    const buffer = await downloadFileContent(doc.id);
    let content = '';

    switch (doc.type) {
      case 'pdf':
        content = `[PDF CONTENT PLACEHOLDER]\nFile: ${doc.name}\nSize: ${buffer.length} bytes`;
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
        content = buffer.toString('utf-8');
        break;
      default:
        content = '[TIPO FILE NON SUPPORTATO]';
    }

    // Cache il risultato
    documentCache.set(cacheKey, {
      data: content,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    });

    return content;
  } catch (error) {
    return `[ERRORE PARSING: ${error instanceof Error ? error.message : 'Sconosciuto'}]`;
  }
}

function extractKeywords(text: string): string[] {
  const keywords = new Set<string>();
  
  const relevantTerms = [
    'cds', 'diossido di cloro', 'blu di metilene', 'metilene', 'protocollo',
    'dosaggio', 'trattamento', 'terapia', 'patologia', 'sintomo', 'malattia',
    'infezione', 'virus', 'batterio', 'fungo', 'artrite', 'alzheimer',
    'cancro', 'tumore', 'infiammazione', 'antiossidante', 'antimicrobico'
  ];

  const lowerText = text.toLowerCase();
  
  relevantTerms.forEach(term => {
    if (lowerText.includes(term)) {
      keywords.add(term);
    }
  });

  return Array.from(keywords).slice(0, 10);
}

function extractRelevantSections(content: string, query: string): string[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  const relevantSentences = sentences.filter(sentence => 
    queryWords.some(word => sentence.toLowerCase().includes(word))
  ).slice(0, 3);
  
  return relevantSentences.map(s => 
    s.substring(0, 300) + (s.length > 300 ? '...' : '')
  );
}

// Health check endpoint
export async function GET() {
  try {
    const documents = await getDocumentsFromDrive();
    
    return NextResponse.json({
      connected: true,
      documentsFound: documents.length,
      supportedTypes: Object.values(SUPPORTED_MIME_TYPES),
      errors: []
    });
    
  } catch (error) {
    return NextResponse.json({
      connected: false,
      documentsFound: 0,
      supportedTypes: Object.values(SUPPORTED_MIME_TYPES),
      errors: [error instanceof Error ? error.message : 'Errore sconosciuto']
    }, { status: 500 });
  }
}

// Search endpoint
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query mancante' }, { status: 400 });
    }

    const documents = await getDocumentsFromDrive();
    const results: DocumentSearchResult[] = [];
    
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

    for (const doc of documents) {
      try {
        const content = await parseDocument(doc);
        const lowerContent = content.toLowerCase();
        
        let matchScore = 0;
        
        // Score nel nome del file
        if (doc.name.toLowerCase().includes(lowerQuery)) {
          matchScore += 10;
        }
        
        // Score nel contenuto
        queryWords.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = lowerContent.match(regex);
          if (matches) {
            matchScore += matches.length;
          }
        });
        
        if (matchScore > 0) {
          const keywords = extractKeywords(content);
          const relevantSections = extractRelevantSections(content, query);
          
          results.push({
            document: {
              ...doc,
              keywords,
              content: content.substring(0, 1000) // Prime 1000 chars per preview
            },
            relevantSections,
            matchScore
          });
        }
        
      } catch (error) {
        console.error(`Errore processing documento ${doc.name}:`, error);
      }
    }
    
    // Ordina per rilevanza
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json(results.slice(0, 10));
    
  } catch (error) {
    console.error('Errore nella ricerca documenti:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }, { status: 500 });
  }
}