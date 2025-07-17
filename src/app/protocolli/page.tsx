"use client"
import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, ExternalLink, Star, Download, Eye, Heart, Zap, Shield, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getProtocolli, searchProtocolli, type Protocollo } from '@/lib/airtable';

const ProtocolliPage = () => {
  const [protocols, setProtocols] = useState<Protocollo[]>([]);
  const [filteredProtocols, setFilteredProtocols] = useState<Protocollo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubstance, setSelectedSubstance] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minEfficacia, setMinEfficacia] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Carica protocolli iniziali
  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProtocolli();
      setProtocols(data);
      setFilteredProtocols(data);
    } catch (err) {
      console.error('Errore caricamento protocolli:', err);
      setError('Errore nel caricamento dei protocolli. Verifica la connessione Airtable.');
    } finally {
      setLoading(false);
    }
  };

  // Applica filtri locali
  useEffect(() => {
    if (protocols.length === 0) return;
    
    let filtered = protocols;

    // Filtro per sostanza
    if (selectedSubstance !== 'all') {
      filtered = filtered.filter(protocol => protocol.sostanza === selectedSubstance);
    }

    // Filtro per categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(protocol => protocol.categoria === selectedCategory);
    }

    // Filtro per efficacia
    filtered = filtered.filter(protocol => protocol.efficacia >= minEfficacia);

    setFilteredProtocols(filtered);
  }, [selectedSubstance, selectedCategory, minEfficacia, protocols]);

  // Ricerca con Airtable
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredProtocols(protocols);
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      const searchResults = await searchProtocolli(searchTerm);
      setFilteredProtocols(searchResults);
    } catch (err) {
      console.error('Errore ricerca:', err);
      setError('Errore nella ricerca. Riprova.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Reset ricerca
  const resetSearch = () => {
    setSearchTerm('');
    setSelectedSubstance('all');
    setSelectedCategory('all');
    setMinEfficacia(0);
    setFilteredProtocols(protocols);
  };

  const getSubstanceColor = (substance: string) => {
    switch (substance) {
      case 'CDS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Blu di Metilene':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Entrambi':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Ottieni categorie uniche dai dati
  const categories = [...new Set(protocols.map(p => p.categoria))].filter(Boolean);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-md transition-all duration-300 ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Torna alla Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Protocolli
              </h1>
            </div>
            <button
              onClick={loadProtocols}
              disabled={loading}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Aggiorna</span>
            </button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
            <button
              onClick={loadProtocols}
              className="ml-auto bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Riprova
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-lg">Caricamento protocolli da Airtable...</p>
          <p className="text-sm text-gray-500 mt-2">Prima connessione potrebbe richiedere qualche secondo</p>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className={`rounded-2xl shadow-sm p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cerca protocolli, sintomi o descrizioni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-emerald-600 text-white px-4 py-1 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
                >
                  {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Cerca</span>
                </button>
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Trovati {filteredProtocols.length} protocolli</span>
                  {searchTerm && (
                    <span className="text-emerald-600">
                      per "{searchTerm}"
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <span>Filtri</span>
                </button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Sostanza Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Sostanza</label>
                    <select
                      value={selectedSubstance}
                      onChange={(e) => setSelectedSubstance(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">Tutte le sostanze</option>
                      <option value="CDS">CDS</option>
                      <option value="Blu di Metilene">Blu di Metilene</option>
                      <option value="Entrambi">Entrambi</option>
                    </select>
                  </div>

                  {/* Categoria Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">Tutte le categorie</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Efficacia Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Efficacia minima</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={minEfficacia}
                      onChange={(e) => setMinEfficacia(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span className="font-medium">{minEfficacia}</span>
                      <span>10</span>
                    </div>
                  </div>

                  {/* Reset Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={resetSearch}
                      className="w-full px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Reset Filtri
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Protocols Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProtocols.map((protocol) => (
                <div key={protocol.id} className={`rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold leading-tight">{protocol.nome}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSubstanceColor(protocol.sostanza)}`}>
                        {protocol.sostanza}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {protocol.categoria}
                      </span>
                      <div className="flex items-center space-x-1">
                        {renderStars(protocol.efficacia)}
                        <span className="text-sm text-gray-500 ml-1">({protocol.efficacia}/10)</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {protocol.descrizione}
                    </p>
                  </div>

                  {/* Dosaggio */}
                  <div className="px-6 pb-4">
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold mb-1 flex items-center">
                        <Zap className="w-4 h-4 mr-1 text-emerald-600" />
                        Dosaggio
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {protocol.dosaggio}
                      </p>
                    </div>

                    {/* Sintomi Correlati */}
                    {protocol.sintomiCorrelati.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Sintomi trattati:</h4>
                        <div className="flex flex-wrap gap-1">
                          {protocol.sintomiCorrelati.map((sintomo, index) => (
                            <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                              {sintomo}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Note */}
                    {protocol.note && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-1 flex items-center">
                          <Shield className="w-4 h-4 mr-1 text-amber-600" />
                          Note importanti
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {protocol.note}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-3">
                      <a
                        href={protocol.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Scarica PDF</span>
                      </a>
                      <button className="px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center space-x-1 text-sm">
                        <Eye className="w-4 h-4" />
                        <span>Dettagli</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredProtocols.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nessun protocollo trovato</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm ? 'Prova con termini diversi o' : 'Prova a modificare i filtri o'} verifica la connessione ad Airtable
                </p>
                <button
                  onClick={resetSearch}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors mr-4"
                >
                  Reset Filtri
                </button>
                <button
                  onClick={loadProtocols}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Ricarica Dati
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProtocolliPage;