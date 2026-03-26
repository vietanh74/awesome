import { apiClient, IResponse } from '@/core';

class CommonService {
  async uploadFile(data): Promise<IResponse> {
    return await apiClient.post('upload', data);
  }

  async uploadStreamFile(hashid, formData): Promise<IResponse> {
    return await apiClient.post(`upload-stream-file?hashid=${hashid}`, formData);
  }

  getStreamProgress(hashid: string, onMessage: (data: any) => void) {
    const controller = new AbortController();
    let lastIndex = 0;

    apiClient.get(`get-stream-progress?hashid=${hashid}`, {
      signal: controller.signal,
      onDownloadProgress: (event) => {
        const responseText = event.event?.target?.responseText || '';
        const newText = responseText.slice(lastIndex);
        lastIndex = responseText.length;

        for (const line of newText.split('\n')) {
          const trimmed = line.trim();

          if (!trimmed.startsWith('data:')) continue;

          try {
            onMessage(JSON.parse(trimmed.slice(5).trim()));
          } catch {
            // ignore parse errors
          }
        }
      },
    });

    return { close: () => controller.abort() };
  }

  async uploadPreviewImage(data): Promise<IResponse> {
    return await apiClient.post('upload-preview-image', data);
  }

  async getPreviewImages(): Promise<IResponse> {
    return await apiClient.get('preview-images');
  }

  async deletePreview(data): Promise<IResponse> {
    return await apiClient.post('delete-preview', data);
  }
  async renamePreview(data): Promise<IResponse> {
    return await apiClient.post('rename-preview', data);
  }

  async login(data): Promise<IResponse> {
    return await apiClient.post('login', data);
  }

  async getFiles(): Promise<IResponse> {
    return await apiClient.get('medias');
  }

  async fileDetail(fileId): Promise<IResponse> {
    return await apiClient.post('media-detail', {
      fileId,
    });
  }
}

export const commonService = new CommonService();
