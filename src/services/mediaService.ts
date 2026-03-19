import { wpService } from './wooCommerceService';
import { MediaFile } from '../types';

const mapWPMediaToInternal = (media: any): MediaFile => {
    return {
        id: media.id.toString(),
        url: media.source_url,
        name: media.title.rendered,
        type: media.mime_type.startsWith('image') ? 'image' :
            media.mime_type.startsWith('video') ? 'video' : 'pdf',
        category: 'other', // WP media doesn't have categories by default
        size: 0, // WP doesn't provide size directly in this object usually
        uploadedAt: media.date
    };
};

export const mediaService = {
    /**
     * Get all media files from WordPress
     */
    async getAllMedia(): Promise<MediaFile[]> {
        const response = await wpService.get('/media', {
            params: { per_page: 100 }
        });
        return (response.data as any[]).map(mapWPMediaToInternal);
    },

    /**
     * Get media files by category (Fallback to all for WP)
     */
    async getMediaByCategory(_category: MediaFile['category']): Promise<MediaFile[]> {
        // WordPress doesn't support categories for media by default
        return this.getAllMedia();
    },

    /**
     * Add a record of a new media file to WordPress
     * Note: This usually requires a multi-part form upload
     */
    async addMedia(file: Omit<MediaFile, 'id'>): Promise<string> {
        // WordPress media upload requires raw file data.
        // Direct URL upload is not supported by the standard WP REST API.
        // We'll return a dummy ID or implement if we have the file data.
        console.warn('WordPress media upload requires raw file data. URL upload not supported directly.');
        return 'new-wp-media';
    },

    /**
     * Delete a media record by its WP ID
     */
    async deleteMedia(id: string): Promise<void> {
        await wpService.delete(`/media/${id}`, {
            params: { force: true }
        });
    }
};
