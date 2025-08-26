"use client"
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Filter, AlertTriangle, CheckCircle2, 
  RefreshCw, AlertCircle, FileText, MessageCircle, 
  Clock, Shield, Zap, ExternalLink, ChevronRight,
  Activity, TrendingUp, Eye, Brain, Heart
} from 'lucide-react';
import { 
  getCachedData, 
  checkAirtableConnection,
  type Sintomo,
  type Protocollo
} from '@/lib/airtable';

interface DatabaseStatus {
  connected: boolean;
  tablesLoaded: number;
  totalTables: number;
  errors: string[];
}

const SintomiPage = () => {
  const [sintomi, setSintomi] = useState<Sintomo[]>([]);
  const [protocolli, setProtocolli] = useState<Protocollo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    connected: false,
    tablesLoaded: 0,
    totalTables: 7,
    errors: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Verifica connessione Airtable
      const status = await checkAirtableConnection();
      setDbStatus({
        connected: status.connected,
        tablesLoaded: status.tablesAvailable.length,
        totalTables: 7,
        errors: status.errors
      });

      if (status.connected) {
        // Carica sintomi e protocolli
        const [sintomiData, protocolliData] = await Promise.all([
          getCachedData('sintomi'),
          getCachedData('protocolli')
        ]);
        
        setSintomi(sintomiData);
        setProtocolli(protocolliData);
      }
    } catch (error) {
      console.error('Errore nel caricamento dati:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtri e ricerca
  const filteredSintomi = useMemo(() => {
    let filtered = sintomi;

    // Filtro per categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(sintomo => sintomo.categoria === selectedCategory);
    }

    // Filtro per urgenza
    if (selectedUrgency !== 'all') {
      filtered = filtered.filter(sintomo => sintomo.urgenza === selectedUrgency);
    }

    // Filtro per ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sintomo => 
        sintomo.nome.toLowerCase().includes(query) ||
        sintomo.descrizione.toLowerCase().includes(query) ||
        sintomo.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [sintomi, searchQuery, selectedCategory, selectedUrgency]);

  const getUrgencyIcon = (urgenza: string) => {
    switch (urgenza) {
      case 'Alta':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Media':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'Bassa':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgenza: string) => {
    switch (urgenza) {
      case 'Alta':
        return 'border-red-200 bg-red-50';
      case 'Media':
        return 'border-yellow-200 bg-yellow-50';
      case 'Bassa':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'neurologico':
        return <Brain className="w-6 h-6 text-purple-500" />;
      case 'respiratorio':
        return <Activity className="w-6 h-6 text-blue-500" />;
      case 'cardiovascolare':
        return <Heart className="w-6 h-6 text-red-500" />;
      case 'digestivo':
        return <TrendingUp className="w-6 h-6 text-orange-500" />;
      default:
        return <Activity className="w-6 h-6 text-gray-500" />;
    }
  };

  const getProtocollosByIds = (protocolliIds: string[]) => {
    return protocolli.filter(p => 
      protocolliIds.some(id => 
        p.nome.toLowerCase().includes(id.toLowerCase()) || 
        p.id === id
      )
    );
  };

  // Statistiche
  const stats = {
    totale: sintomi.length,
    alta: sintomi.filter(s => s.urgenza === 'Alta').length,
    media: sintomi.filter(s => s.urgenza === 'Media').length,
    bassa: sintomi.filter(s => s.urgenza === 'Bassa').length
  };

  const categories = Array.from(new Set(sintomi.map(s => s.categoria))).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Caricamento database sintomi...</p>
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
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Database Sintomi</h1>
                <p className="text-gray-600 mt-1">Ricerca sintomi e protocolli correlati</p>
              </div>
            </div>
            
            {/* Status Database */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm ${
              dbStatus.connected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {dbStatus.connected ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{stats.totale} sintomi disponibili</span>
              <button onClick={loadData} className="ml-2 hover:scale-110 transition-transform">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totale}</p>
                <p className="text-gray-600 text-sm">Sintomi Totali</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.alta}</p>
                <p className="text-gray-600 text-sm">Urgenza Alta</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.media}</p>
                <p className="text-gray-600 text-sm">Urgenza Media</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.bassa}</p>
                <p className="text-gray-600 text-sm">Urgenza Bassa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtri e Ricerca */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barra Ricerca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca sintomi per nome, descrizione o parole chiave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Filtro Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tutte le categorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Filtro Urgenza */}
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tutte le urgenze</option>
              <option value="Alta">Urgenza Alta</option>
              <option value="Media">Urgenza Media</option>
              <option value="Bassa">Urgenza Bassa</option>
            </select>
          </div>
        </div>

        {/* Lista Sintomi */}
        {filteredSintomi.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun sintomo trovato</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 
                `Nessun risultato per "${searchQuery}". Prova con altri termini di ricerca.` :
                'Non ci sono sintomi che corrispondono ai filtri selezionati.'
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
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSintomi.map((sintomo) => {
              const protocolliCorrelati = getProtocollosByIds(sintomo.protocolliSuggeriti);
              
              return (
                <div key={sintomo.id} className={`bg-white rounded-xl shadow-sm border-2 ${getUrgencyColor(sintomo.urgenza)} hover:shadow-md transition-shadow`}>
                  <div className="p-6">
                    {/* Header Sintomo */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(sintomo.categoria)}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{sintomo.nome}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-600">{sintomo.categoria}</span>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="flex items-center space-x-1">
                              {getUrgencyIcon(sintomo.urgenza)}
                              <span className="text-sm font-medium">{sintomo.urgenza}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Descrizione */}
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {sintomo.descrizione}
                    </p>

                    {/* Keywords */}
                    {sintomo.keywords.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Parole Chiave:</h4>
                        <div className="flex flex-wrap gap-2">
                          {sintomo.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Protocolli Suggeriti */}
                    {protocolliCorrelati.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>Protocolli Suggeriti:</span>
                        </h4>
                        <div className="space-y-2">
                          {protocolliCorrelati.slice(0, 3).map((protocollo) => (
                            <div
                              key={protocollo.id}
                              className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                            >
                              <div className="flex-1">
                                <h5 className="font-medium text-emerald-900">{protocollo.nome}</h5>
                                <p className="text-sm text-emerald-700 truncate">
                                  {protocollo.descrizione.substring(0, 100)}...
                                </p>
                              </div>
                              <Link
                                href={`/protocolli?search=${protocollo.nome}`}
                                className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                              >
                                <span>Vedi</span>
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </div>
                          ))}
                          {protocolliCorrelati.length > 3 && (
                            <div className="text-center">
                              <Link
                                href={`/protocolli?sintomo=${sintomo.nome}`}
                                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                              >
                                +{protocolliCorrelati.length - 3} altri protocolli
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Azioni */}
                    <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                      <Link
                        href={`/chat?query=${encodeURIComponent(`Protocollo per ${sintomo.nome}`)}`}
                        className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chiedi all'AI</span>
                      </Link>
                      
                      {protocolliCorrelati.length > 0 && (
                        <Link
                          href={`/protocolli?sintomo=${sintomo.nome}`}
                          className="flex items-center space-x-2 bg-white text-emerald-600 border-2 border-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Vedi Protocolli</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Footer */}
        <div className="mt-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl p-8 text-white text-center">
          <h3 className="text-xl font-semibold mb-2">Non trovi il sintomo che cerchi?</h3>
          <p className="mb-6 opacity-90">
            Prova a descriverlo all'AI Assistant che consulterà automaticamente tutto il database
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center space-x-2 bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Vai alla Chat AI</span>
            </Link>
            <Link
              href="/protocolli"
              className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>Esplora Protocolli</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SintomiPage;