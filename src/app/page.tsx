"use client"
import React, { useState } from 'react';
import { 
  Bot, FileText, Activity, Calculator, MessageCircle, 
  FlaskConical, BookOpen, Search, BarChart3, Download,
  Shield, Users, Clock, ChevronRight, ExternalLink, X,
  Beaker, Droplets, Menu, ChevronDown, Star, Award
} from 'lucide-react';

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'cds' | 'blu' | null>(null);

  const openModal = (type: 'cds' | 'blu') => {
    setModalContent(type);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header Mobile-First */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  CDS Wellness
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">AI Assistant Specializzato</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a href="/chat" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                Chat AI
              </a>
              <a href="/documentazione" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                Documentazione
              </a>
              <a href="/preparazione-cds" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                Preparazione CDS
              </a>
              <a href="/protocolli" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                Protocolli
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              <nav className="flex flex-col space-y-2">
                <a href="/chat" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-emerald-50">
                  Chat AI
                </a>
                <a href="/documentazione" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-emerald-50">
                  Documentazione
                </a>
                <a href="/preparazione-cds" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-emerald-50">
                  Preparazione CDS
                </a>
                <a href="/protocolli" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 px-2 rounded-lg hover:bg-emerald-50">
                  Protocolli
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Star className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Assistente AI Specializzato</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
            Il tuo esperto digitale per
            <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              CDS e Blu di Metilene
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2 sm:px-4">
            Protocolli validati, dosaggi personalizzati e ricerche scientifiche. 
            L'intelligenza artificiale che risponde alle tue domande specifiche con precisione professionale.
          </p>

          {/* CTA Buttons - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
            <a
              href="/chat"
              className="group bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Inizia Chat AI</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <a
              href="/documentazione"
              className="group bg-white text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg border-2 border-gray-200 hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Esplora Documenti</span>
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* CDS e Blu di Metilene Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16 px-2 sm:px-0">
          {/* CDS Card */}
          <button
            onClick={() => openModal('cds')}
            className="group bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-emerald-200 text-left w-full"
          >
            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Droplets className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  CDS
                </h3>
                <p className="text-emerald-600 font-medium text-sm sm:text-base">Diossido di Cloro</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
              Potente antimicrobico naturale con azione ossidante selettiva. 
              Efficace contro batteri, virus e funghi senza creare resistenze.
            </p>
            <div className="flex items-center text-emerald-600 group-hover:text-emerald-700 font-medium text-sm sm:text-base">
              <span>Scopri di più</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Blu di Metilene Card */}
          <button
            onClick={() => openModal('blu')}
            className="group bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-blue-200 text-left w-full"
          >
            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Beaker className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Blu di Metilene
                </h3>
                <p className="text-blue-600 font-medium text-sm sm:text-base">Neuroprotettore</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
              Composto neuroprotettivo che attraversa la barriera ematoencefalica. 
              Ideale per supporto cognitivo e disturbi neurologici.
            </p>
            <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium text-sm sm:text-base">
              <span>Scopri di più</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Stats - Mobile Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-8">
          {[
            { number: "7", label: "Database Integrati", color: "emerald" },
            { number: "500+", label: "Protocolli Disponibili", color: "cyan" },
            { number: "24/7", label: "Assistenza AI", color: "emerald" },
            { number: "100%", label: "Evidence-Based", color: "cyan" }
          ].map((stat, index) => (
            <div key={index} className="text-center bg-white/70 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl shadow-md">
              <div className={`text-xl sm:text-2xl lg:text-3xl font-bold text-${stat.color}-600 mb-1 sm:mb-2`}>
                {stat.number}
              </div>
              <div className="text-gray-600 text-xs sm:text-sm lg:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section - Mobile Optimized */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Tutto quello che serve per professionisti
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
            Funzionalità complete per protocolli CDS e Blu di Metilene in un'unica piattaforma intelligente
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[
            {
              icon: MessageCircle,
              title: "Chat AI Specializzata",
              description: "Intelligenza artificiale esperta che consulta automaticamente database e documenti personali per risposte precise.",
              link: "/chat",
              linkText: "Inizia chat",
              gradient: "from-emerald-500 to-cyan-500",
              color: "emerald"
            },
            {
              icon: BookOpen,
              title: "Archivio Documentazione",
              description: "Libreria completa di PDF, Word ed Excel con ricerca avanzata e filtri intelligenti.",
              link: "/documentazione",
              linkText: "Sfoglia archivio",
              gradient: "from-blue-500 to-indigo-500",
              color: "blue"
            },
            {
              icon: Beaker,
              title: "Guida Preparazione CDS",
              description: "Istruzioni step-by-step per la preparazione sicura del CDS con note di sicurezza complete.",
              link: "/preparazione-cds",
              linkText: "Vedi guida",
              gradient: "from-green-500 to-emerald-500",
              color: "green"
            },
            {
              icon: FileText,
              title: "Database Protocolli",
              description: "Accesso a centinaia di protocolli specifici per patologia con dosaggi dettagliati.",
              link: "/protocolli",
              linkText: "Esplora protocolli",
              gradient: "from-purple-500 to-pink-500",
              color: "purple"
            },
            {
              icon: Calculator,
              title: "Calcolatori Dosaggi",
              description: "Calcoli automatici personalizzati per peso, età e patologia con formule validate.",
              link: "/toolkit",
              linkText: "Usa calcolatori",
              gradient: "from-orange-500 to-red-500",
              color: "orange"
            },
            {
              icon: Activity,
              title: "Diario Trattamenti",
              description: "Monitora progressi e sintomi con grafici automatici e reportistica dettagliata.",
              link: "/diario",
              linkText: "Apri diario",
              gradient: "from-yellow-500 to-amber-500",
              color: "yellow"
            }
          ].map((feature, index) => (
            <div key={index} className="group bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                {feature.description}
              </p>
              <a 
                href={feature.link} 
                className={`inline-flex items-center space-x-2 text-${feature.color}-600 hover:text-${feature.color}-700 font-semibold group-hover:translate-x-2 transition-all text-sm sm:text-base`}
              >
                <span>{feature.linkText}</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gradient-to-r from-gray-50 to-blue-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Sicurezza e Qualità</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Perché scegliere CDS Wellness?
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "Sicurezza e Precisione",
                    description: "Dosaggi calcolati con formule validate e note di sicurezza complete per ogni protocollo."
                  },
                  {
                    icon: Users,
                    title: "Testimonianze Reali",
                    description: "Database di esperienze anonime di pazienti con risultati dettagliati e follow-up."
                  },
                  {
                    icon: Clock,
                    title: "Aggiornamenti Continui",
                    description: "Il database viene aggiornato costantemente con le ultime ricerche e protocolli."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-xl sm:rounded-2xl shadow-xl">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">
                Fonti Dati Integrate
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {[
                  { icon: FileText, number: "500+", label: "Protocolli", color: "emerald" },
                  { icon: Search, number: "200+", label: "Sintomi", color: "cyan" },
                  { icon: FlaskConical, number: "150+", label: "Ricerche", color: "purple" },
                  { icon: Users, number: "300+", label: "Testimonianze", color: "orange" }
                ].map((stat, index) => (
                  <div key={index} className="text-center p-3 sm:p-4 lg:p-6 bg-gray-50 rounded-lg sm:rounded-xl hover:shadow-md transition-shadow">
                    <stat.icon className={`w-8 h-8 sm:w-10 sm:h-10 text-${stat.color}-600 mx-auto mb-2 sm:mb-3`} />
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.number}</div>
                    <div className="text-gray-600 font-medium text-xs sm:text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-12 sm:py-16 lg:py-20">
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 text-white text-center shadow-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Inizia subito con il tuo assistente AI
          </h2>
          <p className="text-base sm:text-lg lg:text-xl opacity-90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            Chiedi qualsiasi domanda su CDS e Blu di Metilene. L'AI consulterà automaticamente tutti i database per risposte precise.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="/chat"
              className="bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center space-x-2 sm:space-x-3 transform hover:scale-105 duration-300"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Inizia Chat Gratuita</span>
            </a>
            <a
              href="/preparazione-cds"
              className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-white hover:text-emerald-600 transition-colors flex items-center justify-center space-x-2 sm:space-x-3 transform hover:scale-105 duration-300"
            >
              <Beaker className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Guida Preparazione</span>
            </a>
          </div>
        </div>
      </section>

      {/* Modals */}
      <Modal
        isOpen={modalContent === 'cds'}
        onClose={closeModal}
        title="CDS - Diossido di Cloro"
      >
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-emerald-50 rounded-xl">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-900 text-sm sm:text-base">Formula Chimica</h4>
              <p className="text-emerald-700 text-sm">ClO₂ - Diossido di Cloro</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Cos'è il CDS?</h4>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Il CDS (Chlorine Dioxide Solution) è una soluzione acquosa di diossido di cloro, 
              un potente ossidante con proprietà antimicrobiche. È diverso dal cloro comune e 
              agisce attraverso l'ossidazione selettiva dei patogeni.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Meccanismo d'Azione</h4>
            <ul className="text-gray-600 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>• Ossidazione selettiva delle pareti cellulari dei patogeni</li>
              <li>• Non crea resistenze batteriche</li>
              <li>• pH neutro, meno aggressivo dei disinfettanti comuni</li>
              <li>• Azione rapida contro virus, batteri e funghi</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Indicazioni Principali</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 text-sm">Infezioni Acute</h5>
                <p className="text-xs sm:text-sm text-gray-600">Batteriche, virali, fungine</p>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 text-sm">Supporto Immunitario</h5>
                <p className="text-xs sm:text-sm text-gray-600">Rafforzamento delle difese</p>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 text-sm">Detossificazione</h5>
                <p className="text-xs sm:text-sm text-gray-600">Eliminazione tossine</p>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 text-sm">Parassiti</h5>
                <p className="text-xs sm:text-sm text-gray-600">Protocolli antiparassitari</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
            <h4 className="font-semibold text-amber-900 mb-2 text-sm sm:text-base">⚠️ Note Importanti</h4>
            <ul className="text-amber-800 text-xs sm:text-sm space-y-1">
              <li>• Consultare sempre un medico esperto prima dell'uso</li>
              <li>• Iniziare con dosaggi minimi e aumentare gradualmente</li>
              <li>• Non superare mai i dosaggi raccomandati</li>
              <li>• Conservare in frigorifero e al buio</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <a
              href="/preparazione-cds"
              className="flex-1 bg-emerald-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-center hover:bg-emerald-600 transition-colors text-sm sm:text-base"
            >
              Guida Preparazione
            </a>
            <a
              href="/chat"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              Chiedi all'AI
            </a>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalContent === 'blu'}
        onClose={closeModal}
        title="Blu di Metilene - Neuroprotettore"
      >
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-xl flex items-center justify-center">
              <Beaker className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Formula Chimica</h4>
              <p className="text-blue-700 text-sm">C₁₆H₁₈ClN₃S - Blu di Metilene</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Cos'è il Blu di Metilene?</h4>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Il Blu di Metilene è un composto fenotiazico con proprietà neuroprotettive, 
              antimicrobiche e antiossidanti. È unico nella sua capacità di attraversare 
              la barriera ematoencefalica, rendendolo prezioso per il supporto neurologico.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Meccanismo d'Azione</h4>
            <ul className="text-gray-600 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>• Attraversa facilmente la barriera ematoencefalica</li>
              <li>• Supporta la funzione mitocondriale</li>
              <li>• Azione antiossidante sui neuroni</li>
              <li>• Migliora la memoria e le funzioni cognitive</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Indicazioni Principali</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 text-sm">Alzheimer</h5>
                <p className="text-xs sm:text-sm text-gray-600">Supporto cognitivo</p>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 text-sm">Parkinson</h5>
                <p className="text-xs sm:text-sm text-gray-600">Neuroprotezzione</p>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 text-sm">Depressione</h5>
                <p className="text-xs sm:text-sm text-gray-600">Supporto dell'umore</p>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 text-sm">Long COVID</h5>
                <p className="text-xs sm:text-sm text-gray-600">Recupero neurologico</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Caratteristiche Uniche</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-600 text-sm sm:text-base">Colorazione temporanea blu-verde delle urine (normale)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-600 text-sm sm:text-base">Migliore assorbimento se assunto con il cibo</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-600 text-sm sm:text-base">Effetto cumulativo - benefici crescenti nel tempo</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
            <h4 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">⚠️ Controindicazioni Importanti</h4>
            <ul className="text-red-800 text-xs sm:text-sm space-y-1">
              <li>• Non assumere con antidepressivi SSRI (rischio sindrome serotoninergica)</li>
              <li>• Evitare in caso di deficit G6PD</li>
              <li>• Consultare medico se si assumono altri farmaci</li>
              <li>• Non superare 7mg per kg di peso corporeo</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <a
              href="/protocolli"
              className="flex-1 bg-blue-500 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-center hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              Vedi Protocolli
            </a>
            <a
              href="/chat"
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              Chiedi all'AI
            </a>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">CDS Wellness</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">AI Assistant Specializzato</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md text-sm sm:text-base">
                Piattaforma intelligente che combina protocolli validati, ricerche scientifiche e testimonianze reali 
                per informazioni precise su CDS e Blu di Metilene.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Funzionalità</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><a href="/chat" className="hover:text-white transition-colors">Chat AI</a></li>
                <li><a href="/documentazione" className="hover:text-white transition-colors">Documentazione</a></li>
                <li><a href="/preparazione-cds" className="hover:text-white transition-colors">Preparazione CDS</a></li>
                <li><a href="/protocolli" className="hover:text-white transition-colors">Protocolli</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Risorse</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><a href="/sintomi" className="hover:text-white transition-colors">Database Sintomi</a></li>
                <li><a href="/diario" className="hover:text-white transition-colors">Diario Trattamenti</a></li>
                <li><a href="/toolkit" className="hover:text-white transition-colors">Calcolatori</a></li>
                <li>Guide Sicurezza</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="mb-2 text-sm sm:text-base">&copy; 2024 CDS Wellness. Powered by AI per protocolli CDS e Blu di Metilene.</p>
            <p className="text-xs sm:text-sm">
              ⚠️ Le informazioni fornite sono solo a scopo educativo. Consultare sempre un medico esperto prima dell'uso.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}