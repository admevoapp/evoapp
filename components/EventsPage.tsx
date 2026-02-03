
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CalendarIcon, LocationMarkerIcon } from './icons';
import { Event } from '../types';

interface EventsPageProps {
  onViewEvent: (event: Event) => void;
}

const EventsPage: React.FC<EventsPageProps> = ({ onViewEvent }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('archived', false)
        .order('sort_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="flex items-start space-x-3 mb-2">
          <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-xl text-primary-dark dark:text-evo-purple">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Eventos Evo</h1>
            <p className="text-gray-text dark:text-slate-400">
              <span className="block font-bold text-slate-700 dark:text-slate-200 mb-1">🤍 Experiências que fortalecem a jornada</span>
              Aqui você encontra encontros e vivências para quem deseja ir além — no seu tempo, do seu jeito.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-center">
          <p className="text-lg text-gray-text animate-pulse">Carregando eventos...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden group hover:shadow-md3-6 hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image_url || 'https://picsum.photos/800/400'}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white dark:bg-surface-dark/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm border border-slate-100 dark:border-slate-700">
                    {event.category}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center text-sm text-secondary font-semibold mb-2">
                    <CalendarIcon className="w-4 h-4 mr-1.5" />
                    {event.display_date} • {event.display_time}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="flex items-start mb-4 text-gray-text dark:text-slate-400 text-sm">
                    <LocationMarkerIcon className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm line-clamp-3">
                    {event.description}
                  </p>

                  <button
                    onClick={() => onViewEvent(event)}
                    className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-primary/50 hover:text-primary transition-colors duration-200"
                  >
                    Saiba Mais
                  </button>
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <div className="bg-surface-light dark:bg-surface-dark p-12 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-center">
              <p className="text-lg text-gray-text">Nenhum evento programado no momento.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventsPage;