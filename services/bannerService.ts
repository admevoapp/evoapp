import { supabase } from '../lib/supabaseClient';
import { Banner } from '../types';

const BUCKET_NAME = 'banners';

export const bannerService = {
    async fetchBanners(): Promise<Banner[]> {
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching banners:', error);
            throw error;
        }

        // Map database fields to Banner type if needed
        return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            imageUrl: item.image_url,
            active: item.active
        }));
    },

    async createBanner(banner: Omit<Banner, 'id'>, imageFile?: File): Promise<Banner> {
        let imageUrl = banner.imageUrl;

        if (imageFile) {
            imageUrl = await this.uploadBannerImage(imageFile);
        }

        const { data, error } = await supabase
            .from('banners')
            .insert([
                {
                    title: banner.title,
                    description: banner.description,
                    image_url: imageUrl,
                    active: banner.active
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating banner:', error);
            throw error;
        }

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            imageUrl: data.image_url,
            active: data.active
        };
    },

    async updateBanner(banner: Banner, imageFile?: File): Promise<Banner> {
        let imageUrl = banner.imageUrl;

        if (imageFile) {
            imageUrl = await this.uploadBannerImage(imageFile);
        }

        const { data, error } = await supabase
            .from('banners')
            .update({
                title: banner.title,
                description: banner.description,
                image_url: imageUrl,
                active: banner.active
            })
            .eq('id', banner.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating banner:', error);
            throw error;
        }

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            imageUrl: data.image_url,
            active: data.active
        };
    },

    async deleteBanner(id: number): Promise<void> {
        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting banner:', error);
            throw error;
        }
    },

    async toggleBannerStatus(id: number, active: boolean): Promise<void> {
        const { error } = await supabase
            .from('banners')
            .update({ active })
            .eq('id', id);

        if (error) {
            console.error('Error toggling banner status:', error);
            throw error;
        }
    },

    async uploadBannerImage(file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};
