"use client"
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, AlertCircle, CheckCircle, 
  FileText, ArrowLeft, Download, Eye, 
  TrendingUp, Activity, Clock, Shield,
  Loader2, RefreshCw
} from 'lucide-react';

// Credenziali Airtable integrate
const AIRTABLE_BASE_ID = 'app5b8Z1mnHiTexSK';
const AIRTABLE_API_KEY = 'patHBKeuMtAh47bl5.2c36bdd966f7a847ffe1f3242be4a19dbf7b1fd02bd42865d15d8dbb402dffac';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Interfaccia Protocollo
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

const safeParseInt = (value: any, defaultValue: number = 0): number => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Funzione per chiamate Airtable
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
      throw new Error(`Errore Airtable: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Errore nella richiesta Airtable:', error);
    throw error;
  }
}

// Funzione per ottenere protocolli
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
    throw error;
  }
}

// Cache semplice
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

// Test connessione Airtable
async function checkAirtableConnection(): Promise<{
  connected: boolean;
  tablesAvailable: string[];
  errors: string[];
}> {
  const tables = ['protocolli'];
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

const ProtocolliPage = () => {
  const [protocols, setProtocols] = useState<Protocollo[]>([]);
  const [filteredProtocols, setFilteredProtocols] = useState<Protocollo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [selectedEfficacy, setSelectedEfficacy] = useState('Tutti');
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, errors: [] });

  // Carica protocolli da Airtable
  useEffect(() => {
    const loadProtocols = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test connessione Airtable
        const status = await checkAirtableConnection();
        setConnectionStatus(status);
        
        if (!status.connected) {
          throw new Error('Impossibile connettersi ad Airtable. Verificare credenziali.');
        }
        
        const data = await getCachedData(() => getProtocolli(), 'protocolli');
        setProtocols(data);
        setFilteredProtocols(data);
      } catch (err) {
        console.error('Errore nel caricamento protocolli:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
        // Dati fallback in caso di errore
        setProtocols([]);
        setFilteredProtocols([]);
      } finally {
        setLoading(false);
      }
    };

    loadProtocols();
  }, []);

  // Filtri
  useEffect(() => {
    let filtered = protocols;

    // Filtro per ricerca
    if (searchTerm) {
      filtered = filtered.filter(protocol =>
        protocol.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        protocol.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
        protocol.sintomiCorrelati.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro per categoria
    if (selectedCategory !== 'Tutti') {
      filtered = filtered.filter(protocol => protocol.categoria === selectedCategory);
    }

    // Filtro per efficacia
    if (selectedEfficacy !== 'Tutti') {
      const [min, max] = selectedEfficacy.split('-').map(Number);
      filtered = filtered.filter(protocol => 
        protocol.efficacia >= min && protocol.efficacia <= (max || 10)
      );
    }

    setFilteredProtocols(filtered);
  }, [protocols, searchTerm, selectedCategory, selectedEfficacy]);

  const getCategories = () => {
    const categories = Array.from(new Set(protocols.map(p => p.categoria).filter(Boolean)));
    return ['Tutti', ...categories];
  };

  const getEfficacyColor = (efficacy: number) => {
    if (efficacy >= 8) return 'text-green-600 bg-green-100';
    if (efficacy >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const retryConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const status = await checkAirtableConnection();
      setConnectionStatus(status);
      
      if (status.connected) {
        const data = await getProtocolli();
        setProtocols(data);
        setFilteredProtocols(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella riconnessione');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Caricamento Protocolli
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connessione ad Airtable in corso...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Errore di Connessione
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={retryConnection}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Riprova</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Home</span>
              </a>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <FileText className="text-blue-600" size={28} />
                <span>Protocolli CDS</span>
              </h1>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                connectionStatus.connected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {connectionStatus.connected ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{connectionStatus.connected ? 'Airtable Connesso' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Totale Protocolli', value: protocols.length, icon: FileText, color: 'blue' },
            { label: 'Protocolli Filtrati', value: filteredProtocols.length, icon: Filter, color: 'green' },
            { label: 'Efficacia Media', value: protocols.length > 0 ? (protocols.reduce((sum, p) => sum + p.efficacia, 0) / protocols.length).toFixed(1) : '0', icon: TrendingUp, color: 'purple' },
            { label: 'Categorie', value: getCategories().length - 1, icon: Activity, color: 'orange' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <stat.icon className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtri */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Filter className="text-blue-600" size={24} />
            <span>Filtri e Ricerca</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ricerca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cerca protocolli, sintomi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Efficacia */}
            <select
              value={selectedEfficacy}
              onChange={(e) => setSelectedEfficacy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Tutti">Tutte le efficacie</option>
              <option value="8-10">Alta (8-10)</option>
              <option value="6-7">Media (6-7)</option>
              <option value="1-5">Bassa (1-5)</option>
            </select>
          </div>
        </div>

        {/* Lista Protocolli */}
        <div className="space-y-6">
          {filteredProtocols.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nessun protocollo trovato
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Prova a modificare i filtri di ricerca
              </p>
            </div>
          ) : (
            filteredProtocols.map((protocol) => (
              <div key={protocol.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {protocol.nome}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {protocol.descrizione}
                      </p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEfficacyColor(protocol.efficacia)}`}>
                      Efficacia: {protocol.efficacia}/10
                    </div>
                  </div>

                  {/* Dosaggio */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
                      <Shield size={16} />
                      <span>Dosaggio</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {protocol.dosaggio}
                    </p>
                  </div>

                  {/* Sintomi Correlati */}
                  {protocol.sintomiCorrelati.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
                        <Activity size={16} />
                        <span>Sintomi Correlati</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {protocol.sintomiCorrelati.map((sintomo, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {sintomo}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  {protocol.note && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
                        <Clock size={16} />
                        <span>Note</span>
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        {protocol.note}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {protocol.categoria || 'Generale'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {protocol.pdfUrl && (
                        <a
                          href={protocol.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download size={16} />
                          <span>PDF</span>
                        </a>
                      )}
                      
                      <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <Eye size={16} />
                        <span>Dettagli</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProtocolliPage;