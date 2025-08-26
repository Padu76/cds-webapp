"use client"
import React, { useState, useEffect, useMemo } from 'react';

import { 
  Calculator, Timer, Droplet, Pill, 
  ArrowLeft, Info, AlertTriangle, CheckCircle, 
  Weight, Clock, RefreshCw, FileText, Download,
  Zap, Target
} from 'lucide-react';

const ToolkitPage = () => {
  const [activeCalculator, setActiveCalculator] = useState('cds');
  const [formData, setFormData] = useState({
    peso: '',
    patologia: 'lievi',
    eta: '',
    durata: '14',
    frequenza: '3'
  });
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer per preparazione CDS
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => {
          if (seconds <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Calcolatore CDS
  const calculateCDS = () => {
    const peso = parseFloat(formData.peso);
    if (!peso) return null;

    let doseBase;
    switch (formData.patologia) {
      case 'lievi': doseBase = 0.03; break;
      case 'moderate': doseBase = 0.05; break;
      case 'gravi': doseBase = 0.08; break;
      case 'croniche': doseBase = 0.02; break;
      default: doseBase = 0.03;
    }

    const mlCDS = (peso * doseBase).toFixed(1);
    const mlAcqua = formData.patologia === 'gravi' ? 200 : 250;
    const doseGiornaliera = (mlCDS * parseInt(formData.frequenza)).toFixed(1);

    return {
      mlPerDose: mlCDS,
      mlAcqua: mlAcqua,
      doseGiornaliera: doseGiornaliera,
      frequenza: formData.frequenza,
      durata: formData.durata
    };
  };

  // Calcolatore Blu di Metilene
  const calculateBluMetilene = () => {
    const peso = parseFloat(formData.peso);
    if (!peso) return null;

    let doseBase;
    switch (formData.patologia) {
      case 'lievi': doseBase = 1; break;
      case 'moderate': doseBase = 1.5; break;
      case 'gravi': doseBase = 2; break;
      case 'neurologico': doseBase = 3; break;
      default: doseBase = 1;
    }

    const mgPerDose = Math.round(peso * doseBase);
    const mgGiornalieri = mgPerDose * (formData.patologia === 'neurologico' ? 1 : parseInt(formData.frequenza));

    return {
      mgPerDose: mgPerDose,
      mgGiornalieri: mgGiornalieri,
      frequenza: formData.patologia === 'neurologico' ? '1' : formData.frequenza,
      durata: formData.durata
    };
  };

  const currentResults = useMemo(() => {
    if (activeCalculator === 'cds') return calculateCDS();
    if (activeCalculator === 'bm') return calculateBluMetilene();
    return null;
  }, [formData, activeCalculator]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (minutes) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
  };

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
                <Calculator className="text-blue-600" size={28} />
                <span>Toolkit</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Calcolatori', value: '3', icon: Calculator, color: 'blue' },
            { label: 'Timer Prep.', value: '4', icon: Timer, color: 'green' },
            { label: 'Convertitori', value: '2', icon: RefreshCw, color: 'purple' },
            { label: 'Tabelle Ref.', value: '5', icon: FileText, color: 'orange' }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calcolatori Principali */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Target className="text-blue-600" size={24} />
                <span>Calcolatori Dosaggio</span>
              </h2>

              {/* Calculator Tabs */}
              <div className="flex space-x-2 mb-6">
                {[
                  { id: 'cds', label: 'CDS', icon: Droplet, color: 'blue' },
                  { id: 'bm', label: 'Blu Metilene', icon: Pill, color: 'indigo' }
                ].map(calc => (
                  <button
                    key={calc.id}
                    onClick={() => setActiveCalculator(calc.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeCalculator === calc.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <calc.icon size={18} />
                    <span>{calc.label}</span>
                  </button>
                ))}
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Weight size={16} className="inline mr-1" />
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.peso}
                    onChange={(e) => setFormData({...formData, peso: e.target.value})}
                    placeholder="es. 70"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <AlertTriangle size={16} className="inline mr-1" />
                    Patologia
                  </label>
                  <select
                    value={formData.patologia}
                    onChange={(e) => setFormData({...formData, patologia: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lievi">Infezioni Lievi</option>
                    <option value="moderate">Infezioni Moderate</option>
                    <option value="gravi">Infezioni Gravi</option>
                    <option value="croniche">Patologie Croniche</option>
                    {activeCalculator === 'bm' && (
                      <option value="neurologico">Uso Neurologico</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Frequenza/die
                  </label>
                  <select
                    value={formData.frequenza}
                    onChange={(e) => setFormData({...formData, frequenza: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 volta</option>
                    <option value="2">2 volte</option>
                    <option value="3">3 volte</option>
                    <option value="4">4 volte</option>
                  </select>
                </div>
              </div>

              {/* Results */}
              {currentResults && formData.peso && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span>Dosaggio Calcolato</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {activeCalculator === 'cds' ? (
                      <>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentResults.mlPerDose}ml</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">CDS per dose</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currentResults.mlAcqua}ml</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Acqua</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{currentResults.doseGiornaliera}ml</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">CDS/giorno</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{currentResults.durata}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">giorni</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentResults.mgPerDose}mg</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">BM per dose</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{currentResults.mgGiornalieri}mg</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">BM/giorno</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{currentResults.frequenza}x</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">al giorno</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{currentResults.durata}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">giorni</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start space-x-2">
                      <Info className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Note Importanti:</p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          {activeCalculator === 'cds' 
                            ? "Assumere a stomaco vuoto, distanziare di 2 ore da vitamine/antiossidanti. Aumentare gradualmente se primo utilizzo."
                            : "Assumere con cibo per ridurre nausea. Può colorare temporaneamente urine di blu-verde. Evitare con inibitori MAO."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Convertitori */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <RefreshCw className="text-green-600" size={24} />
                <span>Convertitori Rapidi</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">CDS → ppm</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    1ml CDS (3000ppm) = 3mg ClO₂<br/>
                    In 200ml acqua = 15ppm finali
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">BM Concentrazioni</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    1% soluzione = 10mg/ml<br/>
                    0.1% topico = 1mg/ml
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Timer e Tools */}
          <div className="space-y-6">
            {/* Timer Preparazione */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Timer className="text-orange-600" size={24} />
                <span>Timer Preparazione</span>
              </h2>

              <div className="text-center mb-4">
                <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">
                  {formatTime(timerSeconds)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isTimerRunning ? 'Preparazione in corso...' : 'Seleziona tempo'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: '12h CDS', minutes: 720 },
                  { label: '24h CDS', minutes: 1440 },
                  { label: '3min MMS', minutes: 3 },
                  { label: '20min Attiv.', minutes: 20 }
                ].map((timer, index) => (
                  <button
                    key={index}
                    onClick={() => startTimer(timer.minutes)}
                    disabled={isTimerRunning}
                    className="px-3 py-2 text-xs font-medium bg-orange-100 hover:bg-orange-200 disabled:bg-gray-100 text-orange-800 disabled:text-gray-500 rounded-lg transition-colors"
                  >
                    {timer.label}
                  </button>
                ))}
              </div>

              {isTimerRunning && (
                <button
                  onClick={() => setIsTimerRunning(false)}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Stop Timer
                </button>
              )}
            </div>

            {/* Tabelle Riferimento */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <FileText className="text-purple-600" size={24} />
                <span>Tabelle Riferimento</span>
              </h2>

              <div className="space-y-3">
                {[
                  { title: 'Dosaggi per Patologia', desc: 'Tabella completa dosaggi' },
                  { title: 'Interazioni Farmaci', desc: 'Controindicazioni note' },
                  { title: 'Tempi di Attivazione', desc: 'MMS, CDS, CDH timing' },
                  { title: 'Diluizioni Topiche', desc: 'Concentrazioni sicure' },
                  { title: 'FAQ Tecniche', desc: 'Domande frequenti' }
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Zap className="text-yellow-600" size={24} />
                <span>Azioni Rapide</span>
              </h2>

              <div className="space-y-2">
                <a href="/diario" className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium transition-colors">
                  Aggiungi al Diario
                </a>
                <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  <Download size={16} className="inline mr-2" />
                  Esporta PDF
                </button>
                <a href="/chat-ai" className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center font-medium transition-colors">
                  Chiedi all'AI
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolkitPage;