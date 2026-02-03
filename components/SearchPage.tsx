
import React, { useState } from 'react';
import { User } from '../types';
import { SearchIcon, LocationMarkerIcon, UserIcon, BriefcaseIcon } from './icons';
import { supabase } from '../lib/supabaseClient';
import { DEFAULT_AVATAR_URL } from '../constants';

interface SearchPageProps {
  allUsers?: User[]; // Made optional as we fetch from Supabase now
  onViewProfile?: (user: User) => void;
  currentUser?: User;
}

const behavioralProfileOptions = [
  '🔵 Analítico', '🔴 Dominante', '🟢 Estável', '🟡 Influente', '🔵🔴 Analítico + Dominante', '🔵🟢 Analítico + Estável', '🔵🟡 Analítico + Influente', '🔴🟢 Dominante + Estável', '🔴🟡 Dominante + Influente', '🔴🔵 Dominante + Analítico', '🟢🟡 Estável + Influente', '🟢🔴 Estável + Dominante', '🟢🔵 Estável + Analítico', '🟡🟢 Influente + Estável', '🟡🔴 Influente + Dominante', '🟡🔵 Influente + Analítico', '🔵🔴🟢 Analítico + Dominante + Estável', '🔵🔴🟡 Analítico + Dominante + Influente', '🔵🟢🔴 Analítico + Estável + Dominante', '🔵🟢🟡 Analítico + Estável + Influente', '🔵🟡🔴 Analítico + Influente + Dominante', '🔵🟡🟢 Analítico + Influente + Estável', '🔴🔵🟢 Dominante + Analítico + Estável', '🔴🔵🟡 Dominante + Analítico + Influente', '🔴🟢🔵 Dominante + Estável + Analítico', '🔴🟢🟡 Dominante + Estável + Influente', '🔴🟡🔵 Dominante + Influente + Analítico', '🔴🟡🟢 Dominante + Influente + Estável', '🟢🔵🔴 Estável + Analítico + Dominante', '🟢🔵🟡 Estável + Analítico + Influente', '🟢🔴🔵 Estável + Dominante + Analítico', '🟢🔴🟡 Estável + Dominante + Influente', '🟢🟡🔵 Estável + Influente + Analítico', '🟢🟡🔴 Estável + Influente + Dominante', '🟡🔵🔴 Influente + Analítico + Dominante', '🟡🔵🟢 Influente + Analítico + Estável', '🟡🔴🔵 Influente + Dominante + Analítico', '🟡🔴🟢 Influente + Dominante + Estável', '🟡🟢🔵 Influente + Estável + Analítico', '🟡🟢🔴 Influente + Estável + Dominante',
];

const initialSearchCriteria = {
  name: '',
  profession: '',
  region: '',
  city: '',
  state: '',
  country: '',
  helpArea: '',
  evoStatus: {
    pelopes: false,
    academy: false,
    family: false,
    leader: false,
    teamEngineering: false,
    missions: false,
    missionsLeader: false,
    legacy: false,
    eagles: false,
    trainer: false,
    headTrainer: false,
    partners: false,
    dominios: false,
  },
  behavioralProfile: '',
};

// Standardized Input Styles
const baseInputStyles = "block w-full rounded-xl border-[1.5px] border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-200 placeholder-gray-400 focus:border-[#A171FF] focus:outline-none focus:ring-4 focus:ring-[#A171FF]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; icon?: React.ReactNode }> =
  ({ label, name, value, onChange, placeholder, icon }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A171FF]">
            {icon}
          </div>
        )}
        <input
          type="text"
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseInputStyles} h-[48px] ${icon ? 'pl-10' : 'px-4'}`}
        />
      </div>
    </div>
  );

const SelectField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; placeholder?: string; description?: string }> =
  ({ label, name, value, onChange, options, placeholder = "Selecione uma opção", description }) => (
    <div>
      <div className="mb-1.5 ml-1">
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        {description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          className={`${baseInputStyles} h-[48px] px-4 appearance-none cursor-pointer`}
        >
          <option value="" className="bg-white dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-200">{placeholder}</option>
          {options.map(option => (
            <option key={option} value={option} className="bg-white dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-200">
              {option}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 dark:text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );

const CheckboxField: React.FC<{ label: string; name: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> =
  ({ label, name, checked, onChange }) => (
    <div className="flex items-center">
      <div className="relative flex items-center">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="appearance-none h-5 w-5 border-[1.5px] border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0D0D0D] checked:bg-[#A171FF] checked:border-[#A171FF] focus:outline-none focus:ring-2 focus:ring-[#A171FF]/20 transition-all duration-200 cursor-pointer"
        />
        <svg className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <label htmlFor={name} className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">{label}</label>
    </div>
  );

const SearchPage: React.FC<SearchPageProps> = ({ onViewProfile, currentUser }) => {
  if (currentUser && currentUser.status !== 'active') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#1C1C1E] rounded-2xl border border-white/10 animate-fade-in">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
          <SearchIcon className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
        <p className="text-slate-400">Sua conta está suspensa. Você não pode realizar pesquisas na comunidade.</p>
      </div>
    );
  }

  const [searchCriteria, setSearchCriteria] = useState(initialSearchCriteria);
  const [results, setResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSearchCriteria(prev => ({
      ...prev,
      evoStatus: { ...prev.evoStatus, [name]: checked },
    }));
  };

  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results
    setCurrentPage(1); // Reset to first page on new search

    try {
      let query = supabase.from('profiles').select('*');

      // Exclude Master Admin from search
      query = query.neq('app_role', 'master');

      // --- Server-Side Filtering ---

      if (searchCriteria.name) {
        query = query.or(`full_name.ilike.%${searchCriteria.name}%,username.ilike.%${searchCriteria.name}%`);
      }

      // Profession
      if (searchCriteria.profession) {
        query = query.ilike('profession', `%${searchCriteria.profession}%`);
      }



      // Help Area
      if (searchCriteria.helpArea) {
        query = query.ilike('help_area', `%${searchCriteria.helpArea}%`);
      }

      // Behavioral Profile (Exact match)
      if (searchCriteria.behavioralProfile) {
        query = query.eq('behavioral_profile', searchCriteria.behavioralProfile);
      }

      // Location Filters (JSONB filtering)
      // Note: Supabase JSON filtering syntax can be tricky. We use the arrow operator ->> for text comparison
      if (searchCriteria.city) {
        // This assumes 'location' column is a JSONB object with a 'city' key
        query = query.ilike('location->>city', `%${searchCriteria.city}%`);
      }
      if (searchCriteria.state) {
        query = query.ilike('location->>state', `%${searchCriteria.state}%`);
      }
      if (searchCriteria.country) {
        query = query.ilike('location->>country', `%${searchCriteria.country}%`);
      }
      // If 'region' maps to 'neighborhood' or just free text address, adjust accordingly.
      // Assuming 'neighborhood' for precision based on common Brazilian usage for "Bairro"
      if (searchCriteria.region) {
        query = query.ilike('location->>neighborhood', `%${searchCriteria.region}%`);
      }


      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (data) {
        // --- Client-Side Filtering ---
        // Some things are harder to filter efficiently in SQL/PostgREST depending on schema complexity
        // (e.g. "Does this JSON object contain ANY of these true keys?")
        // We filter Evo Status here.

        const checkedEvoStatuses = Object.entries(searchCriteria.evoStatus)
          .filter(([, checked]) => checked)
          .map(([key]) => key);

        const filteredAndMappedUsers: User[] = data.filter(profile => {
          // Evo Status Check
          if (checkedEvoStatuses.length > 0) {
            const profileEvoStatus = profile.evo_status || {};
            const hasAtLeastOneStatus = checkedEvoStatuses.some(status => profileEvoStatus[status] === true);
            if (!hasAtLeastOneStatus) return false;
          }
          return true;
        }).map(profile => ({
          // Map snake_case DB fields to camelCase User type
          id: profile.id, // Ensure ID types match (string vs number might be an issue, assuming UUIDs are strings in types or we handle it)
          name: profile.full_name || 'Sem Nome',
          username: profile.username || '',
          avatarUrl: profile.avatar_url || DEFAULT_AVATAR_URL,
          coverUrl: profile.cover_url || '',
          bio: profile.bio,
          profession: profile.profession,
          location: profile.location, // Assuming JSON structure matches
          evoStatus: profile.evo_status,
          behavioralProfile: profile.behavioral_profile,
          helpArea: profile.help_area,
          classYear: profile.class_year,
          socials: profile.socials,
          mission: profile.mission, // Added mission
          maritalStatus: profile.marital_status, // Added maritalStatus
          gallery: profile.gallery, // Added gallery
          role: profile.app_role || 'user',
          app_role: profile.app_role || 'user',
          status: 'active'
        }));

        setResults(filteredAndMappedUsers);
      }

    } catch (err: any) {
      console.error("Search error:", err);
      setError("Erro ao buscar usuários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchCriteria(initialSearchCriteria);
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        {/* Updated Header with Icon */}
        <div className="flex items-start space-x-3 mb-6">
          <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-xl text-primary-dark dark:text-evo-purple">
            <SearchIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Buscar Amantes Radicais de Pessoas</h1>
            <p className="text-gray-text dark:text-slate-400">
              Encontre, faça conexões reais.
              <br className="hidden sm:inline" />
              Busque por cidade, profissão ou interesse — e deixe o resto fluir.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="Nome / Usuário" name="name" value={searchCriteria.name} onChange={handleInputChange} placeholder="Ex: Ana Silva" />
            <InputField label="Profissão" name="profession" value={searchCriteria.profession} onChange={handleInputChange} placeholder="Ex: Desenvolvedora" />
            <InputField label="Área que pode ajudar" name="helpArea" value={searchCriteria.helpArea} onChange={handleInputChange} placeholder="Ex: UX/UI Design" />
            <InputField label="Bairro / Região" name="region" value={searchCriteria.region} onChange={handleInputChange} placeholder="Ex: Copacabana" />
            <InputField label="Cidade" name="city" value={searchCriteria.city} onChange={handleInputChange} placeholder="Ex: Rio de Janeiro" />
            <InputField label="Estado" name="state" value={searchCriteria.state} onChange={handleInputChange} placeholder="Ex: RJ" />
            <InputField label="País" name="country" value={searchCriteria.country} onChange={handleInputChange} placeholder="Ex: Brasil" />
          </div>

          <div>
            <div className="mb-2 ml-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status Evo</label>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Representa o momento da jornada de cada ARP dentro do movimento.</p>
            </div>
            <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-white dark:bg-[#0D0D0D] p-4 rounded-xl border-[1.5px] border-gray-300 dark:border-gray-700">
              <CheckboxField label="Pelopes" name="pelopes" checked={searchCriteria.evoStatus.pelopes} onChange={handleCheckboxChange} />
              <CheckboxField label="Academy" name="academy" checked={searchCriteria.evoStatus.academy} onChange={handleCheckboxChange} />
              <CheckboxField label="Family" name="family" checked={searchCriteria.evoStatus.family} onChange={handleCheckboxChange} />
              <CheckboxField label="Leader" name="leader" checked={searchCriteria.evoStatus.leader} onChange={handleCheckboxChange} />
              <CheckboxField label="Team Engineering" name="teamEngineering" checked={searchCriteria.evoStatus.teamEngineering} onChange={handleCheckboxChange} />
              <CheckboxField label="Missions" name="missions" checked={searchCriteria.evoStatus.missions} onChange={handleCheckboxChange} />
              <CheckboxField label="Missions Leader" name="missionsLeader" checked={searchCriteria.evoStatus.missionsLeader} onChange={handleCheckboxChange} />
              <CheckboxField label="Legacy" name="legacy" checked={searchCriteria.evoStatus.legacy} onChange={handleCheckboxChange} />
              <CheckboxField label="Eagles" name="eagles" checked={searchCriteria.evoStatus.eagles} onChange={handleCheckboxChange} />
              <CheckboxField label="Trainer" name="trainer" checked={searchCriteria.evoStatus.trainer} onChange={handleCheckboxChange} />
              <CheckboxField label="Head Trainer" name="headTrainer" checked={searchCriteria.evoStatus.headTrainer} onChange={handleCheckboxChange} />
              <CheckboxField label="Partners" name="partners" checked={searchCriteria.evoStatus.partners} onChange={handleCheckboxChange} />
              <CheckboxField label="Domínios" name="dominios" checked={searchCriteria.evoStatus.dominios} onChange={handleCheckboxChange} />
            </div>
          </div>

          <SelectField
            label="Perfil Comportamental"
            name="behavioralProfile"
            value={searchCriteria.behavioralProfile}
            onChange={handleInputChange}
            options={behavioralProfileOptions}
            placeholder="Todos os perfis"
            description="Ajuda você a se conectar com pessoas que se complementam ou se parecem com você."
          />

          <div className="flex justify-end items-center space-x-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={handleClear}
              className={`${baseInputStyles} w-auto h-[48px] px-6`}
            >
              Limpar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl shadow-md3-3 text-white bg-gradient-to-r from-evo-purple to-evo-orange hover:shadow-md3-6 hover:-translate-y-0.5 transition-all duration-300 h-[48px] disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : <SearchIcon className="w-5 h-5 mr-2" />}
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Resultados da Busca ({results.length})</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {hasSearched ? (
          loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-evo-purple"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col space-y-4">
              {/* Pagination Logic */}
              {(() => {
                const itemsPerPage = 5;
                const indexOfLastItem = currentPage * itemsPerPage;
                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);
                const totalPages = Math.ceil(results.length / itemsPerPage);

                const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

                return (
                  <>
                    {currentItems.map(user => (
                      <div key={user.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row items-center flex-grow text-center sm:text-left">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm mb-3 sm:mb-0 sm:mr-5"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm mb-3 sm:mb-0 sm:mr-5 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                              <UserIcon className="w-8 h-8" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{user.name}</h3>
                            <p className="text-sm text-gray-text dark:text-slate-400">@{user.username}</p>

                            {user.profession && (
                              <div className="flex items-center mt-2 text-sm text-slate-700 dark:text-slate-300">
                                <BriefcaseIcon className="w-4 h-4 mr-1.5 text-evo-purple" />
                                <span>{user.profession}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-center sm:justify-start mt-1.5 text-sm text-slate-500 dark:text-slate-400 space-x-4">
                              <div className="flex items-center">
                                <LocationMarkerIcon className="w-4 h-4 mr-1 text-evo-purple" />
                                <span>{[user.location?.city, user.location?.state].filter(Boolean).join(' / ') || 'Localização não informada'}</span>
                              </div>
                            </div>

                            {user.behavioralProfile && (
                              <div className="mt-2">
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {user.behavioralProfile}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 sm:mt-0 ml-0 sm:ml-4 flex-shrink-0">
                          <button
                            onClick={() => onViewProfile && onViewProfile(user)}
                            className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-md text-white bg-gradient-to-r from-evo-purple to-evo-orange hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                          >
                            Ver Perfil
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Pagination Controls */}
                    {results.length > itemsPerPage && (
                      <div className="flex justify-center items-center space-x-2 mt-6 pt-4">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Anterior
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 py-1 text-sm rounded-lg border ${currentPage === number
                              ? 'bg-evo-purple text-white border-evo-purple'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                          >
                            {number}
                          </button>
                        ))}

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Próxima
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-900 dark:text-slate-100 font-medium text-lg mb-1">🤍 Ainda não encontramos ninguém com esses filtros.</p>
              <p className="text-gray-text dark:text-slate-400">Tente uma busca mais simples — às vezes a melhor conexão vem do inesperado.</p>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-900 dark:text-slate-100 font-medium text-lg mb-1">🤍 Ainda não encontramos ninguém com esses filtros.</p>
            <p className="text-gray-text dark:text-slate-400">Tente uma busca mais simples — às vezes a melhor conexão vem do inesperado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
