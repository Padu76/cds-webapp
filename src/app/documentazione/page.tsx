"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, FileText, File, FileSpreadsheet, 
  Download, ExternalLink, Calendar, ArrowLeft, 
  RefreshCw, AlertCircle, CheckCircle2, Grid3X3,
  List, SortAsc, SortDesc, Folder, Eye, Clock, Loader2,
  AlertTriangle
} from 'lucide-react';

// Timeout configurabili
const TIMEOUTS = {
  GOOGLE_DRIVE: 8000, // 8 secondi per Google Drive
};

interface DocumentData {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'doc' | 'xlsx' | 'xls' | 'txt';
  size: number;
  modifiedTime: string;
  url: string;
  content?: string;
  keywords?: string[];
}

interface DriveStatus {
  connected: boolean;
  documentsFound: number;
  supportedTypes: string[];
  errors: string[];
  lastCheck?: Date;
}

// Funzione con timeout per fetch
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

// Verifica connessione Google Drive con timeout
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
      supportedTypes: result.supportedTypes || [],
      errors: result.errors || [],
      lastCheck: new Date()
    };
  } catch (error) {
    return {
      connected: false,
      documentsFound: 0,
      supportedTypes: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'txt'],
      errors: [error instanceof Error ? error.message : 'Errore connessione Drive'],
      lastCheck: new Date()
    };
  }
}

// Carica tutti i documenti da Google Drive
async function loadAllDocuments(): Promise<DocumentData[]> {
  try {
    const response = await fetchWithTimeout('/api/drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '' }) // Query vuota per tutti i documenti
    }, TIMEOUTS.GOOGLE_DRIVE);

    if (!response.ok) {
      throw new Error(`Errore caricamento documenti: ${response.status}`);
    }

    const results = await response.json();
    
    // Mappa i risultati nel formato DocumentData
    return results.map((result: any) => ({
      id: result.document?.id || '',
      name: result.document?.name || 'Unknown',
      type: result.document?.type || 'pdf',
      size: result.document?.size || 0,
      modifiedTime: result.document?.modifiedTime || new Date().toISOString(),
      url: result.document?.url || '#',
      content: result.document?.content?.substring(0, 1000) || '', // Prime 1000 char
      keywords: result.document?.keywords || []
    }));
  } catch (error) {
    console.error('Errore nel caricamento documenti:', error);
    return [];
  }
}

const DocumentazionePage = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [driveStatus, setDriveStatus] = useState<DriveStatus>({
    connected: false,
    documentsFound: 0,
    supportedTypes: [],
    errors: []
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Prima verifica lo stato di Google Drive
      const status = await checkGoogleDriveConnection();
      setDriveStatus(status);

      if (status.connected) {
        // Carica tutti i documenti disponibili
        const docs = await loadAllDocuments();
        setDocuments(docs);
      } else {
        setError('Connessione a Google Drive non disponibile. Errori: ' + status.errors.join(', '));
      }
    } catch (error) {
      console.error('Errore nel caricamento documenti:', error);
      setError(error instanceof Error ? error.message : 'Errore sconosciuto nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  // Filtri e ordinamento
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents;

    // Filtro per tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => {
        if (selectedType === 'docx') {
          return doc.type === 'docx' || doc.type === 'doc';
        } else if (selectedType === 'xlsx') {
          return doc.type === 'xlsx' || doc.type === 'xls';
        }
        return doc.type === selectedType;
      });
    }

    // Filtro per ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query) ||
        doc.keywords?.some(keyword => keyword.toLowerCase().includes(query)) ||
        doc.content?.toLowerCase().includes(query)
      );
    }

    // Ordinamento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.modifiedTime).getTime() - new Date(b.modifiedTime).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchQuery, selectedType, sortBy, sortOrder]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'docx':
      case 'doc':
        return <File className="w-8 h-8 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const fileTypes = [
    { value: 'all', label: 'Tutti i file', count: documents.length },
    { value: 'pdf', label: 'PDF', count: documents.filter(d => d.type === 'pdf').length },
    { value: 'docx', label: 'Word', count: documents.filter(d => d.type === 'docx' || d.type === 'doc').length },
    { value: 'xlsx', label: 'Excel', count: documents.filter(d => d.type === 'xlsx' || d.type === 'xls').length },
    { value: 'txt', label: 'Testo', count: documents.filter(d => d.type === 'txt').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600 text-lg">Caricamento documentazione...</p>
          <p className="text-gray-500 text-sm mt-2">Connessione a Google Drive in corso</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Home</span>
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Documentazione</h1>
                <p className="text-gray-600 mt-1">Archivio completo documenti CDS e Blu di Metilene</p>
              </div>
            </div>
            
            {/* Status Google Drive */}
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm ${
                driveStatus.connected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {driveStatus.connected ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <Folder className="w-4 h-4" />
                <span>{driveStatus.documentsFound} documenti</span>
              </div>
              
              {driveStatus.lastCheck && (
                <div className="text-xs text-gray-500">
                  Aggiornato: {driveStatus.lastCheck.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              
              <button
                onClick={loadDocuments}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                title="Ricarica documenti"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Errori */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Errore di connessione</h3>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}
          
          {driveStatus.errors.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Avvisi Google Drive</h3>
              </div>
              <ul className="text-yellow-700 mt-1 text-sm">
                {driveStatus.errors.map((err, idx) => (
                  <li key={idx}>• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Barra Filtri e Ricerca */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barra Ricerca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca nei documenti per nome, contenuto o keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Filtri Tipo */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {fileTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} ({type.count})
                </option>
              ))}
            </select>

            {/* Ordinamento */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="date">Data modifica</option>
                <option value="name">Nome</option>
                <option value="size">Dimensione</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Vista */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{documents.filter(d => d.type === 'pdf').length}</p>
                <p className="text-gray-600 text-sm">Documenti PDF</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <File className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{documents.filter(d => d.type === 'docx' || d.type === 'doc').length}</p>
                <p className="text-gray-600 text-sm">Documenti Word</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{documents.filter(d => d.type === 'xlsx' || d.type === 'xls').length}</p>
                <p className="text-gray-600 text-sm">Fogli Excel</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredAndSortedDocuments.length}</p>
                <p className="text-gray-600 text-sm">Risultati filtrati</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista/Grid Documenti */}
        {filteredAndSortedDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun documento trovato</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 
                `Nessun risultato per "${searchQuery}". Prova con altri termini di ricerca.` :
                documents.length === 0 ?
                'Impossibile caricare i documenti. Verifica la connessione a Google Drive.' :
                'Non ci sono documenti che corrispondono ai filtri selezionati.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Cancella ricerca
              </button>
            )}
            {documents.length === 0 && (
              <button
                onClick={loadDocuments}
                className="ml-4 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Riprova caricamento
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredAndSortedDocuments.map((doc) => (
              <div key={doc.id} className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
              }`}>
                {viewMode === 'grid' ? (
                  <>
                    {/* Vista Grid */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
                          {doc.name}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(doc.modifiedTime)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{formatFileSize(doc.size)}</span>
                          </div>
                        </div>
                        
                        {doc.keywords && doc.keywords.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {doc.keywords.slice(0, 3).map((keyword, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                >
                                  {keyword}
                                </span>
                              ))}
                              {doc.keywords.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                  +{doc.keywords.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {doc.content && (
                          <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                            {doc.content.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md uppercase font-medium">
                        {doc.type}
                      </span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Apri</span>
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Vista Lista */}
                    <div className="flex-shrink-0">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0 mx-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {doc.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>{formatDate(doc.modifiedTime)}</span>
                        <span>{formatFileSize(doc.size)}</span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md uppercase font-medium">
                          {doc.type}
                        </span>
                      </div>
                      {doc.keywords && doc.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.keywords.slice(0, 5).map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Apri</span>
                      </a>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer con link alla chat */}
        <div className="mt-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-semibold mb-2">Non trovi quello che cerchi?</h3>
          <p className="mb-4 opacity-90">Chiedi all'AI Assistant che consulterà automaticamente questi documenti</p>
          <a
            href="/chat"
            className="inline-flex items-center space-x-2 bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <span>Vai alla Chat AI</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentazionePage;