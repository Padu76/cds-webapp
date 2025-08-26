"use client"
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, AlertTriangle, CheckCircle2, 
  RefreshCw, AlertCircle, Clock, Shield, Zap, 
  ArrowLeft, Brain, Heart, Thermometer, Activity,
  Loader2, Database
} from 'lucide-react';

// Credenziali Airtable - In produzione usare variabili d'ambiente
const AIRTABLE_BASE_ID = 'app5b8Z1mnHiTexSK';
const AIRTABLE_API_KEY = 'patHBKeuMtAh47bl5.2c36bdd966f7a847ffe1f3242be4a19dbf7b1fd02bd42865d15d8dbb402dffac';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Interfacce
interface Sintomo {
  id: string;
  nome: string;
  keywords: string[];
  categoria: string;
  urgenza: 'Bassa' | 'Media' | 'Alta';
  descrizione: string;
  protocolliSuggeriti: string[];
}

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
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('Variabili d\'ambiente Airtable mancanti');
  }

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

// Funzione per ottenere sintomi
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
  const tables = ['sintomi', 'protocolli'];
  const errors: string[] = [];
  const available: string[] = [];
  
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    return {
      connected: false,
      tablesAvailable: [],
      errors: ['Variabili d\'ambiente Airtable mancanti']
    };
  }
  
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

const SintomiPage = () => {
  const [sintomi, setSintomi] = useState<Sintomo[]>([]);
  const [protocolli, setProtocolli] = useState<Protocollo[]>([]);
  const [filteredSintomi, setFilteredSintomi] = useState<Sintomo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [selectedUrgency, setSelectedUrgency] = useState('Tutti');
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    tablesAvailable: string[];
    errors: string[];
  }>({ connected: false, tablesAvailable: [], errors: [] });

  // Carica dati da Airtable
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test connessione Airtable
        const status = await checkAirtableConnection();
        setConnectionStatus(status);
        
        if (!status.connected) {
          throw new Error('Impossibile connettersi ad Airtable. Verificare credenziali.');
        }
        
        // Carica sintomi e protocolli
        const [sintomiData, protocolliData] = await Promise.all([
          getCachedData(() => getSintomi(), 'sintomi'),
          getCachedData(() => getProtocolli(), 'protocolli')
        ]);
        
        setSintomi(sintomiData);
        setProtocolli(protocolliData);
        setFilteredSintomi(sintomiData);
      } catch (err) {
        console.error('Errore nel caricamento dati:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
        setSintomi([]);
        setProtocolli([]);
        setFilteredSintomi([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Applica filtri
  useEffect(() => {
    let filtered = sintomi;

    // Filtro ricerca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sintomo =>
        sintomo.nome.toLowerCase().includes(query) ||
        sintomo.descrizione.toLowerCase().includes(query) ||
        sintomo.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // Filtro categoria
    if (selectedCategory !== 'Tutti') {
      filtered = filtered.filter(sintomo => sintomo.categoria === selectedCategory);
    }

    // Filtro urgenza
    if (selectedUrgency !== 'Tutti') {
      filtered = filtered.filter(sintomo => sintomo.urgenza === selectedUrgency);
    }

    setFilteredSintomi(filtered);
  }, [sintomi, searchQuery, selectedCategory, selectedUrgency]);

  const getCategories = () => {
    const categories = Array.from(new Set(sintomi.map(s => s.categoria).filter(Boolean)));
    return ['Tutti', ...categories];
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Bassa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'neurologico': return Brain;
      case 'cardiaco': return Heart;
      case 'respiratorio': return Thermometer;
      default: return Activity;
    }
  };

  const retryConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const status = await checkAirtableConnection();
      setConnectionStatus(status);
      
      if (status.connected) {
        const [sintomiData, protocolliData] = await Promise.all([
          getSintomi(),
          getProtocolli()
        ]);
        setSintomi(sintomiData);
        setProtocolli(protocolliData);
        setFilteredSintomi(sintomiData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella riconnessione');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Caricamento Sintomi
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Errore di Connessione
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            {connectionStatus.errors.length > 0 && (
              <div className="mb-4 text-left">
                <p className="text-sm text-red-600 mb-2">Dettagli errori:</p>
                <ul className="text-xs text-red-500 space-y-1">
                  {connectionStatus.errors.map((err, index) => (
                    <li key={index}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={retryConnection}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Home</span>
              </a>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Search className="text-green-600" size={28} />
                <span>Database Sintomi</span>
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
                  <CheckCircle2 className="w-4 h-4" />
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
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Sintomi Totali', value: sintomi.length, icon: Database, color: 'green' },
            { label: 'Risultati Filtrati', value: filteredSintomi.length, icon: Filter, color: 'blue' },
            { label: 'Urgenza Alta', value: sintomi.filter(s => s.urgenza === 'Alta').length, icon: AlertTriangle, color: 'red' },
            { label: 'Protocolli Collegati', value: protocolli.length, icon: Shield, color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <stat.icon className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cerca sintomi, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Urgency Filter */}
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="Tutti">Tutte le urgenze</option>
              <option value="Alta">Urgenza Alta</option>
              <option value="Media">Urgenza Media</option>
              <option value="Bassa">Urgenza Bassa</option>
            </select>
          </div>
        </div>

        {/* Sintomi Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSintomi.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nessun sintomo trovato
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Prova a modificare i filtri di ricerca
              </p>
            </div>
          ) : (
            filteredSintomi.map((sintomo) => {
              const CategoryIcon = getCategoryIcon(sintomo.categoria);
              return (
                <div key={sintomo.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                          <CategoryIcon className="text-green-600 dark:text-green-400" size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {sintomo.nome}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sintomo.categoria}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(sintomo.urgenza)}`}>
                        {sintomo.urgenza}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {sintomo.descrizione}
                    </p>

                    {/* Keywords */}
                    {sintomo.keywords.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">KEYWORDS:</h4>
                        <div className="flex flex-wrap gap-2">
                          {sintomo.keywords.map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Protocolli Suggeriti */}
                    {sintomo.protocolliSuggeriti.length > 0 && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">PROTOCOLLI SUGGERITI:</h4>
                        <div className="space-y-2">
                          {sintomo.protocolliSuggeriti.map((protocollo, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle2 className="text-green-500" size={14} />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {protocollo}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SintomiPage;