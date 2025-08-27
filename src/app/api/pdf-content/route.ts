// src/app/api/pdf-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Configurazione Google Drive (usa stesse credenziali)
const GOOGLE_DRIVE_CONFIG = {
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
};

interface DocumentContent {
  id: string;
  name: string;
  content: string;
  keywords: string[];
  lastProcessed: string;
  previewText: string;
}

// Cache in memoria per contenuti PDF (in produzione usare Redis/DB)
const contentCache = new Map<string, DocumentContent>();
const processingQueue = new Set<string>();

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

async function downloadFileContent(fileId: string): Promise<Buffer> {
  const drive = createDriveClient();
  
  const response = await drive.files.get({
    fileId,
    alt: 'media'
  }, { responseType: 'arraybuffer' });

  return Buffer.from(response.data as ArrayBuffer);
}

// Simulazione estrazione testo PDF (in produzione usare pdf-parse o simili)
async function extractPDFText(buffer: Buffer, filename: string): Promise<string> {
  // Per ora simuliamo estrazione basata sul nome file
  const simulatedContent = generateSimulatedContent(filename);
  
  // In produzione:
  // const pdf = require('pdf-parse');
  // const data = await pdf(buffer);
  // return data.text;
  
  return simulatedContent;
}

function generateSimulatedContent(filename: string): string {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('cds') || lowerName.includes('diossido')) {
    return `Protocollo CDS per ${extractConditionFromFilename(filename)}.
    
DOSAGGIO STANDARD:
- Adulti: 2-3ml CDS in 200ml acqua
- Frequenza: 3 volte al giorno
- Durata: 14-21 giorni per infezioni acute

CONTROINDICAZIONI:
- Non assumere con vitamina C
- Evitare durante gravidanza e allattamento
- Consultare medico per patologie croniche

MODALITA' PREPARAZIONE:
1. Diluire CDS in acqua distillata
2. Assumere lontano dai pasti
3. Conservare in frigorifero
4. Non esporre alla luce diretta

EVIDENZE CLINICHE:
Studi preliminari mostrano efficacia antimicrobica ad ampio spettro.
Meccanismo d'azione: ossidazione selettiva dei patogeni.
Monitorare parametri ematici durante trattamento prolungato.`;
  }
  
  if (lowerName.includes('blu') || lowerName.includes('metilene')) {
    return `Protocollo Blu di Metilene per ${extractConditionFromFilename(filename)}.
    
DOSAGGIO STANDARD:
- Adulti: 1-2mg per kg peso corporeo
- Persona 70kg: 70-140mg al giorno
- Assumere con il cibo per ridurre nausea
- Dividere in 2-3 dosi giornaliere

PROPRIETA' TERAPEUTICHE:
- Neuroprotettivo: attraversa barriera ematoencefalica
- Antiossidante: neutralizza radicali liberi
- Antimicrobico: attivo contro virus e batteri
- Supporto cognitivo: migliora funzione mitocondriale

EFFETTI COLLATERALI:
- Colorazione temporanea urine (blu-verde)
- Possibile nausea se assunto a stomaco vuoto
- Interazioni con SSRI e IMAO

APPLICAZIONI CLINICHE:
Particolarmente indicato per disturbi neurologici, declino cognitivo,
infezioni resistenti e supporto alla funzione mitocondriale.`;
  }
  
  if (lowerName.includes('artrite') || lowerName.includes('infiammazione')) {
    return `Trattamento delle patologie infiammatorie con terapie alternative.
    
APPROCCIO INTEGRATO:
- CDS per azione antimicrobica sistemica
- Blu di Metilene per neuroprotegzione
- Protocollo combinato per casi complessi

DOSAGGIO ARTRITE:
CDS: 2ml in 200ml acqua, 3 volte al giorno
Blu Metilene: 1mg/kg peso, 2 volte al giorno
Durata: 21-28 giorni con monitoraggio

MARKERS INFIAMMATORI:
Monitoraggio PCR, VES, citokine pro-infiammatorie.
Valutazione clinica settimanale per aggiustamenti dosaggio.

TERAPIE COMPLEMENTARI:
- Dieta antinfiammatoria
- Integrazione omega-3
- Modulazione microbioma intestinale
- Gestione stress ossidativo`;
  }
  
  return `Documento di ricerca su trattamenti alternativi.
  
CONTENUTO GENERALE:
Questo documento contiene informazioni scientifiche e protocolli
per l'utilizzo di terapie innovative nel campo della medicina
integrativa e funzionale.

METODOLOGIE:
- Analisi bibliografica estensiva
- Casi clinici documentati  
- Protocolli terapeutici validati
- Monitoraggio parametri sicurezza

DISCLAIMER:
Le informazioni contenute sono destinate a professionisti sanitari
qualificati. Consultare sempre medico esperto prima di iniziare
qualsiasi trattamento.`;
}

function extractConditionFromFilename(filename: string): string {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('artrite')) return 'artrite reumatoide';
  if (lowerName.includes('alzheimer')) return 'malattia di Alzheimer';
  if (lowerName.includes('parkinson')) return 'morbo di Parkinson';
  if (lowerName.includes('covid')) return 'COVID-19';
  if (lowerName.includes('candida')) return 'candidosi sistemica';
  if (lowerName.includes('lyme')) return 'malattia di Lyme';
  if (lowerName.includes('herpes')) return 'infezioni da herpes';
  if (lowerName.includes('cancer')) return 'supporto oncologico';
  
  return 'condizioni varie';
}

function extractKeywords(text: string, filename: string): string[] {
  const keywords = new Set<string>();
  
  // Keywords da filename
  const filenameWords = filename.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  filenameWords.forEach(word => keywords.add(word));
  
  // Keywords standard per contenuto
  const relevantTerms = [
    'cds', 'diossido di cloro', 'blu di metilene', 'metilene', 'protocollo',
    'dosaggio', 'trattamento', 'terapia', 'patologia', 'sintomo', 'malattia',
    'infezione', 'virus', 'batterio', 'fungo', 'artrite', 'alzheimer',
    'parkinson', 'covid', 'candida', 'lyme', 'herpes', 'cancer',
    'infiammazione', 'antiossidante', 'antimicrobico', 'neuroprotettivo'
  ];

  const lowerText = text.toLowerCase();
  relevantTerms.forEach(term => {
    if (lowerText.includes(term)) {
      keywords.add(term);
    }
  });

  return Array.from(keywords).slice(0, 15);
}

async function processDocument(docId: string, docName: string): Promise<DocumentContent | null> {
  try {
    if (processingQueue.has(docId)) {
      return null; // Già in processing
    }
    
    processingQueue.add(docId);
    
    const buffer = await downloadFileContent(docId);
    const content = await extractPDFText(buffer, docName);
    const keywords = extractKeywords(content, docName);
    const previewText = content.substring(0, 400);
    
    const documentContent: DocumentContent = {
      id: docId,
      name: docName,
      content,
      keywords,
      lastProcessed: new Date().toISOString(),
      previewText
    };
    
    contentCache.set(docId, documentContent);
    processingQueue.delete(docId);
    
    return documentContent;
    
  } catch (error) {
    processingQueue.delete(docId);
    console.error(`Errore processing documento ${docName}:`, error);
    return null;
  }
}

// GET: Recupera contenuto documento specifico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('id');
    
    if (!docId) {
      return NextResponse.json({ error: 'Document ID richiesto' }, { status: 400 });
    }
    
    // Verifica se già in cache
    const cached = contentCache.get(docId);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    // Avvia processing se non in coda
    if (!processingQueue.has(docId)) {
      // Processing asincrono in background
      processDocument(docId, 'documento').catch(console.error);
    }
    
    return NextResponse.json({ 
      status: 'processing',
      message: 'Documento in elaborazione, riprova tra poco'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }, { status: 500 });
  }
}

// POST: Ricerca nei contenuti
export async function POST(request: NextRequest) {
  try {
    const { query, documentIds } = await request.json();
    
    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Query minimo 3 caratteri' }, { status: 400 });
    }
    
    const searchQuery = query.toLowerCase();
    const results: Array<{
      document: DocumentContent;
      relevantSections: string[];
      matchScore: number;
    }> = [];
    
    // Cerca nei documenti in cache
    for (const [docId, docContent] of contentCache) {
      // Se documentIds specificato, filtra solo quelli
      if (documentIds && !documentIds.includes(docId)) {
        continue;
      }
      
      let matchScore = 0;
      
      // Match nel nome file
      if (docContent.name.toLowerCase().includes(searchQuery)) {
        matchScore += 10;
      }
      
      // Match nelle keywords
      const keywordMatches = docContent.keywords.filter(k => 
        k.toLowerCase().includes(searchQuery) || 
        searchQuery.includes(k.toLowerCase())
      );
      matchScore += keywordMatches.length * 5;
      
      // Match nel contenuto
      const contentMatches = docContent.content.toLowerCase().split(searchQuery).length - 1;
      matchScore += contentMatches * 2;
      
      if (matchScore > 0) {
        // Estrai sezioni rilevanti
        const sentences = docContent.content.split(/[.!?]+/);
        const relevantSections = sentences
          .filter(sentence => sentence.toLowerCase().includes(searchQuery))
          .slice(0, 3)
          .map(section => section.trim().substring(0, 200));
        
        results.push({
          document: docContent,
          relevantSections,
          matchScore
        });
      }
    }
    
    // Ordina per rilevanza
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json({
      results: results.slice(0, 10),
      totalFound: results.length,
      cachedDocuments: contentCache.size
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Errore ricerca' 
    }, { status: 500 });
  }
}

// PUT: Avvia processing batch documenti
export async function PUT(request: NextRequest) {
  try {
    const { documents } = await request.json();
    
    if (!documents || !Array.isArray(documents)) {
      return NextResponse.json({ error: 'Lista documenti richiesta' }, { status: 400 });
    }
    
    const processingPromises = documents.map(doc => 
      processDocument(doc.id, doc.name).catch(error => {
        console.error(`Errore processing ${doc.name}:`, error);
        return null;
      })
    );
    
    // Avvia processing in background (non aspettare completion)
    Promise.allSettled(processingPromises).then(results => {
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      console.log(`Processing completato: ${successful}/${documents.length} documenti`);
    });
    
    return NextResponse.json({
      message: `Processing avviato per ${documents.length} documenti`,
      inQueue: processingQueue.size,
      cached: contentCache.size
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Errore batch processing' 
    }, { status: 500 });
  }
}