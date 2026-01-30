import React, { useState, useRef } from 'react';
import { User } from '../types';
import { PhotoIcon, XMarkIcon } from './icons';
import { supabase } from '../lib/supabaseClient';
import ImageCropperModal from './ImageCropperModal';
import { useModal } from '../contexts/ModalContext';

interface CreatePostProps {
  currentUser: User;
  onCreatePost: (content: string, imageUrl?: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onCreatePost }) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Preview URL
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Source for cropper
  const [uploadBlob, setUploadBlob] = useState<Blob | null>(null); // Blob to upload
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showAlert } = useModal();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !uploadBlob) return;

    setIsUploading(true);
    try {
      let finalImageUrl = '';

      // 1. Upload Image if exists
      if (uploadBlob) {
        const fileExt = 'jpg';
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, uploadBlob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      // 2. Insert Post into Database
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.id, // Assuming currentUser.id is the UUID from auth (or mapped)
          content: content,
          image_url: finalImageUrl || null,
        });

      if (insertError) throw insertError;

      // 3. Notify Parent
      onCreatePost(content, finalImageUrl);

      // 4. Reset Form
      setContent('');
      setSelectedImage(null);
      setUploadBlob(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error('Error creating post:', error);
      await showAlert('Erro', 'Erro ao criar publicação. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setIsCropperOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = (croppedBlob: Blob) => {
    const previewUrl = URL.createObjectURL(croppedBlob);
    setSelectedImage(previewUrl);
    setUploadBlob(croppedBlob);
    setIsCropperOpen(false);
    setImageSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input to allow re-selecting same file
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setUploadBlob(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-4">
            <img src={currentUser.avatarUrl} alt="Seu avatar" className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-slate-800" />
            <div className="flex-1">
              {currentUser.status !== 'active' ? (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium text-center">
                  Sua conta está suspensa temporariamente. Você não pode criar novas publicações.
                </div>
              ) : (
                <>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="block w-full p-4 rounded-xl border-[1.5px] border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-200 placeholder-gray-400 focus:border-[#A171FF] focus:outline-none focus:ring-4 focus:ring-[#A171FF]/20 transition-all duration-200 resize-none"
                    rows={3}
                    placeholder="O que você está pensando?"
                    disabled={isUploading}
                  ></textarea>

                  {selectedImage && (
                    <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-black/20">
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="max-h-80 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isUploading}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 pl-16">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2 text-primary hover:bg-primary-light dark:hover:bg-primary/20 rounded-full transition-colors disabled:opacity-50"
                title="Carregar do computador"
              >
                <PhotoIcon className="w-6 h-6" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
            <button
              type="submit"
              disabled={(!content.trim() && !selectedImage) || isUploading || currentUser.status !== 'active'}
              className="px-6 py-2.5 bg-gradient-to-r from-evo-purple to-evo-orange text-white font-semibold rounded-xl shadow-md3-3 hover:shadow-md3-6 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 transition-all duration-300 flex items-center"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publicando...
                </>
              ) : 'Publicar'}
            </button>
          </div>
        </form>
      </div>

      {isCropperOpen && imageSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={imageSrc}
          onClose={() => { setIsCropperOpen(false); setImageSrc(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
          onSave={handleCropSave}
          aspectRatio={0.8} // 4:5 Aspect Ratio (1080x1350)
          title="Ajustar Imagem (4:5)"
        />
      )}
    </>
  );
};

export default CreatePost;
