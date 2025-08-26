"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, AlertTriangle, Clock, Thermometer, Beaker, 
  Droplets, Shield, CheckCircle, Eye, Hand, Wind,
  Timer, Scale, FlaskConical, FileText, Download,
  ChevronRight, ChevronDown, Play, Pause
} from 'lucide-react';

const PreparazioneCDS = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [expandedSafety, setExpandedSafety] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Preparazione Ambiente",
      duration: "5 minuti",
      description: "Prepara l'area di lavoro e assicurati di avere tutto l'occorrente",
      icon: Shield,
      color: "blue"
    },
    {
      id: 2,
      title: "Preparazione Soluzione Base",
      duration: "2 minuti",
      description: "Miscela clorito di sodio e attivatore acido",
      icon: Beaker,
      color: "green"
    },
    {
      id: 3,
      title: "Attivazione",
      duration: "3 minuti",
      description: "Aspetta che la soluzione diventi giallo ambra",
      icon: Timer,
      color: "yellow"
    },
    {
      id: 4,
      title: "Diluizione",
      duration: "2 minuti",
      description: "Aggiungi acqua distillata per ottenere il CDS",
      icon: Droplets,
      color: "cyan"
    },
    {
      id: 5,
      title: "Controllo e Conservazione",
      duration: "3 minuti",
      description: "Verifica la concentrazione e conserva correttamente",
      icon: FlaskConical,
      color: "purple"
    }
  ];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeElapsed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Preparazione CDS</h1>
                <p className="text-gray-600 text-sm">Guida completa step-by-step</p>
              </div>
            </div>
            
            {/* Timer */}
            <div className="hidden sm:flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="text-lg font-mono font-bold text-gray-900">
                {formatTime(timeElapsed)}
              </span>
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={resetTimer}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Warning Banner */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">
                ⚠️ IMPORTANTE - Leggere Prima di Iniziare
              </h3>
              <p className="text-red-800 mb-3">
                La preparazione del CDS richiede attenzione e rispetto delle procedure di sicurezza. 
                Consultare sempre un medico esperto prima dell'uso.
              </p>
              <button
                onClick={() => setExpandedSafety(!expandedSafety)}
                className="inline-flex items-center space-x-2 text-red-700 hover:text-red-800 font-medium"
              >
                <span>Note di Sicurezza Complete</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSafety ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedSafety && (
                <div className="mt-4 space-y-3 text-red-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Equipaggiamento di Sicurezza:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Guanti in nitrile o vinile</li>
                        <li>• Occhiali di protezione</li>
                        <li>• Area ben ventilata</li>
                        <li>• Contenitori in vetro (mai plastica)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Precauzioni:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Non inalare i vapori direttamente</li>
                        <li>• Tenere lontano da bambini e animali</li>
                        <li>• Non mescolare con altri prodotti</li>
                        <li>• Conservare in frigorifero al buio</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Materials Needed */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <Beaker className="w-7 h-7 text-emerald-600" />
            <span>Materiali Necessari</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { category: "Componenti Chimici", items: [
                "Clorito di sodio 25% (NaClO₂)",
                "Acido cloridrico 4% (HCl) o Acido citrico 50%",
                "Acqua distillata"
              ]},
              { category: "Attrezzature", items: [
                "Barattolo di vetro con coperchio",
                "Siringa graduata 1ml e 10ml",
                "Bilancia di precisione (opzionale)",
                "Strips per test pH/cloro"
              ]},
              { category: "Sicurezza", items: [
                "Guanti in nitrile",
                "Occhiali di protezione",
                "Area ventilata",
                "Contenitori di stoccaggio scuri"
              ]}
            ].map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                  {section.category}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center space-x-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Step Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Processo di Preparazione</h2>
            <div className="text-sm text-gray-600">
              Passo {activeStep} di {steps.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                    activeStep === step.id
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg scale-110'
                      : activeStep > step.id
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:border-emerald-300'
                  }`}
                >
                  {activeStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </button>
              ))}
            </div>
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-8">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`transition-all duration-500 ${
                  activeStep === step.id ? 'block' : 'hidden'
                }`}
              >
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r from-${step.color}-500 to-${step.color}-400 rounded-xl flex items-center justify-center shadow-lg`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{step.duration}</span>
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg mb-6">{step.description}</p>
                  
                  {/* Step Specific Content */}
                  {step.id === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <span>Equipaggiamento di Sicurezza</span>
                          </h4>
                          <div className="bg-white p-4 rounded-lg border">
                            <ul className="space-y-2">
                              <li className="flex items-center space-x-2">
                                <Hand className="w-4 h-4 text-blue-600" />
                                <span>Indossa guanti in nitrile</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <Eye className="w-4 h-4 text-blue-600" />
                                <span>Occhiali di protezione</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <Wind className="w-4 h-4 text-blue-600" />
                                <span>Assicurati di avere ventilazione</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <Beaker className="w-5 h-5 text-green-600" />
                            <span>Preparazione Area</span>
                          </h4>
                          <div className="bg-white p-4 rounded-lg border">
                            <ul className="space-y-2 text-sm">
                              <li>• Superficie pulita e stabile</li>
                              <li>• Barattolo di vetro sterilizzato</li>
                              <li>• Siringhe graduate pulite</li>
                              <li>• Acqua distillata a temperatura ambiente</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.id === 2 && (
                    <div className="space-y-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Attenzione</h4>
                        <p className="text-yellow-800 text-sm">
                          Aggiungi sempre l'acido per secondo. Mai il contrario. 
                          Mescolare lentamente per evitare reazioni troppo vigorose.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-4">Proporzioni Standard</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded">
                              <span>Clorito di sodio 25%</span>
                              <span className="font-bold">1 ml</span>
                            </div>
                            <div className="text-center text-gray-500 text-sm">+</div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                              <span>Acido cloridrico 4%</span>
                              <span className="font-bold">1 ml</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-4">Procedura</h4>
                          <ol className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                              <span className="flex-shrink-0 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                              <span>Misura 1ml di clorito di sodio nel barattolo</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="flex-shrink-0 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                              <span>Aggiungi lentamente 1ml di acido cloridrico</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="flex-shrink-0 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                              <span>Mescola delicatamente per 10 secondi</span>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.id === 3 && (
                    <div className="space-y-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <Timer className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                        <h4 className="font-semibold text-yellow-900 text-xl mb-2">
                          Tempo di Attivazione: 3 minuti
                        </h4>
                        <p className="text-yellow-800">
                          La miscela dovrebbe diventare di colore giallo ambra. 
                          Non coprire il contenitore per permettere la fuoriuscita dei gas.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border text-center">
                          <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <span className="text-red-600 font-bold">0-1min</span>
                          </div>
                          <h5 className="font-semibold text-gray-900">Inizio Reazione</h5>
                          <p className="text-sm text-gray-600 mt-1">Colore trasparente, leggero frizzio</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border text-center">
                          <div className="w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <span className="text-yellow-600 font-bold">1-2min</span>
                          </div>
                          <h5 className="font-semibold text-gray-900">Attivazione</h5>
                          <p className="text-sm text-gray-600 mt-1">Colore giallognolo, odore caratteristico</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border text-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <span className="text-green-600 font-bold">3min</span>
                          </div>
                          <h5 className="font-semibold text-gray-900">Pronto</h5>
                          <p className="text-sm text-gray-600 mt-1">Giallo ambra intenso, reazione completa</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.id === 4 && (
                    <div className="space-y-6">
                      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                        <h4 className="font-semibold text-cyan-900 mb-3 flex items-center space-x-2">
                          <Droplets className="w-5 h-5" />
                          <span>Rapporto di Diluizione</span>
                        </h4>
                        <p className="text-cyan-800 mb-4">
                          Per ottenere CDS standard (3000 ppm), aggiungi 100ml di acqua distillata 
                          alla miscela attivata (2ml totali).
                        </p>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="text-center">
                            <span className="text-2xl font-bold text-gray-900">2ml miscela + 100ml acqua = CDS 3000 ppm</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-4">Procedura di Diluizione</h4>
                          <ol className="space-y-3 text-sm">
                            <li className="flex items-start space-x-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                              <span>Misura 100ml di acqua distillata fresca</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                              <span>Aggiungi lentamente la miscela attivata</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                              <span>Mescola delicatamente per omogeneizzare</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                              <span>Il CDS è pronto all'uso</span>
                            </li>
                          </ol>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-4">Caratteristiche del CDS Pronto</h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
                              <span className="text-sm">Colore: giallo paglierino chiaro</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                              <span className="text-sm">pH: neutro (6.5-7.5)</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                              <span className="text-sm">Odore: leggero di cloro</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                              <span className="text-sm">Concentrazione: ~3000 ppm</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.id === 5 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <Scale className="w-5 h-5 text-purple-600" />
                            <span>Test di Concentrazione</span>
                          </h4>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600 mb-3">
                              Usa strips test per verificare la concentrazione di cloro libero
                            </p>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">CDS Standard</span>
                                <span className="text-sm font-bold text-purple-600">3000 ppm</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{width: '100%'}}></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Range accettabile: 2800-3200 ppm
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <Thermometer className="w-5 h-5 text-blue-600" />
                            <span>Conservazione</span>
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Thermometer className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-blue-900">Temperatura</p>
                                <p className="text-sm text-blue-700">2-8°C (frigorifero)</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Contenitore</p>
                                <p className="text-sm text-gray-700">Vetro scuro, chiuso ermeticamente</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div>
                                <p className="font-medium text-yellow-900">Durata</p>
                                <p className="text-sm text-yellow-700">6-8 mesi se conservato correttamente</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                          <h4 className="font-semibold text-green-900 text-lg">CDS Preparato con Successo!</h4>
                        </div>
                        <p className="text-green-800 mb-4">
                          Il tuo CDS è ora pronto per l'uso. Ricorda di consultare sempre un medico esperto 
                          per dosaggi e protocolli specifici per la tua condizione.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Link
                            href="/chat"
                            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span>Chiedi Dosaggi all'AI</span>
                          </Link>
                          <Link
                            href="/protocolli"
                            className="flex items-center justify-center space-x-2 bg-white text-green-600 border-2 border-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                          >
                            <FileText className="w-5 h-5" />
                            <span>Vedi Protocolli</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                    disabled={activeStep === 1}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Precedente</span>
                  </button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Tempo stimato rimanente</p>
                    <p className="font-bold text-gray-900">
                      {steps.slice(activeStep - 1).reduce((total, step) => total + parseInt(step.duration), 0)} minuti
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
                    disabled={activeStep === steps.length}
                    className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Successivo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Reference Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Riferimento Rapido</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <h3 className="font-semibold mb-3">Proporzioni Base</h3>
              <div className="space-y-2 text-sm">
                <p>• Clorito Na 25%: 1ml</p>
                <p>• Acido HCl 4%: 1ml</p>
                <p>• Acqua distillata: 100ml</p>
                <p>• Risultato: CDS 3000 ppm</p>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <h3 className="font-semibold mb-3">Tempi di Processo</h3>
              <div className="space-y-2 text-sm">
                <p>• Preparazione: 5 min</p>
                <p>• Attivazione: 3 min</p>
                <p>• Diluizione: 2 min</p>
                <p>• Totale: ~15 minuti</p>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <h3 className="font-semibold mb-3">Conservazione</h3>
              <div className="space-y-2 text-sm">
                <p>• Temperatura: 2-8°C</p>
                <p>• Contenitore: vetro scuro</p>
                <p>• Durata: 6-8 mesi</p>
                <p>• Controllare colore/odore</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-lg opacity-90 mb-4">
              Hai domande sulla preparazione o sui dosaggi?
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center space-x-2 bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <MessageCircle className="w-6 h-6" />
              <span>Chiedi all'AI Assistant</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreparazioneCDS;