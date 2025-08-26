"use client"
import React, { useState, useEffect } from 'react';

import { 
  Calendar, Plus, TrendingUp, Activity, Clock, 
  ArrowLeft, Save, Edit3, Trash2, Filter,
  Droplet, Pill, ThermometerSun, Heart,
  BarChart3, LineChart, PieChart, FileText,
  CheckCircle, AlertCircle, MinusCircle, Download
} from 'lucide-react';

const DiarioPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('oggi');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Form per nuovo entry
  const [newEntry, setNewEntry] = useState({
    data: new Date().toISOString().split('T')[0],
    ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    sostanza: 'cds',
    dosaggio: '',
    sintomi_prima: '',
    sintomi_dopo: '',
    note: '',
    energia: 5,
    dolore: 3,
    sonno: 7,
    umore: 6
  });

  // Dati mock del diario
  const [entries, setEntries] = useState([
    {
      id: 1,
      data: '2025-08-26',
      ora: '08:00',
      sostanza: 'cds',
      dosaggio: '2ml in 200ml acqua',
      sintomi_prima: 'Mal di testa lieve, stanchezza',
      sintomi_dopo: 'Miglioramento mal di testa dopo 2h',
      note: 'Prima dose della giornata, stomaco vuoto',
      energia: 6,
      dolore: 2,
      sonno: 7,
      umore: 7
    },
    {
      id: 2,
      data: '2025-08-26',
      ora: '14:00',
      sostanza: 'cds',
      dosaggio: '2ml in 200ml acqua',
      sintomi_prima: 'Energia buona',
      sintomi_dopo: 'Stabile, nessun effetto negativo',
      note: 'Seconda dose, lontano dai pasti',
      energia: 7,
      dolore: 1,
      sonno: 7,
      umore: 8
    },
    {
      id: 3,
      data: '2025-08-25',
      ora: '09:00',
      sostanza: 'blu_metilene',
      dosaggio: '70mg in capsula',
      sintomi_prima: 'Nebbia mentale, concentrazione scarsa',
      sintomi_dopo: 'Chiarezza mentale migliorata dopo 1h',
      note: 'Primo test BM, colore urine blu-verde normale',
      energia: 8,
      dolore: 1,
      sonno: 8,
      umore: 8
    }
  ]);

  const todayEntries = entries.filter(entry => entry.data === selectedDate);
  
  // Statistiche
  const getWeekStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEntries = entries.filter(entry => new Date(entry.data) >= weekAgo);
    
    const avgEnergia = weekEntries.reduce((sum, e) => sum + e.energia, 0) / (weekEntries.length || 1);
    const avgDolore = weekEntries.reduce((sum, e) => sum + e.dolore, 0) / (weekEntries.length || 1);
    const avgSonno = weekEntries.reduce((sum, e) => sum + e.sonno, 0) / (weekEntries.length || 1);
    const avgUmore = weekEntries.reduce((sum, e) => sum + e.umore, 0) / (weekEntries.length || 1);
    
    return {
      energia: avgEnergia.toFixed(1),
      dolore: avgDolore.toFixed(1),
      sonno: avgSonno.toFixed(1),
      umore: avgUmore.toFixed(1),
      totalDosi: weekEntries.length
    };
  };

  const weekStats = getWeekStats();

  const handleSaveEntry = () => {
    if (editingEntry) {
      setEntries(entries.map(entry => 
        entry.id === editingEntry.id ? { ...newEntry, id: editingEntry.id } : entry
      ));
      setEditingEntry(null);
    } else {
      setEntries([...entries, { ...newEntry, id: Date.now() }]);
    }
    
    setNewEntry({
      data: new Date().toISOString().split('T')[0],
      ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      sostanza: 'cds',
      dosaggio: '',
      sintomi_prima: '',
      sintomi_dopo: '',
      note: '',
      energia: 5,
      dolore: 3,
      sonno: 7,
      umore: 6
    });
    setShowAddModal(false);
  };

  const handleEditEntry = (entry) => {
    setNewEntry(entry);
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const handleDeleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const getSostanzaIcon = (sostanza) => {
    return sostanza === 'cds' ? Droplet : Pill;
  };

  const getSostanzaColor = (sostanza) => {
    return sostanza === 'cds' ? 'text-blue-600' : 'text-indigo-600';
  };

  const getScoreColor = (score, type) => {
    if (type === 'dolore') {
      if (score <= 3) return 'text-green-600';
      if (score <= 6) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (score >= 7) return 'text-green-600';
      if (score >= 4) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

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
                <Calendar className="text-green-600" size={28} />
                <span>Diario Trattamenti</span>
              </h1>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg"
            >
              <Plus size={20} />
              <span>Nuova Voce</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Energia Media', value: weekStats.energia, icon: TrendingUp, color: 'blue', unit: '/10' },
            { label: 'Dolore Medio', value: weekStats.dolore, icon: MinusCircle, color: 'red', unit: '/10' },
            { label: 'Sonno Medio', value: weekStats.sonno, icon: ThermometerSun, color: 'purple', unit: '/10' },
            { label: 'Umore Medio', value: weekStats.umore, icon: Heart, color: 'pink', unit: '/10' },
            { label: 'Dosi Settimana', value: weekStats.totalDosi, icon: Activity, color: 'green', unit: '' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {stat.value}{stat.unit}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <stat.icon className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs e Calendario */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6">
            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
              {[
                { id: 'oggi', label: 'Oggi', icon: Clock },
                { id: 'settimana', label: 'Settimana', icon: BarChart3 },
                { id: 'statistiche', label: 'Statistiche', icon: TrendingUp }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Selettore Data */}
            {activeTab === 'oggi' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleziona Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Contenuto Tabs */}
        {activeTab === 'oggi' && (
          <div className="space-y-6">
            {todayEntries.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nessuna voce per {new Date(selectedDate).toLocaleDateString('it-IT')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Aggiungi la prima voce del diario per questa data.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Aggiungi Voce
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {todayEntries.map(entry => {
                  const SostanzaIcon = getSostanzaIcon(entry.sostanza);
                  return (
                    <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                              <SostanzaIcon className={getSostanzaColor(entry.sostanza)} size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                {entry.sostanza === 'cds' ? 'CDS' : 'Blu di Metilene'} - {entry.ora}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Dosaggio: {entry.dosaggio}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditEntry(entry)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Sintomi */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Sintomi Prima:
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              {entry.sintomi_prima || 'Non specificato'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Sintomi Dopo:
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              {entry.sintomi_dopo || 'Non specificato'}
                            </p>
                          </div>
                        </div>

                        {/* Scores */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {[
                            { label: 'Energia', value: entry.energia, type: 'energia' },
                            { label: 'Dolore', value: entry.dolore, type: 'dolore' },
                            { label: 'Sonno', value: entry.sonno, type: 'sonno' },
                            { label: 'Umore', value: entry.umore, type: 'umore' }
                          ].map((score, index) => (
                            <div key={index} className="text-center">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {score.label}
                              </p>
                              <p className={`text-xl font-bold ${getScoreColor(score.value, score.type)}`}>
                                {score.value}/10
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Note */}
                        {entry.note && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                              Note:
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                              {entry.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab Statistiche */}
        {activeTab === 'statistiche' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <LineChart className="text-blue-600" size={20} />
                <span>Andamento Settimanale</span>
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Energia', value: weekStats.energia, max: 10 },
                  { label: 'Sonno', value: weekStats.sonno, max: 10 },
                  { label: 'Umore', value: weekStats.umore, max: 10 },
                  { label: 'Dolore', value: weekStats.dolore, max: 10, inverse: true }
                ].map((metric, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{metric.label}</span>
                      <span className="text-gray-600 dark:text-gray-400">{metric.value}/{metric.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${metric.inverse ? 'bg-red-600' : 'bg-green-600'}`}
                        style={{ width: `${(parseFloat(metric.value) / metric.max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <PieChart className="text-indigo-600" size={20} />
                <span>Distribuzione Sostanze</span>
              </h3>
              
              <div className="space-y-3">
                {Object.entries(
                  entries.reduce((acc, entry) => {
                    acc[entry.sostanza] = (acc[entry.sostanza] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([sostanza, count], index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-600">
                        {sostanza === 'cds' ? (
                          <Droplet className="text-blue-600" size={16} />
                        ) : (
                          <Pill className="text-indigo-600" size={16} />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {sostanza === 'cds' ? 'CDS' : 'Blu di Metilene'}
                      </span>
                    </div>
                    <span className="font-bold text-gray-600 dark:text-gray-400">
                      {count} dosi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Aggiunta/Modifica */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingEntry ? 'Modifica Voce' : 'Nuova Voce Diario'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEntry(null);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Data e Ora */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={newEntry.data}
                      onChange={(e) => setNewEntry({...newEntry, data: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ora
                    </label>
                    <input
                      type="time"
                      value={newEntry.ora}
                      onChange={(e) => setNewEntry({...newEntry, ora: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Sostanza e Dosaggio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sostanza
                    </label>
                    <select
                      value={newEntry.sostanza}
                      onChange={(e) => setNewEntry({...newEntry, sostanza: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    >
                      <option value="cds">CDS</option>
                      <option value="blu_metilene">Blu di Metilene</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dosaggio
                    </label>
                    <input
                      type="text"
                      value={newEntry.dosaggio}
                      onChange={(e) => setNewEntry({...newEntry, dosaggio: e.target.value})}
                      placeholder="es. 2ml in 200ml acqua"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Sintomi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sintomi Prima
                    </label>
                    <textarea
                      value={newEntry.sintomi_prima}
                      onChange={(e) => setNewEntry({...newEntry, sintomi_prima: e.target.value})}
                      placeholder="Descrivi i sintomi prima dell'assunzione..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sintomi Dopo
                    </label>
                    <textarea
                      value={newEntry.sintomi_dopo}
                      onChange={(e) => setNewEntry({...newEntry, sintomi_dopo: e.target.value})}
                      placeholder="Descrivi i cambiamenti dopo l'assunzione..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'energia', label: 'Energia', icon: TrendingUp },
                    { key: 'dolore', label: 'Dolore', icon: MinusCircle },
                    { key: 'sonno', label: 'Sonno', icon: ThermometerSun },
                    { key: 'umore', label: 'Umore', icon: Heart }
                  ].map((score, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
                        <score.icon size={16} />
                        <span>{score.label}</span>
                      </label>
                      <select
                        value={newEntry[score.key]}
                        onChange={(e) => setNewEntry({...newEntry, [score.key]: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i} value={i + 1}>{i + 1}/10</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note
                  </label>
                  <textarea
                    value={newEntry.note}
                    onChange={(e) => setNewEntry({...newEntry, note: e.target.value})}
                    placeholder="Note aggiuntive, reazioni, osservazioni..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    onClick={handleSaveEntry}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex-1"
                  >
                    <Save size={20} />
                    <span>{editingEntry ? 'Salva Modifiche' : 'Salva Voce'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingEntry(null);
                    }}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiarioPage;