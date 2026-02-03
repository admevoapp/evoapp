
import React, { useState } from 'react';
import { UserCircleIcon, SearchIcon, UsersIcon, StarIcon, HeartPulseIcon, SparklesIcon, ShieldCheckIcon, LogoIcon, ArrowLeftIcon, MegaphoneIcon, DocumentTextIcon, CalendarIcon, FolderIcon, MicrophoneIcon, LocationMarkerIcon, AcademicCapIcon, TrophyIcon, LightBulbIcon, PlayCircleIcon, BookOpenIcon, PresentationChartLineIcon, TagIcon, DiamondIcon } from './icons';
import AuthModal from './AuthModal';
import Footer from './Footer';
import AboutPage from './AboutPage';
import MissionPage from './MissionPage';
import HowItWorksPage from './HowItWorksPage';
import AdminsPage from './AdminsPage';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';
import GuidelinesPage from './GuidelinesPage';
import CookiesPage from './CookiesPage';
import LibraryPage from './LibraryPage';
import BestPracticesPage from './BestPracticesPage';
import HelpCenterPage from './HelpCenterPage';
import ContactPage from './ContactPage';
import ReportPage from './ReportPage';
import PremiumPage from './PremiumPage';
import ShopPage from './ShopPage';
import CentralEvoPage from './CentralEvoPage';

interface LandingPageProps {
  onLogin: () => void;
}

const PurposeCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
  <div className="bg-surface-light rounded-2xl p-8 text-center border border-slate-200/50 shadow-md3-4 hover:shadow-md3-6 hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-center items-center w-16 h-16 bg-primary-light rounded-2xl mx-auto mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-gray-text">{description}</p>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
  <div className="bg-surface-dark/50 backdrop-blur-md rounded-3xl p-8 text-left border border-slate-800/50 shadow-md3-4 hover:shadow-md3-6 hover:-translate-y-1 transition-all duration-300 space-y-4">
    <div className="flex justify-start items-center w-12 h-12 bg-primary/20 rounded-xl">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
    <p className="text-slate-300">{description}</p>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; description: string; }> = ({ number, title, description }) => (
  <div className="bg-surface-light rounded-2xl p-8 border border-slate-200/50 shadow-md3-4">
    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-evo-blue to-evo-purple">{number}</span>
    <h3 className="mt-4 text-2xl font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-gray-text">{description}</p>
  </div>
);

const CentralCard: React.FC<{ icon: React.ReactNode; title: string; color: string }> = ({ icon, title, color }) => (
  <div className="bg-[#1C1C1E] border border-[#D1D5DB]/10 hover:border-evo-purple/50 rounded-xl p-6 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
      {icon}
    </div>
    <h3 className="text-white font-semibold text-lg">{title}</h3>
  </div>
);

const BenefitRow: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center space-x-3 hover:shadow-sm transition-all hover:scale-[1.01] hover:border-evo-orange/30 group backdrop-blur-sm">
    <div className="p-2 bg-white/10 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="font-bold text-slate-200 text-base">{title}</span>
  </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'mission' | 'how-it-works' | 'admins' | 'terms' | 'privacy' | 'guidelines' | 'cookies' | 'library' | 'best-practices' | 'help-center' | 'contact' | 'report' | 'premium' | 'shop' | 'central-evo'>('home');
  const [logoError, setLogoError] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    onLogin(); // Notifica o componente pai (App) que o login ocorreu
  };

  const handleNavigate = (page: string) => {
    if (page === 'about') {
      setCurrentView('about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'mission') {
      setCurrentView('mission');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'how-it-works') {
      setCurrentView('how-it-works');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'admins') {
      setCurrentView('admins');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'terms') {
      setCurrentView('terms');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'privacy') {
      setCurrentView('privacy');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'guidelines') {
      setCurrentView('guidelines');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'cookies') {
      setCurrentView('cookies');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'library') {
      setCurrentView('library');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'best-practices') {
      setCurrentView('best-practices');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'help-center') {
      setCurrentView('help-center');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'contact') {
      setCurrentView('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'report') {
      setCurrentView('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'premium') {
      setCurrentView('premium');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'shop') {
      setCurrentView('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'central-evo') {
      setCurrentView('central-evo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (currentView !== 'home') {
    return (
      <div className="bg-light dark:bg-dark min-h-screen flex flex-col">
        <header className="fixed top-0 left-0 right-0 bg-surface-light/80 dark:bg-dark/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 z-30 h-20 flex items-center">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-evo-purple transition-colors group"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Voltar ao Início</span>
            </button>
            <div className="flex items-center">
              <img
                src="/images/logo-evoapp-fundo-claro-300x65.png"
                alt="EVOAPP"
                className="h-8 w-auto dark:hidden opacity-80 hover:opacity-100 transition-opacity"
              />
              <img
                src="/images/logo-evoapp-fundo-escuro-600x150.png"
                alt="EVOAPP"
                className="h-8 w-auto hidden dark:block opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-6 pt-32 pb-12">
          {currentView === 'about' && <AboutPage />}
          {currentView === 'mission' && <MissionPage />}
          {currentView === 'how-it-works' && <HowItWorksPage />}
          {currentView === 'admins' && <AdminsPage />}
          {currentView === 'terms' && <TermsPage />}
          {currentView === 'privacy' && <PrivacyPage />}
          {currentView === 'guidelines' && <GuidelinesPage />}
          {currentView === 'cookies' && <CookiesPage />}
          {currentView === 'library' && <LibraryPage />}
          {currentView === 'best-practices' && <BestPracticesPage />}
          {currentView === 'help-center' && <HelpCenterPage />}
          {currentView === 'contact' && <ContactPage />}
          {currentView === 'report' && <ReportPage />}
          {currentView === 'premium' && <PremiumPage />}
          {currentView === 'shop' && <ShopPage />}
          {currentView === 'central-evo' && <CentralEvoPage />}
        </main>

        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="bg-light dark:bg-dark">
      {/* Header Landing Page */}
      <header className="absolute top-0 left-0 right-0 z-50 py-6">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
            {/* Logo placeholder if needed or keep hidden/subtle on hero */}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-dark-bg text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-evo-purple/20 via-transparent to-evo-orange/20 opacity-50"></div>
        <div className="container mx-auto px-6 py-12 sm:py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-8">
                {!logoError ? (
                  <img
                    src="/images/logo-evoapp-fundo-escuro-600x150.png"
                    alt="EVOAPP"
                    className="h-16 sm:h-24 w-auto object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="flex items-center space-x-3">
                    <LogoIcon className="h-16 w-16" />
                    <span className="text-4xl font-extrabold text-white tracking-tight">EVOAPP</span>
                  </div>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                Bem-vindo à <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">Comunidade EVOAPP</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0">
                A plataforma que conecta Amantes Radicais de Pessoas em todo o Brasil e no mundo.
              </p>
              <div className="mt-6 text-slate-400 space-y-4 max-w-2xl mx-auto lg:mx-0">
                <p>Aqui você encontra um ambiente seguro e inspirador para construir conexões reais, compartilhar ideias e continuar sua jornada de evolução.</p>
                <p>Junte-se a nós e faça parte de uma rede de apoio que celebra o amor e o propósito.</p>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-2xl shadow-md3-3 text-white bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange transition-all duration-300 hover:scale-105 hover:shadow-md3-6 focus:outline-none focus:ring-4 focus:ring-evo-purple/50"
                >
                  Criar minha conta
                </button>

                <div className="w-full sm:w-auto p-[2px] rounded-2xl bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange transition-all duration-300 hover:scale-105 hover:shadow-md3-6 group">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full h-full px-8 py-3.5 text-base font-semibold rounded-2xl bg-dark-bg relative flex items-center justify-center transition-all"
                  >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">
                      Já tenho conta
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Phone Image Section (Static) */}
            <div className="hidden lg:flex justify-center items-center relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-evo-blue to-evo-purple rounded-full blur-3xl opacity-20"></div>

              {/* Static Image */}
              <img
                src="https://static.wixstatic.com/media/8c7f55_73458363a1554f8aae9323e2d46eb89b~mv2.png"
                alt="Pessoa usando EVOAPP no celular"
                width={456}
                height={500}
                className="relative z-10 object-contain"
                style={{ width: '456px', height: '500px' }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-[#050505] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-evo-purple/10 rounded-full blur-[100px] pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-evo-blue/10 rounded-full blur-[100px] pointer-events-none opacity-50"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Números que contam <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue to-evo-purple">histórias</span>
            </h2>
            <p className="text-lg text-slate-400 mt-2">
              Impacto gerado pelo movimento EVO ao longo dos anos
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { value: "+300k", label: "Vidas impactadas" },
              { value: "+7k", label: "ARPs cadastrados" },
              { value: "+180", label: "Cidades representadas" },
              { value: "+400", label: "Eventos realizados" },
              { value: "+10", label: "Países presentes" },
            ].map((stat, index) => (
              <div key={index} className="bg-[#121212] border border-evo-purple/20 p-6 rounded-2xl text-center hover:border-evo-purple/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(202,4,255,0.15)] group relative overflow-hidden">
                {/* Soft inner glow on hover */}
                <div className="absolute inset-0 bg-evo-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 group-hover:from-evo-blue group-hover:to-evo-purple transition-all relative z-10">
                  {stat.value}
                </p>
                <p className="text-slate-400 text-sm mt-2 font-medium relative z-10">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-20 sm:py-24 bg-light">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Por que o EVOAPP existe?</h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-text">
            Somos o lugar para você continuar a jornada do Amor Radical, transformando aprendizados em conexões e ações que impactam o mundo.
          </p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <PurposeCard icon={<HeartPulseIcon className="w-8 h-8 text-primary" />} title="Conexão Verdadeira" description="Pessoas alinhadas com valores, não apenas interesses." />
            <PurposeCard icon={<SparklesIcon className="w-8 h-8 text-primary" />} title="Continuidade da Jornada" description="Um espaço para viver, praticar e compartilhar o Amor Radical." />
            <PurposeCard icon={<ShieldCheckIcon className="w-8 h-8 text-primary" />} title="Rede de Apoio" description="Uma comunidade que caminha junto, nos desafios e nas conquistas." />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-dark-bg text-white overflow-hidden py-20 sm:py-24">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-[50rem] h-[50rem] bg-evo-purple/30 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-1/2 -right-1/4 w-[50rem] h-[50rem] bg-evo-blue/30 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-1/4 left-1/3 w-[40rem] h-[40rem] bg-evo-orange/20 rounded-full blur-3xl opacity-40"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Conecte-se com ARPs que podem inspirar, ajudar e caminhar ao seu lado.</h2>
            <p className="mt-4 text-lg text-slate-300">
              Conexões que unem corações, talentos e propósitos em um só lugar.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<UserCircleIcon className="w-7 h-7 text-primary m-2.5" />} title="Perfis Completos" description="Crie seu perfil com foto, profissão, status EVO e muito mais." />
            <FeatureCard icon={<SearchIcon className="w-7 h-7 text-primary m-2.5" />} title="Busca Inteligente" description="Encontre ARPs por profissão, cidade, propósito ou momento de vida." />
            <FeatureCard icon={<UsersIcon className="w-7 h-7 text-primary m-2.5" />} title="Conexões Reais" description="Envie e aceite convites de conexão com outros ARPs." />
            <FeatureCard icon={<StarIcon className="w-7 h-7 text-primary m-2.5" />} title="Lista de Favoritos" description="Salve seus ARPs favoritos em uma lista privada." />
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 sm:py-24 bg-light">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Como funciona na prática?</h2>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <StepCard number="01" title="Crie sua conta ARP" description="O primeiro passo para se conectar. É rápido, fácil e seguro." />
            <StepCard number="02" title="Complete seu perfil" description="Quanto mais completo, maiores as chances de conexões valiosas." />
            <StepCard number="03" title="Comece a se conectar" description="Explore, busque, convide e fortaleça sua rede de Amantes Radicais." />
          </div>
        </div>
      </section>

      {/* Central EVO Section */}
      <section className="relative py-24 bg-dark-bg text-white overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-[#121212] to-[#0D0D0D] opacity-90"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Text and Cards */}
            <div>
              <div className="mb-12">
                <div className="inline-block px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6 border border-evo-purple/20">
                  Nova Funcionalidade
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight mb-4">
                  Central EVO — <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue to-evo-purple">Tudo o que você precisa acompanhar em um só lugar.</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Centralizamos tudo o que você precisa saber para não perder nada da nossa jornada. Um dashboard premium para sua evolução.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CentralCard
                  icon={<MegaphoneIcon className="w-6 h-6 text-evo-blue" />}
                  title="Avisos Oficiais"
                  color="bg-evo-blue"
                />
                <CentralCard
                  icon={<DocumentTextIcon className="w-6 h-6 text-evo-purple" />}
                  title="Comunicados EVO"
                  color="bg-evo-purple"
                />
                <CentralCard
                  icon={<CalendarIcon className="w-6 h-6 text-evo-orange" />}
                  title="Agenda EVO"
                  color="bg-evo-orange"
                />
                <CentralCard
                  icon={<FolderIcon className="w-6 h-6 text-green-400" />}
                  title="Materiais"
                  color="bg-green-500"
                />
                <CentralCard
                  icon={<MicrophoneIcon className="w-6 h-6 text-pink-500" />}
                  title="Mensagens do Márcio Micheli"
                  color="bg-pink-500"
                />
                <CentralCard
                  icon={<LocationMarkerIcon className="w-6 h-6 text-yellow-500" />}
                  title="Encontros Presenciais / Virtuais"
                  color="bg-yellow-500"
                />
              </div>
            </div>

            {/* Right Column: Abstract Dashboard Image */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Decorative glow */}
              <div className="absolute -inset-10 bg-gradient-to-r from-evo-blue/20 to-evo-purple/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>

              {/* Real Image */}
              <img
                src="https://static.wixstatic.com/media/8c7f55_89a16dd8723b47a0837a06bc5a86db18~mv2.png"
                alt="Central EVO Dashboard"
                className="relative w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-500 z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* EVO+ Section */}
      <section className="relative py-24 bg-[#1d1d1b] overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

            {/* Image Vertical Banner */}
            <div className="w-full lg:w-5/12">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[600px] w-full">
                <img
                  src="https://static.wixstatic.com/media/8c7f55_3f86889cdcb94deb90ddf75a965ad9b5~mv2.png"
                  alt="EVO+ Experience"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>

                <div className="absolute bottom-0 left-0 p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-evo-blue via-evo-purple to-evo-orange rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <StarIcon className="w-8 h-8 text-white" filled />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Exclusividade</h3>
                  <p className="text-slate-300">Acesso privilegiado a mentores e conteúdos de alto nível.</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="w-full lg:w-7/12">
              <div className="inline-flex items-center px-4 py-2 bg-evo-orange/10 text-evo-orange rounded-full text-sm font-bold mb-6 border border-evo-orange/20">
                <DiamondIcon className="w-4 h-4 mr-2" />
                Membros EVO+
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
                Acelere sua evolução com o <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-purple to-evo-orange">EVO+</span>
              </h2>

              <p className="text-slate-300 text-lg leading-relaxed mb-10">
                Uma área dedicada para quem busca ir além. Conteúdos exclusivos, ferramentas práticas e acesso direto a conhecimentos que transformam carreiras e vidas.
              </p>

              {/* Contents Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <BenefitRow icon={<AcademicCapIcon className="w-5 h-5 text-evo-purple" />} title="Aulas Exclusivas" />
                <BenefitRow icon={<LightBulbIcon className="w-5 h-5 text-evo-orange" />} title="Reflexões Guiadas" />
                <BenefitRow icon={<PresentationChartLineIcon className="w-5 h-5 text-evo-blue" />} title="Mentorias EVO" />
                <BenefitRow icon={<BookOpenIcon className="w-5 h-5 text-yellow-500" />} title="Mini Cursos EVO+" />
                <BenefitRow icon={<MicrophoneIcon className="w-5 h-5 text-pink-500" />} title="EVO Talk" />
                <BenefitRow icon={<TagIcon className="w-5 h-5 text-green-500" />} title="Descontos Parceiros" />
              </div>

              <button
                onClick={() => handleNavigate('premium')}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Quero ser EVO+
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Pronto para se conectar?
          </h2>
          <p className="mt-4 text-lg text-gray-text">
            Junte-se à Comunidade evoapp hoje mesmo e comece a construir conexões valiosas com outros Amantes Radicais de Pessoas.
          </p>
          <div className="mt-10">
            <button
              onClick={() => openAuthModal('login')}
              className="px-10 py-4 text-lg font-semibold rounded-2xl shadow-md3-3 text-white bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange transition-all duration-300 hover:scale-105 hover:shadow-md3-6 focus:outline-none focus:ring-4 focus:ring-evo-purple/50"
            >
              Quero fazer parte da EVOAPP
            </button>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
              É gratuito para começar - Leva menos de 2 minutos - Ambiente seguro e moderado
            </p>
          </div>
        </div>
      </section>

      <Footer onNavigate={handleNavigate} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;
