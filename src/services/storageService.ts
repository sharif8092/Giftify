import { wpService } from './wooCommerceService';

export const storageService = {
    /**
     * Upload a file to WordPress Media Library
     * @param file The file object from input
     * @param _path Folder path (ignored for WP as it uses a flat structure or months)
     * @param onProgress Callback for upload progress
     */
    async uploadFile(
        file: File,
        _path: string,
        onProgress?: (progress: number) => void
    ): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('alt_text', file.name);
        formData.append('caption', file.name);

        const response = await wpService.post('/media', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Content-Disposition': `attachment; filename="${file.name}"`
            },
            onUploadProgress: (progressEvent: any) => {
                if (onProgress && progressEvent.total) {
                    const progress = (progressEvent.loaded / progressEvent.total) * 100;
                    onProgress(progress);
                }
            }
        } as any);

        // WordPress returns the full media object, we want the source URL
        return (response.data as any).source_url;
    },

    /**
     * Delete a file from WordPress Media Library by its URL
     * Note: This is managed via the standard WooCommerce Media API.
     * @param url The full URL of the file
     */
    async deleteFile(url: string): Promise<void> {
        // WordPress media upload requires raw file data.
        // Direct URL upload is not supported by the standard WP REST API.
        try {
            // Find media by URL first to get ID
            const filename = url.split('/').pop()?.split('?')[0];
            if (!filename) return;

            const searchResponse = await wpService.get('/media', {
                params: { search: filename }
            });

            const media = (searchResponse.data as any[]).find(m => m.source_url === url);
            if (media && media.id) {
                await wpService.delete(`/media/${media.id}`, {
                    params: { force: true }
                });
            }
        } catch (error) {
            console.error('WordPress Media Delete failed:', error);
        }
    }
};
