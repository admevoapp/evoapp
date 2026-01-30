import React from 'react';
import { Event } from '../types';
import { CalendarIcon, LocationMarkerIcon, ArrowLeftIcon, ShareIcon } from './icons';

interface EventDetailsPageProps {
  event: Event;
  onBack: () => void;
}

const EventDetailsPage: React.FC<EventDetailsPageProps> = ({ event, onBack }) => {

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Confira este evento: ${event.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="w-full animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-text dark:text-slate-400 hover:text-primary mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="font-medium">Voltar para Eventos</span>
      </button>

      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="relative h-64 md:h-80 w-full">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <div className="inline-block px-3 py-1 mb-3 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wide">
              {event.category}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 shadow-sm">{event.title}</h1>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-8">
            <div className="w-full">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Sobre o Evento</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div className="w-full">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <div className="p-2 bg-primary-light dark:bg-primary/20 rounded-lg text-primary mr-3">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-text dark:text-slate-400">Data e Hora</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{event.display_date}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{event.display_time}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="p-2 bg-primary-light dark:bg-primary/20 rounded-lg text-primary mr-3">
                      <LocationMarkerIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-text dark:text-slate-400">Localização</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{event.location}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 block py-3 px-4 bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-bold text-center rounded-xl shadow-md3-3 hover:shadow-md3-6 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Garantir meu lugar
                  </a>
                  <button
                    onClick={handleShare}
                    className="md:w-auto w-full py-3 px-6 flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span>Compartilhar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;