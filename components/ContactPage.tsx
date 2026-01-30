import React, { useState, useEffect } from 'react';
import { MailIcon, PhoneIcon, LocationMarkerIcon, PaperAirplaneIcon } from './icons';

const ContactPage: React.FC = () => {
  useEffect(() => {
    const styleId = 'page-fade-in-animation';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeInPage { 
        from { opacity: 0; transform: translateY(10px); } 
        to { opacity: 1; transform: translateY(0); } 
      }
      .animate-fade-in-page { 
        animation: fadeInPage 0.5s ease-out forwards; 
      }
    `;
    document.head.appendChild(style);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct mailto link
    const subject = encodeURIComponent(`[Fale Conosco] ${formData.subject || 'Nova Mensagem'}`);
    const body = encodeURIComponent(
      `Nome: ${formData.name}\nEmail: ${formData.email}\nAssunto: ${formData.subject}\n\nMensagem:\n${formData.message}`
    );

    window.location.href = `mailto:admevoapp@gmail.com?subject=${subject}&body=${body}`;

    // Simulating form submission UI feedback
    setTimeout(() => {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start space-x-4">
      <div className="p-3 bg-evo-purple/10 rounded-xl text-evo-purple flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
        <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full animate-fade-in-page pb-12">

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto py-10">
        <div className="inline-flex items-center px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6 space-x-2">
          <MailIcon className="w-4 h-4" />
          <span>Estamos aqui para ajudar</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Fale <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">Conosco</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Tem alguma dúvida, sugestão ou quer apenas dar um oi? Nossa equipe adoraria ouvir você.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">

        {/* Contact Info (Row above form) */}
        <div className="flex flex-col gap-4 mb-12">
          <InfoCard icon={<MailIcon className="w-6 h-6" />} title="E-mail">
            <div className="flex flex-col">
              <a href="mailto:admevoapp@gmail.com" className="text-evo-purple font-medium hover:underline">admevoapp@gmail.com</a>
              <a href="mailto:parcerias@evoapp.com" className="text-evo-purple font-medium hover:underline mt-1">parcerias@evoapp.com</a>
            </div>
          </InfoCard>

          <InfoCard icon={<PhoneIcon className="w-6 h-6" />} title="Telefone">
            <p>Seg a Sex, 9h às 18h</p>
            <p className="font-medium text-slate-900 dark:text-slate-200 mt-1">(31) XXXXX-XXXX</p>
          </InfoCard>

          <InfoCard icon={<LocationMarkerIcon className="w-6 h-6" />} title="Localização">
            <p>Belo Horizonte, MG</p>
            <p className="text-xs text-slate-500 mt-1">Remote First</p>
          </InfoCard>
        </div>

        {/* Contact Form */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-8 md:p-10 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          {isSubmitted ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <PaperAirplaneIcon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mensagem Enviada!</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Obrigado pelo contato. Nossa equipe responderá sua mensagem em até 24 horas úteis.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-8 px-6 py-2 text-evo-purple font-medium hover:underline"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Envie uma mensagem</h3>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:ring-2 focus:ring-evo-purple focus:border-transparent outline-none transition-all"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:ring-2 focus:ring-evo-purple focus:border-transparent outline-none transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assunto</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:ring-2 focus:ring-evo-purple focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="">Selecione um assunto</option>
                  <option value="Suporte Técnico">Suporte Técnico</option>
                  <option value="Dúvida sobre Eventos">Dúvida sobre Eventos</option>
                  <option value="Parcerias">Parcerias</option>
                  <option value="Feedback">Feedback / Sugestão</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mensagem</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:ring-2 focus:ring-evo-purple focus:border-transparent outline-none transition-all resize-y"
                  placeholder="Como podemos ajudar você?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Enviar Mensagem</span>
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;