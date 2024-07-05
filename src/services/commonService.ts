import { apiClient, IResponse } from '@/core';

class CommonService {
  async uploadFile(data): Promise<IResponse> {
    return await apiClient.post('upload', data);
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
