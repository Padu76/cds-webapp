"use client"
import React, { useState } from 'react';
import { Search, Heart, Calendar, FileText, MessageCircle, ChevronRight, Menu, X, Sun, Moon, Shield, Users, Zap } from 'lucide-react';
import Link from 'next/link';

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 backdrop-blur-md transition-all duration-300 ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                CDS Wellness
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/protocolli" className="text-gray-600 hover:text-emerald-600 transition-colors">Protocolli</Link>
              <Link href="/sintomi" className="text-gray-600 hover:text-emerald-600 transition-colors">Sintomi</Link>
              <Link href="/diario" className="text-gray-600 hover:text-emerald-600 transition-colors">Diario</Link>
              <Link href="/toolkit" className="text-gray-600 hover:text-emerald-600 transition-colors">Toolkit</Link>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${darkMode ? 'bg-gray-900' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="px-4 py-2 space-y-1">
              <Link href="/protocolli" className="block px-3 py-2 text-gray-600 hover:text-emerald-600">Protocolli</Link>
              <Link href="/sintomi" className="block px-3 py-2 text-gray-600 hover:text-emerald-600">Sintomi</Link>
              <Link href="/diario" className="block px-3 py-2 text-gray-600 hover:text-emerald-600">Diario</Link>
              <Link href="/toolkit" className="block px-3 py-2 text-gray-600 hover:text-emerald-600">Toolkit</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Il tuo{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                assistente
              </span>
              {' '}per CDS e Blu di Metilene
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Scopri i protocolli più adatti per le tue esigenze con l'aiuto dell'intelligenza artificiale
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/sintomi" className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Cerca per Sintomo</span>
              </Link>
              <Link href="/chat" className="border-2 border-emerald-500 text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 flex items-center justify-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Chiedi all'AI</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Come Funziona */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Come Funziona</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Semplice, veloce e personalizzato</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Inserisci il Sintomo</h3>
              <p className="text-gray-600 dark:text-gray-400">Descrivi il tuo sintomo o condizione nella barra di ricerca</p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analizza</h3>
              <p className="text-gray-600 dark:text-gray-400">L'intelligenza artificiale suggerisce CDS o Blu di Metilene</p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Ricevi Protocollo</h3>
              <p className="text-gray-600 dark:text-gray-400">Ottieni il protocollo personalizzato e monitora i progressi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Strumenti Principali</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Tutto quello che ti serve in un posto</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <Link href="/sintomi" className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-300'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cerca Sintomi</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Trova rapidamente i protocolli adatti</p>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                Inizia <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            {/* Card 2 */}
            <Link href="/chat" className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-300'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Assistente AI</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Chiedi consigli personalizzati</p>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                Chatta <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            {/* Card 3 */}
            <Link href="/diario" className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-300'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Diario Salute</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Monitora i tuoi progressi</p>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                Apri <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            {/* Card 4 */}
            <Link href="/protocolli" className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-300'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Protocolli</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Consulta tutti i protocolli</p>
              <div className="flex items-center text-emerald-600 text-sm font-medium">
                Sfoglia <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sicuro e Affidabile</h3>
              <p className="text-gray-600 dark:text-gray-400">Protocolli verificati e basati su ricerca scientifica</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunità Attiva</h3>
              <p className="text-gray-600 dark:text-gray-400">Supporto da parte di altri utenti ed esperti</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sempre Aggiornato</h3>
              <p className="text-gray-600 dark:text-gray-400">Protocolli costantemente aggiornati con nuove ricerche</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 sm:px-6 lg:px-8 border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                CDS Wellness
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              © 2024 CDS Wellness. Tutti i diritti riservati.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;