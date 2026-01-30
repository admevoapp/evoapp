import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ShieldCheckIcon, PaperAirplaneIcon, UploadIcon } from './icons';
import { supabase } from '../lib/supabaseClient';

const ReportPage: React.FC = () => {
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
    reason: '',
    target: '',
    description: '',
    isAnonymous: true
  });

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isAnonymous: e.target.checked });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let evidenceUrl = '';

      const { data: { user } } = await supabase.auth.getUser();

      if (!formData.isAnonymous && !user) {
        throw new Error("Você precisa estar logado para enviar uma denúncia identificada.");
      }

      // Upload Evidence if exists
      if (evidenceFile) {
        if (!user) {
          throw new Error("É necessário estar logado para enviar anexos por questões de segurança. Tente enviar sem anexo ou faça login.");
        }

        const fileExt = evidenceFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('report-evidence')
          .upload(filePath, evidenceFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('report-evidence')
          .getPublicUrl(filePath);

        evidenceUrl = urlData.publicUrl;
      }

      // Insert Report
      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          reporter_id: formData.isAnonymous ? null : user?.id,
          is_anonymous: formData.isAnonymous,
          reason: formData.reason,
          target: formData.target,
          description: formData.description,
          evidence_url: evidenceUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setIsSubmitted(true);
      setFormData({ reason: '', target: '', description: '', isAnonymous: true });
      setEvidenceFile(null);

    } catch (error: any) {
      console.error('Error submitting report:', error);
      setErrorMessage(error.message || 'Erro ao enviar denúncia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full animate-fade-in-page pb-12">

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto py-10">
        <div className="inline-flex items-center px-4 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold mb-6 space-x-2 border border-red-200 dark:border-red-800">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>Canal de Segurança</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Fazer uma <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Denúncia</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Ajude-nos a manter a comunidade segura. Relate comportamentos inadequados, spam ou violações de nossas diretrizes.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-8 md:p-10 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <ShieldCheckIcon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Denúncia Recebida</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Agradecemos por ajudar a proteger nossa comunidade. Nossa equipe de moderação analisará o caso com prioridade e confidencialidade.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-8 px-6 py-2 text-evo-purple font-medium hover:underline"
              >
                Fazer nova denúncia
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-slate-50 dark:bg-[#121212] p-6 rounded-xl border border-slate-200 dark:border-slate-800 mb-8">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="w-6 h-6 text-slate-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Sua segurança é prioridade</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Todas as denúncias são tratadas com sigilo absoluto. Se você optar pelo anonimato, sua identidade não será revelada em nenhuma etapa do processo.
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm">
                  {errorMessage}
                </div>
              )}

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Violação</label>
                <select
                  id="reason"
                  name="reason"
                  required
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="">Selecione o motivo</option>
                  <option value="Spam ou Propaganda">Spam ou Propaganda Não Solicitada</option>
                  <option value="Assédio ou Intimidação">Assédio ou Intimidação</option>
                  <option value="Discurso de Ódio">Discurso de Ódio ou Discriminação</option>
                  <option value="Conteúdo Inapropriado">Conteúdo Sexual ou Violento</option>
                  <option value="Perfil Falso">Perfil Falso ou Usurpação de Identidade</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label htmlFor="target" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Link do Perfil ou Conteúdo (Opcional)</label>
                <input
                  type="text"
                  id="target"
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Link do perfil do usuário ou da postagem"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Descrição do Ocorrido</label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-y"
                  placeholder="Por favor, descreva o que aconteceu com o máximo de detalhes possível."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Evidências (Prints, imagens)</label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer block">
                  <UploadIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    {evidenceFile ? evidenceFile.name : 'Clique para adicionar arquivos (Opcional)'}
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="isAnonymous" className="ml-3 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Desejo manter minha denúncia anônima
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span>Enviar Denúncia</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;