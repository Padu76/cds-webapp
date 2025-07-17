"use client"
import React, { useState, useEffect } from 'react';
import { Calculator, Timer, ArrowLeft, Scale, Beaker, CheckSquare, FileText, Play, Pause, RotateCcw, Bell, Download, Info, Zap, Heart, Clock } from 'lucide-react';
import Link from 'next/link';

const ToolkitPage = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [darkMode, setDarkMode] = useState(false);
  
  // Calculator states
  const [weight, setWeight] = useState(70);
  const [substance, setSubstance] = useState('CDS');
  const [protocol, setProtocol] = useState('standard');
  
  // Timer states
  const [timerMinutes, setTimerMinutes] = useState(120);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(7200);
  
  // Converter states
  const [converterValue, setConverterValue] = useState(10);
  const [converterFrom, setConverterFrom] = useState('gocce');
  
  // Checklist states
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Preparare acqua distillata', completed: false },
    { id: 2, text: 'Dosare clorito di sodio', completed: false },
    { id: 3, text: 'Aggiungere HCl goccia a goccia', completed: false },
    { id: 4, text: 'Attendere 30 secondi (colore giallo)', completed: false },
    { id: 5, text: 'Diluire in acqua distillata', completed: false },
    { id: 6, text: 'Conservare in frigorifero', completed: false }
  ]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(totalSeconds - 1);
      }, 1000);
    } else if (totalSeconds === 0) {
      setIsTimerRunning(false);
      // Qui potresti aggiungere una notifica sonora
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, totalSeconds]);

  // Calcola dosi CDS
  const calculateCDSDose = () => {
    let baseDrops = 0;
    switch (protocol) {
      case 'standard':
        baseDrops = weight * 0.05; // 0.05 gocce per kg
        break;
      case 'intensive':
        baseDrops = weight * 0.1; // 0.1 gocce per kg
        break;
      case 'maintenance':
        baseDrops = weight * 0.03; // 0.03 gocce per kg
        break;
    }
    return Math.round(baseDrops);
  };

  // Calcola dosi Blu di Metilene
  const calculateBlueDose = () => {
    let baseMg = 0;
    switch (protocol) {
      case 'standard':
        baseMg = weight * 1; // 1mg per kg
        break;
      case 'intensive':
        baseMg = weight * 2; // 2mg per kg
        break;
      case 'maintenance':
        baseMg = weight * 0.5; // 0.5mg per kg
        break;
    }
    return Math.round(baseMg * 10) / 10;
  };

  // Convertitore unità
  const convertUnits = () => {
    const conversions = {
      gocce: { ml: 0.05, mg: 1 },
      ml: { gocce: 20, mg: 20 },
      mg: { gocce: 1, ml: 0.05 }
    };
    
    const results = {};
    Object.keys(conversions).forEach(unit => {
      if (unit !== converterFrom) {
        results[unit] = Math.round(converterValue * conversions[converterFrom][unit] * 100) / 100;
      }
    });
    
    return results;
  };

  // Toggle checklist item
  const toggleChecklistItem = (id: number) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // Reset timer
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTotalSeconds(timerMinutes * 60 + timerSeconds);
  };

  // Start/Stop timer
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'calculator', label: 'Calcolatore', icon: Calculator },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'converter', label: 'Convertitore', icon: Scale },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'guide', label: 'Guida', icon: FileText }
  ];

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
              <Zap className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Toolkit
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl mx-1 mb-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Calculator className="w-6 h-6 mr-2 text-emerald-600" />
                Calcolatore Dosi
              </h2>
              
              <div className="space-y-6">
                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Peso Corporeo (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="1"
                    max="200"
                  />
                </div>

                {/* Substance Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sostanza</label>
                  <select
                    value={substance}
                    onChange={(e) => setSubstance(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="CDS">CDS (Diossido di Cloro)</option>
                    <option value="BlueDiMetilene">Blu di Metilene</option>
                  </select>
                </div>

                {/* Protocol Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Protocollo</label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="maintenance">Mantenimento</option>
                    <option value="standard">Standard</option>
                    <option value="intensive">Intensivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-xl font-bold mb-4">Risultati Calcolazione</h3>
              
              {substance === 'CDS' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-900 rounded-xl">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {calculateCDSDose()} gocce
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Dose giornaliera CDS
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <span>Diluizione consigliata:</span>
                      <span className="font-medium">100-200ml acqua</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <span>Frequenza:</span>
                      <span className="font-medium">3 volte al giorno</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <span>Intervallo:</span>
                      <span className="font-medium">2 ore tra le dosi</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {calculateBlueDose()} mg
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Dose giornaliera Blu di Metilene
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <span>Diluizione consigliata:</span>
                      <span className="font-medium">250ml acqua</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <span>Frequenza:</span>
                      <span className="font-medium">1-2 volte al giorno</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <span>Note:</span>
                      <span className="font-medium">Può colorare urine</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-2xl shadow-sm p-8 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center justify-center">
                <Timer className="w-6 h-6 mr-2 text-emerald-600" />
                Timer Promemoria
              </h2>
              
              {/* Timer Display */}
              <div className="mb-8">
                <div className="text-6xl font-bold text-emerald-600 mb-4">
                  {formatTime(totalSeconds)}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {totalSeconds === 0 ? 'Tempo scaduto!' : 'Tempo rimanente'}
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={toggleTimer}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                    isTimerRunning
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{isTimerRunning ? 'Pausa' : 'Avvia'}</span>
                </button>
                
                <button
                  onClick={resetTimer}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Timer Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Minuti</label>
                  <input
                    type="number"
                    value={timerMinutes}
                    onChange={(e) => {
                      setTimerMinutes(Number(e.target.value));
                      setTotalSeconds(Number(e.target.value) * 60 + timerSeconds);
                    }}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="0"
                    max="999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Secondi</label>
                  <input
                    type="number"
                    value={timerSeconds}
                    onChange={(e) => {
                      setTimerSeconds(Number(e.target.value));
                      setTotalSeconds(timerMinutes * 60 + Number(e.target.value));
                    }}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    min="0"
                    max="59"
                  />
                </div>
              </div>

              {/* Preset Timers */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Timer Preimpostati</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: '30 sec', value: 30 },
                    { label: '2 min', value: 120 },
                    { label: '1 ora', value: 3600 },
                    { label: '2 ore', value: 7200 }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setTotalSeconds(preset.value);
                        setTimerMinutes(Math.floor(preset.value / 60));
                        setTimerSeconds(preset.value % 60);
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Converter Tab */}
        {activeTab === 'converter' && (
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-emerald-600" />
                Convertitore Unità
              </h2>
              
              <div className="space-y-6">
                {/* Input */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Valore</label>
                    <input
                      type="number"
                      value={converterValue}
                      onChange={(e) => setConverterValue(Number(e.target.value))}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Da</label>
                    <select
                      value={converterFrom}
                      onChange={(e) => setConverterFrom(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value="gocce">Gocce</option>
                      <option value="ml">Millilitri (ml)</option>
                      <option value="mg">Milligrammi (mg)</option>
                    </select>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Conversioni:</h3>
                  {Object.entries(convertUnits()).map(([unit, value]) => (
                    <div key={unit} className="flex justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      <span className="font-medium capitalize">{unit}:</span>
                      <span className="font-bold text-emerald-600">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Reference Table */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Tabella di Riferimento</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left">Gocce</th>
                          <th className="px-4 py-2 text-left">ML</th>
                          <th className="px-4 py-2 text-left">MG (approx)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {[
                          { gocce: 1, ml: 0.05, mg: 1 },
                          { gocce: 5, ml: 0.25, mg: 5 },
                          { gocce: 10, ml: 0.5, mg: 10 },
                          { gocce: 20, ml: 1, mg: 20 }
                        ].map((row, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">{row.gocce}</td>
                            <td className="px-4 py-2">{row.ml}</td>
                            <td className="px-4 py-2">{row.mg}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <CheckSquare className="w-6 h-6 mr-2 text-emerald-600" />
                Checklist Preparazione CDS
              </h2>
              
              <div className="space-y-4">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${
                      item.completed
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                    }`}
                  >
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-all duration-300 ${
                        item.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {item.completed && <CheckSquare className="w-4 h-4" />}
                    </button>
                    <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progresso</span>
                  <span>{checklist.filter(item => item.completed).length}/{checklist.length}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(checklist.filter(item => item.completed).length / checklist.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => setChecklist(checklist.map(item => ({ ...item, completed: false })))}
                className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
              >
                Reset Checklist
              </button>
            </div>
          </div>
        )}

        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto">
            <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-emerald-600" />
                Guida Rapida
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CDS Guide */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-emerald-600">Preparazione CDS</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium mb-1">Step 1: Materiali</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Clorito di sodio 28%, HCl 4%, acqua distillata, bicchiere di vetro
                      </p>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium mb-1">Step 2: Attivazione</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        1 goccia clorito + 1 goccia HCl, attendere 30 secondi
                      </p>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium mb-1">Step 3: Diluizione</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Diluire in 100-200ml di acqua distillata
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blue Guide */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-600">Preparazione Blu di Metilene</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium mb-1">Step 1: Dosaggio</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        1mg per kg di peso corporeo (usa il calcolatore)
                      </p>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium mb-1">Step 2: Diluizione</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Diluire in 250ml di acqua filtrata
                      </p>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium mb-1">Step 3: Assunzione</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Assumere 1-2 volte al giorno lontano dai pasti
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Notes */}
              <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Note di Sicurezza
                </h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Non superare mai i dosaggi consigliati</li>
                  <li>• Consultare un medico prima dell'uso</li>
                  <li>• Conservare in luogo fresco e asciutto</li>
                  <li>• Non assumere insieme a vitamina C</li>
                  <li>• Monitorare le reazioni del corpo</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolkitPage;