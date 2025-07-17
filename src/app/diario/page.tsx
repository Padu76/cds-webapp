"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, ArrowLeft, TrendingUp, FileText, Clock, Star, Edit3, Trash2, Save, X, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface DiaryEntry {
  id: string;
  date: string;
  symptoms: Symptom[];
  protocols: Protocol[];
  notes: string;
  mood: number;
  energy: number;
}

interface Symptom {
  id: string;
  name: string;
  intensity: number;
  notes?: string;
}

interface Protocol {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

const DiarioPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Form states
  const [newSymptom, setNewSymptom] = useState({ name: '', intensity: 5 });
  const [newProtocol, setNewProtocol] = useState({ name: '', dosage: '', time: '' });
  const [newNotes, setNewNotes] = useState('');
  const [newMood, setNewMood] = useState(5);
  const [newEnergy, setNewEnergy] = useState(5);

  // Carica dati dal localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('diario-entries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Salva dati nel localStorage
  useEffect(() => {
    localStorage.setItem('diario-entries', JSON.stringify(entries));
  }, [entries]);

  // Ottieni entry per data specifica
  const getEntryForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return entries.find(entry => entry.date === dateString);
  };

  // Aggiungi o aggiorna entry
  const saveEntry = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const existingEntry = getEntryForDate(selectedDate);
    
    const entryData = {
      date: dateString,
      symptoms: editingEntry ? editingEntry.symptoms : [],
      protocols: editingEntry ? editingEntry.protocols : [],
      notes: newNotes,
      mood: newMood,
      energy: newEnergy
    };

    if (existingEntry) {
      setEntries(entries.map(entry => 
        entry.date === dateString ? { ...entry, ...entryData } : entry
      ));
    } else {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        ...entryData
      };
      setEntries([...entries, newEntry]);
    }

    setShowAddModal(false);
    setEditingEntry(null);
    resetForm();
  };

  // Aggiungi sintomo
  const addSymptom = () => {
    if (!newSymptom.name.trim()) return;
    
    const symptom: Symptom = {
      id: Date.now().toString(),
      name: newSymptom.name,
      intensity: newSymptom.intensity
    };

    if (editingEntry) {
      setEditingEntry({
        ...editingEntry,
        symptoms: [...editingEntry.symptoms, symptom]
      });
    }

    setNewSymptom({ name: '', intensity: 5 });
  };

  // Aggiungi protocollo
  const addProtocol = () => {
    if (!newProtocol.name.trim()) return;
    
    const protocol: Protocol = {
      id: Date.now().toString(),
      name: newProtocol.name,
      dosage: newProtocol.dosage,
      time: newProtocol.time,
      taken: false
    };

    if (editingEntry) {
      setEditingEntry({
        ...editingEntry,
        protocols: [...editingEntry.protocols, protocol]
      });
    }

    setNewProtocol({ name: '', dosage: '', time: '' });
  };

  // Rimuovi sintomo
  const removeSymptom = (symptomId: string) => {
    if (editingEntry) {
      setEditingEntry({
        ...editingEntry,
        symptoms: editingEntry.symptoms.filter(s => s.id !== symptomId)
      });
    }
  };

  // Rimuovi protocollo
  const removeProtocol = (protocolId: string) => {
    if (editingEntry) {
      setEditingEntry({
        ...editingEntry,
        protocols: editingEntry.protocols.filter(p => p.id !== protocolId)
      });
    }
  };

  // Toggle protocollo preso
  const toggleProtocol = (protocolId: string) => {
    if (editingEntry) {
      setEditingEntry({
        ...editingEntry,
        protocols: editingEntry.protocols.map(p => 
          p.id === protocolId ? { ...p, taken: !p.taken } : p
        )
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setNewSymptom({ name: '', intensity: 5 });
    setNewProtocol({ name: '', dosage: '', time: '' });
    setNewNotes('');
    setNewMood(5);
    setNewEnergy(5);
  };

  // Apri modal per aggiungere entry
  const openAddModal = () => {
    const existingEntry = getEntryForDate(selectedDate);
    if (existingEntry) {
      setEditingEntry(existingEntry);
      setNewNotes(existingEntry.notes);
      setNewMood(existingEntry.mood);
      setNewEnergy(existingEntry.energy);
    } else {
      setEditingEntry({
        id: '',
        date: selectedDate.toISOString().split('T')[0],
        symptoms: [],
        protocols: [],
        notes: '',
        mood: 5,
        energy: 5
      });
    }
    setShowAddModal(true);
  };

  // Genera calendario
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // Ottieni statistiche
  const getStats = () => {
    const last30Days = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return entryDate >= thirtyDaysAgo;
    });

    const avgMood = last30Days.reduce((sum, entry) => sum + entry.mood, 0) / last30Days.length || 0;
    const avgEnergy = last30Days.reduce((sum, entry) => sum + entry.energy, 0) / last30Days.length || 0;
    
    const symptomFrequency: {[key: string]: number} = {};
    last30Days.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        symptomFrequency[symptom.name] = (symptomFrequency[symptom.name] || 0) + 1;
      });
    });

    return {
      totalEntries: last30Days.length,
      avgMood: avgMood.toFixed(1),
      avgEnergy: avgEnergy.toFixed(1),
      mostFrequentSymptom: Object.keys(symptomFrequency).sort((a, b) => symptomFrequency[b] - symptomFrequency[a])[0] || 'Nessuno'
    };
  };

  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const days = generateCalendar();
  const stats = getStats();

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
              <Calendar className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Diario Salute
              </h1>
            </div>
            <button
              onClick={() => setShowStatsModal(true)}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistiche</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className={`rounded-2xl shadow-sm overflow-hidden mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Days of week */}
          <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-700">
            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = day.toDateString() === selectedDate.toDateString();
              const hasEntry = getEntryForDate(day);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`p-3 h-16 border-r border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative ${
                    !isCurrentMonth ? 'text-gray-400' : ''
                  } ${isSelected ? 'bg-emerald-100 dark:bg-emerald-900' : ''} ${
                    isToday ? 'font-bold text-emerald-600' : ''
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-sm">{day.getDate()}</span>
                    {hasEntry && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Day Summary */}
          <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {selectedDate.toLocaleDateString('it-IT', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={openAddModal}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi</span>
              </button>
            </div>

            {getEntryForDate(selectedDate) ? (
              <div className="space-y-4">
                {/* Mood & Energy */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Umore</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < getEntryForDate(selectedDate)!.mood ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm">({getEntryForDate(selectedDate)!.mood}/10)</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Energia</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < getEntryForDate(selectedDate)!.energy ? 'text-green-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm">({getEntryForDate(selectedDate)!.energy}/10)</span>
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                {getEntryForDate(selectedDate)!.symptoms.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Sintomi</h4>
                    <div className="space-y-2">
                      {getEntryForDate(selectedDate)!.symptoms.map(symptom => (
                        <div key={symptom.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <span>{symptom.name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Intensità: {symptom.intensity}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Protocols */}
                {getEntryForDate(selectedDate)!.protocols.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Protocolli</h4>
                    <div className="space-y-2">
                      {getEntryForDate(selectedDate)!.protocols.map(protocol => (
                        <div key={protocol.id} className={`p-2 rounded-lg ${protocol.taken ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          <div className="flex items-center justify-between">
                            <span className={protocol.taken ? 'line-through' : ''}>{protocol.name}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{protocol.time}</span>
                          </div>
                          {protocol.dosage && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">{protocol.dosage}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {getEntryForDate(selectedDate)!.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Note</h4>
                    <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getEntryForDate(selectedDate)!.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Nessuna entry per questo giorno</p>
                <p className="text-sm">Clicca "Aggiungi" per iniziare</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
              Statistiche Rapide
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{stats.totalEntries}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Giorni registrati</div>
              </div>
              <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.avgMood}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Umore medio</div>
              </div>
              <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.avgEnergy}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Energia media</div>
              </div>
              <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{stats.mostFrequentSymptom}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sintomo frequente</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {editingEntry?.id ? 'Modifica' : 'Aggiungi'} Entry
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Mood & Energy */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Umore (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newMood}
                      onChange={(e) => setNewMood(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span className="font-medium">{newMood}</span>
                      <span>10</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Energia (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newEnergy}
                      onChange={(e) => setNewEnergy(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span className="font-medium">{newEnergy}</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sintomi</label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      placeholder="Nome sintomo"
                      value={newSymptom.name}
                      onChange={(e) => setNewSymptom({...newSymptom, name: e.target.value})}
                      className={`flex-1 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newSymptom.intensity}
                      onChange={(e) => setNewSymptom({...newSymptom, intensity: Number(e.target.value)})}
                      className={`w-20 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={addSymptom}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {editingEntry?.symptoms.map(symptom => (
                    <div key={symptom.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
                      <span>{symptom.name} (Intensità: {symptom.intensity})</span>
                      <button
                        onClick={() => removeSymptom(symptom.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Protocols */}
                <div>
                  <label className="block text-sm font-medium mb-2">Protocolli</label>
                  <div className="grid grid-cols-12 gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Nome protocollo"
                      value={newProtocol.name}
                      onChange={(e) => setNewProtocol({...newProtocol, name: e.target.value})}
                      className={`col-span-4 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <input
                      type="text"
                      placeholder="Dosaggio"
                      value={newProtocol.dosage}
                      onChange={(e) => setNewProtocol({...newProtocol, dosage: e.target.value})}
                      className={`col-span-4 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <input
                      type="time"
                      value={newProtocol.time}
                      onChange={(e) => setNewProtocol({...newProtocol, time: e.target.value})}
                      className={`col-span-3 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={addProtocol}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {editingEntry?.protocols.map(protocol => (
                    <div key={protocol.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={protocol.taken}
                          onChange={() => toggleProtocol(protocol.id)}
                          className="w-4 h-4"
                        />
                        <span className={protocol.taken ? 'line-through' : ''}>
                          {protocol.name} - {protocol.dosage} ({protocol.time})
                        </span>
                      </div>
                      <button
                        onClick={() => removeProtocol(protocol.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Note</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Aggiungi note, osservazioni o commenti..."
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={saveEntry}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salva</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Statistiche Dettagliate</h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <div className="text-3xl font-bold text-emerald-600">{stats.totalEntries}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Giorni registrati</div>
                </div>
                <div className="text-center p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{stats.avgMood}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Umore medio</div>
                </div>
                <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{stats.avgEnergy}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Energia media</div>
                </div>
                <div className="text-center p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{stats.mostFrequentSymptom}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sintomo più frequente</div>
                </div>
              </div>

              <div className="text-center text-gray-500 py-8">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Grafici dettagliati in arrivo</p>
                <p className="text-sm">Continua a registrare i tuoi dati per visualizzare trend e analisi avanzate</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiarioPage;