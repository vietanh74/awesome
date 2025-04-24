import { apiClient, IResponse } from '@/core';

class CommonService {
  async uploadFile(data): Promise<IResponse> {
    return await apiClient.post('upload', data);
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
