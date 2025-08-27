"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, AlertCircle, CheckCircle, 
  FileText, ArrowLeft, Download, Eye, 
  TrendingUp, Activity, Clock, Shield,
  Loader2, RefreshCw, Beaker, FlaskConical,
  Zap, Atom, Combine, Droplets
} from 'lucide-react';

// Credenziali da variabili d'ambiente
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
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
  categoriaAuto?: 'CDS' | 'BLU_METILENE' | 'IBRIDO' | 'GENERALE';
}

type CategoryType = 'CDS' | 'BLU_METILENE' | 'IBRIDO' | 'GENERALE' | 'TUTTI';

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

// Funzione per auto-categorizzare protocolli
const categorizeProtocol = (protocollo: Protocollo): 'CDS' | 'BLU_METILENE' | 'IBRIDO' | 'GENERALE' => {
  const text = `${protocollo.nome} ${protocollo.descrizione} ${protocollo.dosaggio} ${protocollo.note}`.toLowerCase();
  
  const cdsKeywords = ['cds', 'diossido di cloro', 'diossido cloro', 'chlorine dioxide', 'mms'];
  const bluKeywords = ['blu di metilene', 'blu metilene', 'methylene blue', 'metilene'];
  
  const hasCDS = cdsKeywords.some(keyword => text.includes(keyword));
  const hasBlu = bluKeywords.some(keyword => text.includes(keyword));
  
  if (hasCDS && hasBlu) return 'IBRIDO';
  if (hasCDS) return 'CDS';
  if (hasBlu) return 'BLU_METILENE';
  return 'GENERALE';
};

// Configurazione categorie
const categoryConfig = {
  CDS: {
    label: 'CDS',
    fullName: 'Diossido di Cloro',
    icon: Droplets,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    description: 'Protocolli basati su Diossido di Cloro (CDS)'
  },
  BLU_METILENE: {
    label: 'Blu di Metilene',
    fullName: 'Blu di Metilene',
    icon: Beaker,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    description: 'Protocolli basati su Blu di Metilene'
  },
  IBRIDO: {
    label: 'Ibrido',
    fullName: 'Trattamenti Combinati',
    icon: Combine,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    description: 'Protocolli che combinano CDS e Blu di Metilene'
  },
  GENERALE: {
    label: 'Generale',
    fullName: 'Protocolli Generali',
    icon: FileText,
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    buttonColor: 'bg-gray-600 hover:bg-gray-700',
    description: 'Altri protocolli terapeutici'
  }
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

// Funzione per ottenere protocolli
async function getProtocolli(): Promise<Protocollo[]> {
  try {
    const data = await airtableRequest('/protocolli');
    
    return data.records.map((record: any) => {
      const protocollo: Protocollo = {
        id: record.id,
        nome: record.fields.Nome || record.fields.nome || '',
        descrizione: record.fields.Descrizione || record.fields.descrizione || '',
        dosaggio: record.fields.Dosaggio || record.fields.dosaggio || '',
        sintomiCorrelati: parseCommaSeparatedString(record.fields.Sintomi_Correlati || record.fields.sintomi_correlati || ''),
        pdfUrl: record.fields.PDF_URL || record.fields.pdf_url || '',
        efficacia: safeParseInt(record.fields.Efficacia || record.fields.efficacia),
        note: record.fields.Note || record.fields.note || '',
        categoria: record.fields.Categoria || record.fields.categoria || '',
      };
      
      // Auto-categorizzazione
      protocollo.categoriaAuto = categorizeProtocol(protocollo);
      
      return protocollo;
    });
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

const ProtocolliPage = () => {
  const [protocols, setProtocols] = useState<Protocollo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('TUTTI');
  const [selectedEfficacy, setSelectedEfficacy] = useState('Tutti');
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    tablesAvailable: string[];
    errors: string[];
  }>({ connected: false, tablesAvailable: [], errors: [] });

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
      } catch (err) {
        console.error('Errore nel caricamento protocolli:', err);
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
        setProtocols([]);
      } finally {
        setLoading(false);
      }
    };

    loadProtocols();
  }, []);

  // Protocolli filtrati
  const filteredProtocols = useMemo(() => {
    let filtered = protocols;

    // Filtro per categoria
    if (selectedCategory !== 'TUTTI') {
      filtered = filtered.filter(protocol => protocol.categoriaAuto === selectedCategory);
    }

    // Filtro per ricerca
    if (searchTerm) {
      filtered = filtered.filter(protocol =>
        protocol.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        protocol.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
        protocol.sintomiCorrelati.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro per efficacia
    if (selectedEfficacy !== 'Tutti') {
      const [min, max] = selectedEfficacy.split('-').map(Number);
      filtered = filtered.filter(protocol => 
        protocol.efficacia >= min && protocol.efficacia <= (max || 10)
      );
    }

    return filtered;
  }, [protocols, selectedCategory, searchTerm, selectedEfficacy]);

  // Statistiche per categoria
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    protocols.forEach(protocol => {
      const cat = protocol.categoriaAuto || 'GENERALE';
      stats[cat] = (stats[cat] || 0) + 1;
    });
    return stats;
  }, [protocols]);

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
              Connessione ad Airtable e categorizzazione in corso...
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
                <FlaskConical className="text-blue-600" size={28} />
                <span>Protocolli Terapeutici</span>
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
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('TUTTI')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === 'TUTTI'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Activity size={18} />
                <span>Tutti ({protocols.length})</span>
              </button>
              
              {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((catKey) => {
                const config = categoryConfig[catKey];
                const count = categoryStats[catKey] || 0;
                const IconComponent = config.icon;
                
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey as CategoryType)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === catKey
                        ? `${config.buttonColor} text-white shadow-md`
                        : `text-${config.color}-600 hover:${config.bgColor} dark:text-${config.color}-400`
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{config.label} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Description */}
        {selectedCategory !== 'TUTTI' && (
          <div className={`mb-8 p-6 rounded-xl border-2 ${
            categoryConfig[selectedCategory as keyof typeof categoryConfig].bgColor
          } ${categoryConfig[selectedCategory as keyof typeof categoryConfig].borderColor}`}>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${categoryConfig[selectedCategory as keyof typeof categoryConfig].buttonColor}`}>
                {React.createElement(categoryConfig[selectedCategory as keyof typeof categoryConfig].icon, {
                  size: 24,
                  className: "text-white"
                })}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${categoryConfig[selectedCategory as keyof typeof categoryConfig].textColor}`}>
                  {categoryConfig[selectedCategory as keyof typeof categoryConfig].fullName}
                </h2>
                <p className={`${categoryConfig[selectedCategory as keyof typeof categoryConfig].textColor} opacity-80`}>
                  {categoryConfig[selectedCategory as keyof typeof categoryConfig].description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Totale Protocolli', 
              value: protocols.length, 
              icon: FileText, 
              color: 'blue',
              description: 'Tutti i protocolli disponibili'
            },
            { 
              label: 'Protocolli Filtrati', 
              value: filteredProtocols.length, 
              icon: Filter, 
              color: 'green',
              description: 'Risultati attuali'
            },
            { 
              label: 'Efficacia Media', 
              value: filteredProtocols.length > 0 
                ? (filteredProtocols.reduce((sum, p) => sum + p.efficacia, 0) / filteredProtocols.length).toFixed(1) 
                : '0', 
              icon: TrendingUp, 
              color: 'purple',
              description: 'Valutazione media dei protocolli'
            },
            { 
              label: 'Categorie Attive', 
              value: Object.values(categoryStats).filter(count => count > 0).length, 
              icon: Atom, 
              color: 'orange',
              description: 'Tipologie di trattamento'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                  <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtri */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Search className="text-blue-600" size={24} />
            <span>Ricerca e Filtri</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ricerca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cerca protocolli, sintomi, dosaggi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Efficacia */}
            <select
              value={selectedEfficacy}
              onChange={(e) => setSelectedEfficacy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Tutti">Tutte le efficacie</option>
              <option value="8-10">Alta efficacia (8-10)</option>
              <option value="6-7">Media efficacia (6-7)</option>
              <option value="1-5">Bassa efficacia (1-5)</option>
            </select>
          </div>
        </div>

        {/* Lista Protocolli */}
        <div className="space-y-6">
          {filteredProtocols.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                {selectedCategory !== 'TUTTI' ? (
                  React.createElement(categoryConfig[selectedCategory as keyof typeof categoryConfig].icon, {
                    size: 48,
                    className: `mx-auto text-gray-400 mb-4`
                  })
                ) : (
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nessun protocollo trovato
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedCategory !== 'TUTTI' 
                  ? `Non ci sono protocolli nella categoria ${categoryConfig[selectedCategory as keyof typeof categoryConfig].label}`
                  : 'Prova a modificare i filtri di ricerca'
                }
              </p>
            </div>
          ) : (
            filteredProtocols.map((protocol) => {
              const categoryInfo = categoryConfig[protocol.categoriaAuto || 'GENERALE'];
              const IconComponent = categoryInfo.icon;
              
              return (
                <div key={protocol.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 hover:shadow-xl transition-all duration-300 ${categoryInfo.borderColor}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${categoryInfo.bgColor}`}>
                            <IconComponent className={`text-${categoryInfo.color}-600`} size={20} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {protocol.nome}
                            </h3>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
                              {categoryInfo.label}
                            </span>
                          </div>
                        </div>
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
                        <span>Dosaggio e Modalità</span>
                      </h4>
                      <p className={`text-sm text-gray-600 dark:text-gray-400 p-3 rounded-lg border-l-4 ${categoryInfo.bgColor} ${categoryInfo.borderColor}`}>
                        {protocol.dosaggio}
                      </p>
                    </div>

                    {/* Sintomi Correlati */}
                    {protocol.sintomiCorrelati.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
                          <Activity size={16} />
                          <span>Indicazioni Terapeutiche</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {protocol.sintomiCorrelati.map((sintomo, index) => (
                            <span key={index} className={`px-3 py-1 text-xs rounded-full ${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
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
                          <span>Note Importanti</span>
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
                          {protocol.categoria || 'Non classificato'}
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
                        
                        <button className={`inline-flex items-center space-x-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${categoryInfo.buttonColor}`}>
                          <Eye size={16} />
                          <span>Dettagli</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Footer */}
        {protocols.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center">
            <h3 className="text-xl font-semibold mb-2">Database Protocolli Completo</h3>
            <p className="mb-4 opacity-90">
              {protocols.length} protocolli terapeutici categorizzati automaticamente per CDS, Blu di Metilene e trattamenti ibridi
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {(Object.keys(categoryStats) as Array<keyof typeof categoryStats>).map((catKey) => {
                const config = categoryConfig[catKey];
                const count = categoryStats[catKey];
                return (
                  <div key={catKey} className="flex items-center space-x-1">
                    {React.createElement(config.icon, { size: 16 })}
                    <span>{config.label}: {count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocolliPage;