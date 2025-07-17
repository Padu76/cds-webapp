"use client"
import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, AlertCircle, Clock, Star, ExternalLink, Zap, Heart, Filter, X } from 'lucide-react';
import Link from 'next/link';

interface Sintomo {
  id: string;
  nome: string;
  keywords: string[];
  categoria: string;
  urgenza: 'Bassa' | 'Media' | 'Alta';
  descrizione: string;
  protocolliSuggeriti: string[];
}

interface Protocol {
  id: string;
  nome: string;
  sostanza: string;
  categoria: string;
  descrizione: string;
  dosaggio: string;
  efficacia: number;
  pdfUrl: string;
}

const SintomiPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Sintomo[]>([]);
  const [searchResults, setSearchResults] = useState<Sintomo[]>([]);
  const [recommendedProtocols, setRecommendedProtocols] = useState<Protocol[]>([]);
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Dati mock sintomi
  const sintomiData: Sintomo[] = [
    {
      id: '1',
      nome: 'Gastrite',
      keywords: ['gastrite', 'stomaco', 'bruciore', 'acidità', 'reflusso'],
      categoria: 'Digestivo',
      urgenza: 'Media',
      descrizione: 'Infiammazione della mucosa gastrica con bruciore e acidità',
      protocolliSuggeriti: ['Protocollo A - CDS']
    },
    {
      id: '2',
      nome: 'Tosse',
      keywords: ['tosse', 'colpi di tosse', 'catarro', 'espettorato', 'bronchi'],
      categoria: 'Respiratorio',
      urgenza: 'Media',
      descrizione: 'Tosse persistente con o senza catarro',
      protocolliSuggeriti: ['Protocollo B - CDS']
    },
    {
      id: '3',
      nome: 'Nebbia mentale',
      keywords: ['nebbia', 'concentrazione', 'memoria', 'confusione', 'chiarezza'],
      categoria: 'Neurologico',
      urgenza: 'Bassa',
      descrizione: 'Difficoltà di concentrazione e chiarezza mentale',
      protocolliSuggeriti: ['Protocollo C - Blu di Metilene']
    },
    {
      id: '4',
      nome: 'Eczema',
      keywords: ['eczema', 'dermatite', 'prurito', 'arrossamento', 'pelle'],
      categoria: 'Dermatologico',
      urgenza: 'Media',
      descrizione: 'Infiammazione cutanea con prurito e arrossamento',
      protocolliSuggeriti: ['Protocollo D - CDS']
    },
    {
      id: '5',
      nome: 'Stanchezza',
      keywords: ['stanchezza', 'fatica', 'energia', 'spossatezza', 'debolezza'],
      categoria: 'Detox',
      urgenza: 'Bassa',
      descrizione: 'Sensazione di affaticamento persistente',
      protocolliSuggeriti: ['Protocollo E - CDS']
    },
    {
      id: '6',
      nome: 'Pressione alta',
      keywords: ['pressione', 'ipertensione', 'sistolica', 'diastolica', 'cardiovascolare'],
      categoria: 'Cardiovascolare',
      urgenza: 'Alta',
      descrizione: 'Pressione arteriosa elevata',
      protocolliSuggeriti: ['Protocollo F - Blu di Metilene']
    },
    {
      id: '7',
      nome: 'Mal di testa',
      keywords: ['mal di testa', 'cefalea', 'emicrania', 'dolore', 'cranio'],
      categoria: 'Neurologico',
      urgenza: 'Media',
      descrizione: 'Dolore alla testa di varia intensità',
      protocolliSuggeriti: ['Protocollo C - Blu di Metilene']
    },
    {
      id: '8',
      nome: 'Insonnia',
      keywords: ['insonnia', 'sonno', 'dormire', 'riposo', 'notte'],
      categoria: 'Neurologico',
      urgenza: 'Media',
      descrizione: 'Difficoltà ad addormentarsi o mantenere il sonno',
      protocolliSuggeriti: ['Protocollo C - Blu di Metilene']
    },
    {
      id: '9',
      nome: 'Nausea',
      keywords: ['nausea', 'vomito', 'stomaco', 'malessere', 'conati'],
      categoria: 'Digestivo',
      urgenza: 'Media',
      descrizione: 'Sensazione di malessere con impulso al vomito',
      protocolliSuggeriti: ['Protocollo A - CDS']
    },
    {
      id: '10',
      nome: 'Dolori articolari',
      keywords: ['articolazioni', 'dolore', 'artrite', 'rigidità', 'mobilità'],
      categoria: 'Articolare',
      urgenza: 'Media',
      descrizione: 'Dolore nelle articolazioni durante il movimento',
      protocolliSuggeriti: ['Protocollo A - CDS']
    }
  ];

  // Dati mock protocolli
  const protocolliData: Protocol[] = [
    {
      id: '1',
      nome: 'Protocollo A - CDS',
      sostanza: 'CDS',
      categoria: 'Digestivo',
      descrizione: 'Protocollo per problemi digestivi con CDS',
      dosaggio: '3 gocce attivate in 100ml acqua, 3 volte al giorno',
      efficacia: 8,
      pdfUrl: 'https://drive.google.com/file/d/esempio1'
    },
    {
      id: '2',
      nome: 'Protocollo B - CDS',
      sostanza: 'CDS',
      categoria: 'Respiratorio',
      descrizione: 'Trattamento per infezioni respiratorie',
      dosaggio: '5 gocce attivate in 200ml acqua, 2 volte al giorno',
      efficacia: 9,
      pdfUrl: 'https://drive.google.com/file/d/esempio2'
    },
    {
      id: '3',
      nome: 'Protocollo C - Blu di Metilene',
      sostanza: 'Blu di Metilene',
      categoria: 'Neurologico',
      descrizione: 'Supporto cognitivo e funzioni cerebrali',
      dosaggio: '1 goccia per 10kg peso corporeo, 1 volta al giorno',
      efficacia: 7,
      pdfUrl: 'https://drive.google.com/file/d/esempio3'
    },
    {
      id: '4',
      nome: 'Protocollo D - CDS',
      sostanza: 'CDS',
      categoria: 'Dermatologico',
      descrizione: 'Trattamento topico per problemi cutanei',
      dosaggio: '10 gocce attivate in 50ml acqua, applicare 2 volte al giorno',
      efficacia: 8,
      pdfUrl: 'https://drive.google.com/file/d/esempio4'
    },
    {
      id: '5',
      nome: 'Protocollo E - CDS',
      sostanza: 'CDS',
      categoria: 'Detox',
      descrizione: 'Disintossicazione generale con CDS',
      dosaggio: '1 goccia per kg peso corporeo in 1L acqua',
      efficacia: 9,
      pdfUrl: 'https://drive.google.com/file/d/esempio5'
    },
    {
      id: '6',
      nome: 'Protocollo F - Blu di Metilene',
      sostanza: 'Blu di Metilene',
      categoria: 'Cardiovascolare',
      descrizione: 'Supporto cardiovascolare per circolazione',
      dosaggio: '0.5mg per kg peso corporeo, 2 volte al giorno',
      efficacia: 6,
      pdfUrl: 'https://drive.google.com/file/d/esempio6'
    }
  ];

  // Fuzzy search per sintomi
  const searchSintomi = (query: string) => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return sintomiData.filter(sintomo => {
      const matchesName = sintomo.nome.toLowerCase().includes(lowerQuery);
      const matchesKeywords = sintomo.keywords.some(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      );
      const matchesDescription = sintomo.descrizione.toLowerCase().includes(lowerQuery);
      
      return matchesName || matchesKeywords || matchesDescription;
    });
  };

  // Aggiorna suggerimenti in tempo reale
  useEffect(() => {
    if (searchTerm.length > 1) {
      const results = searchSintomi(searchTerm);
      setSuggestions(results.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  // Ricerca principale
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setShowSuggestions(false);
    
    // Simula delay di ricerca
    setTimeout(() => {
      let results = searchSintomi(query);
      
      // Applica filtri
      if (selectedUrgency !== 'all') {
        results = results.filter(sintomo => sintomo.urgenza === selectedUrgency);
      }
      if (selectedCategory !== 'all') {
        results = results.filter(sintomo => sintomo.categoria === selectedCategory);
      }
      
      setSearchResults(results);
      
      // Trova protocolli correlati
      const protocolNames = results.flatMap(sintomo => sintomo.protocolliSuggeriti);
      const protocols = protocolliData.filter(protocol => 
        protocolNames.includes(protocol.nome)
      );
      setRecommendedProtocols(protocols);
      
      // Aggiungi a ricerche recenti
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
      
      setIsSearching(false);
    }, 300);
  };

  const handleSuggestionClick = (sintomo: Sintomo) => {
    setSearchTerm(sintomo.nome);
    handleSearch(sintomo.nome);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Bassa':
        return 'bg-green-100 text-green-800 border-green-200';
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

  const categories = ['Digestivo', 'Respiratorio', 'Neurologico', 'Dermatologico', 'Detox', 'Cardiovascolare', 'Articolare'];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-20 backdrop-blur-md transition-all duration-300 ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Torna alla Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Ricerca Sintomi
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Trova il protocollo giusto</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Descrivi il tuo sintomo e ricevi suggerimenti personalizzati</p>
        </div>

        {/* Search Box */}
        <div className="relative mb-6">
          <div className={`relative rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center p-4">
              <Search className="w-6 h-6 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Cerca sintomi (es: mal di testa, tosse, stanchezza...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                className={`flex-1 text-lg bg-transparent focus:outline-none ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    setRecommendedProtocols([]);
                  }}
                  className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleSearch(searchTerm)}
                className="ml-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300"
              >
                Cerca
              </button>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg border z-10 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              {suggestions.map((sintomo) => (
                <button
                  key={sintomo.id}
                  onClick={() => handleSuggestionClick(sintomo)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{sintomo.nome}</div>
                      <div className="text-sm text-gray-500">{sintomo.descrizione}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getUrgencyColor(sintomo.urgenza)}`}>
                      {sintomo.urgenza}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">Tutte le urgenze</option>
            <option value="Bassa">Bassa</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="all">Tutte le categorie</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchTerm && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              Ricerche recenti
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(search);
                    handleSearch(search);
                  }}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sintomi Results */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <AlertCircle className="w-6 h-6 mr-2 text-emerald-600" />
                Sintomi trovati ({searchResults.length})
              </h3>
              <div className="space-y-4">
                {searchResults.map((sintomo) => (
                  <div key={sintomo.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold">{sintomo.nome}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getUrgencyColor(sintomo.urgenza)}`}>
                        {sintomo.urgenza}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{sintomo.descrizione}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-lg text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {sintomo.categoria}
                      </span>
                      <div className="text-sm text-emerald-600">
                        {sintomo.protocolliSuggeriti.length} protocolli suggeriti
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Protocols */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-cyan-600" />
                Protocolli consigliati ({recommendedProtocols.length})
              </h3>
              <div className="space-y-4">
                {recommendedProtocols.map((protocol) => (
                  <div key={protocol.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold">{protocol.nome}</h4>
                      <div className="flex items-center space-x-1">
                        {renderStars(protocol.efficacia)}
                        <span className="text-sm text-gray-500 ml-1">({protocol.efficacia}/10)</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{protocol.descrizione}</p>
                    <div className="mb-3">
                      <h5 className="font-medium mb-1">Dosaggio:</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{protocol.dosaggio}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-lg text-xs ${protocol.sostanza === 'CDS' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {protocol.sostanza}
                      </span>
                      <div className="flex space-x-2">
                        <Link href={`/protocolli`} className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          Dettagli
                        </Link>
                        <a
                          href={protocol.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 hover:text-cyan-700 text-sm flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          PDF
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {searchTerm && searchResults.length === 0 && !isSearching && (
        <div className="max-w-4xl mx-auto px-4 text-center py-12">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nessun sintomo trovato</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Prova con parole diverse o consulta la lista completa dei protocolli
          </p>
          <Link 
            href="/protocolli"
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Visualizza tutti i protocolli
          </Link>
        </div>
      )}

      {/* Loading */}
      {isSearching && (
        <div className="max-w-4xl mx-auto px-4 text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Ricerca in corso...</p>
        </div>
      )}
    </div>
  );
};

export default SintomiPage;